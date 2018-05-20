const amqp = require('amqplib');
const uuid = require('uuid');

const sleep = require('./sleep');

const DEFAULT_MB_HOST = process.env.MB_HOST || 'localhost';
const DEFAULT_MB_EXCHANGE = process.env.MB_EXCHANGE || 'com.fireeye.athena.exchange';

class KernelMicrotask {
  /**
   * @param  {object} opts                    Task instance options
   * @param  {string} opts.host               RabbitMQ host to use
   * @param  {string} opts.exchange           RabbitMQ exchange to use
   * @param  {Number} opts.reconnectTimeout   Timeout before trying to reconnect to RabbitMQ on failure
   * @return {void}
   */
  constructor({
                host = DEFAULT_MB_HOST,
                exchange = DEFAULT_MB_EXCHANGE,
                reconnectTimeout = 5000,
                loggingTransports,
                defaultQueueConfig = {
                  durable: true,
                  autoDelete: true
                },
                defaultConsumeConfig = {
                  noAck: false
                },
                defaultSubscribeConfig = {
                  ack: false
                },
                defaultSendConfig = {},
              }) {
    /**
     * Service unique ID
     * @type {string}
     */
    this.id = uuid.v4();

    /**
     * RabbitMQ host address
     * @type {string}
     */
    this.host = host;

    /**
     * RabbitMQ exchange name
     * @type {string}
     */
    this.exchange = exchange;

    /**
     * Active route handlers and queues
     * @type {Object}
     */
    this.routeHandlers = {};

    /**
     * Connecting indicator
     * @type {Boolean}
     * @private
     */
    this.connecting = false;

    /**
     * Connection to RabbitMQ instance
     * @type {Object}
     * @private
     */
    this.connection = undefined;

    /**
     * Connection to RabbitMQ instance
     * @type {Object}
     * @private
     */
    this.channel = undefined;

    /**
     * Reconnect timeout reference
     * @type {Number}
     * @private
     */
    this.reconnect = undefined;

    /**
     * Reconnect timeout timer stored for later usage
     * @type {Number}
     */
    this.reconnectTimeout = reconnectTimeout;

    /**
     * Default config for queue creation used during subscription
     * @type {Object}
     */
    this.defaultQueueConfig = defaultQueueConfig;

    /**
     * Default config for queue consumption used during subscription
     * @type {Object}
     */
    this.defaultConsumeConfig = defaultConsumeConfig;

    /**
     * Default config for subscription
     * @type {Object}
     */
    this.defaultSubscribeConfig = defaultSubscribeConfig;

    /**
     * Default config for sending out messages
     * @type {Object}
     */
    this.defaultSendConfig = defaultSendConfig;

    this.initLogger(loggingTransports);

    this.connect().catch(this.tryReconnect.bind(this));
  }

  /**
   * Initialize logger with new options
   * @param  {Object} transports   Logger options, see winston.js for reference
   * @return {void}
   * @private
   */
  initLogger(transports = []) {
    if (transports.length === 0) {
      let level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

      /* istanbul ignore if  */
      if (process.env.NODE_ENV === 'test') {
        level = 'error';
      }
    }

    this.logger = console;
  }

  tryReconnect(e) {
    const reconnectError = e.code === 'ECONNREFUSED' || e.message === 'Socket closed abruptly during opening handshake';

    if (reconnectError && !this.reconnect) {
      this.logger.info(`Couldn't connect to rabbit, retrying in ${Math.floor(this.reconnectTimeout / 1000)}s...`);
      this.connecting = false;

      this.reconnect = setTimeout(() => {
        this.reconnect = undefined;
        this.connect(true).catch(this.tryReconnect.bind(this));
      }, this.reconnectTimeout);
      return;
    }

    this.logger.error('Error connecting:', e);

    throw e;
  }

  /**
   * Register new Task plugin
   * @param  {Object} plugin      Task plugin object
   * @return {void}
   * @example
   * const myTaskPlugin = require('my-task-plugin');
   * taskInstance.registerPlugin(myTaskPlugin);
   */
  registerPlugin(plugin) {
    /* eslint-disable no-restricted-syntax, no-prototype-builtins */
    for (const prop in plugin) {
      if (!this.hasOwnProperty(prop)) {
        this[prop] = plugin[prop];
      }
    }
    /* eslint-enable no-restricted-syntax, no-prototype-builtins */
  }

  /**
   * Initializes connection to RabbitMQ
   * @param  {Boolean} calledFromTimer    Defines whether function was called from reconnect timer
   * @return {Promise}                    Returns promise that can be awaited to ensure connection
   * @private
   */
  async connect(calledFromTimer = false) {
    if (!calledFromTimer && this.reconnect) {
      return sleep(this.reconnectTimeout).then(() => this.connect());
    }

    if (this.connecting) {
      return sleep(50).then(() => this.connect());
    }

    if (this.connection) {
      return true;
    }

    this.logger.log(`${this.id}. Connecting...`);

    this.connecting = true;

    this.connection = await amqp.connect(`amqp://${this.host}`);
    this.logger.debug(`${this.id}. Connected established to ${this.host}`);

    this.channel = await this.connection.createChannel();
    this.logger.log(`${this.id}. Got channels`);

    await this.channel.assertExchange(this.exchange, 'topic');
    this.logger.log(`${this.id}. Got exchanges`);

    await this.channel.prefetch(1);
    this.logger.log(`${this.id}. Prefetch set`);

    this.connecting = false;

    return true;
  }

  /**
   * Removes existing subscription or worker.
   * If consumerTag is given only corresponding subscription will be removed.
   * Otherwise, all consumers for given topic will be terminated.
   * @param  {string} topic         Topic to remove subscription/worker from
   * @param  {string} consumerTag   Consumer tag to unsubscribe with
   * @return {Promise} Returns promise that can be awaited to ensure removal
   * @example <caption>Remove one subscription with consumerTag</caption>
   * await taskInstance.unsubscribe('test.topic', 'tag');
   * @example <caption>Remove all subscriptions with topic</caption>
   * await taskInstance.unsubscribe('test.topic');
   */
  async unsubscribe(topic, consumerTag) {
    if (consumerTag) {
      const subIndex = this.routeHandlers[topic].findIndex(it => it.consumerTag === consumerTag);

      await this.channel.cancel(consumerTag);
      this.routeHandlers[topic].splice(subIndex, 1);

      return;
    }

    await Promise.all(this.routeHandlers[topic].map(it => this.channel.cancel(it.consumerTag)));

    delete this.routeHandlers[topic];
  }

  /**
   * Stops the service, closes all workers/subscriptions and terminates the connection to RabbitMQ
   * @return {Promise} Returns promise that can be awaited to ensure termination
   * @example
   * await taskInstance.stop();
   */
  async stop() {
    if (!this.connection && this.reconnect) {
      this.logger.debug(`${this.id}. Not connected, cleaning reconnect timeout`);

      clearTimeout(this.reconnect);

      return;
    }

    this.logger.debug('cleaning up routes subscriptions');
    const paths = Object.keys(this.routeHandlers);
    if (paths.length) {
      await Promise.all(paths.map(path => this.unsubscribe(path)));
    }

    this.logger.debug(`${this.id}. Closing channel`);
    await this.channel.close();

    this.logger.debug(`${this.id}. Closing RabbitMQ connection`);
    await this.connection.close();
  }

  /**
   * Send given data to the specified topic
   * @param  {string} topic Topic to send data to
   * @param  {Any}    data  Data to send
   * @param  {Object} opts  Publish options for RabbitMQ
   * @return {Promise}      Returns promise that can be awaited to ensure termination
   * @example
   * await taskInstance.send('test.topic', 'test');
   * await taskInstance.send('test.topic', {json: 'works too'});
   */
  async send(topic, data = '', opts = {}) {
    if (!topic) {
      return;
    }

    await this.connect();

    this.logger.debug(`${this.id}. Sending to `, topic, 'data:', data);

    const publishOpts = Object.assign(this.defaultSendConfig, opts);
    this.channel.publish(this.exchange, topic, new Buffer(JSON.stringify(data)), publishOpts);
  }

  /**
   * Create subscription to given topic that will pass all incoming messages to given handler
   * @param  {string}   topic          Topic to subscribe to
   * @param  {Function} handler        Handler function that will get all incoming messages
   * @param  {Object}   queueConfig    Queue config to pass to RabbitMQ
   * @param  {Object}   consumeConfig  Consume config to pass to RabbitMQ
   * @param  {Object}   config         Config for subscriber (e.g. wether to auto-ack messages)
   * @return {string}                  Consumer tag that can be used for more precise unsubscribe action
   * @example <caption>Simple subscribe usage</caption>
   * await taskInstance.subscribe('test.topic', (msg, reply) => {
   *  if (msg === 'ping') {
   *    reply('test.reply', 'pong');
   *  }
   * });
   * @example <caption>Subscribe with custom RabbitMQ options</caption>
   * await taskInstance.subscribe('test.topic', (msg, reply) => {
   *  if (msg === 'ping') {
   *    reply('test.reply', 'pong');
   *  }
   * }, {durable: true, autoDelete: true, exclusive: true});
   * @example <caption>Subscribe without auto-ack</caption>
   * await taskInstance.subscribe('test.topic', (msg, reply, ack, nack) => {
   *  if (msg === 'ping') {
   *    ack();
   *    reply('test.reply', 'pong');
   *  } else {
   *    nack();
   *  }
   * }, {}, {}, {ack: false});
   */
  async subscribe(topic, handler, userQueueConfig = {}, userConsumeConfig = {}, userConfig = {}) {
    const queueConfig = Object.assign(this.defaultQueueConfig, userQueueConfig);

    const consumeConfig = Object.assign(this.defaultConsumeConfig, userConsumeConfig);

    const config = Object.assign(this.defaultSubscribeConfig, userConfig);

    await this.connect();

    this.logger.debug(`${this.id}. Adding worker for: ${topic}`);
    const {queue} = await this.channel.assertQueue(`task-${topic}-queue`, queueConfig);
    await this.channel.bindQueue(queue, this.exchange, topic);
    this.logger.log(`${this.id}. Bound queue...`);

    this.logger.log(`${this.id}. Initiating consuming...`);

    const {consumerTag} = await this.channel.consume(
      queue,
      (data) => {
        if (!data) {
          return;
        }
        const msg = JSON.parse(data.content.toString());

        if (config.ack) {
          this.channel.ack(data);
        }

        const reply = this.send.bind(this);
        const ack = this.channel.ack.bind(this.channel, data);
        const nack = this.channel.nack.bind(this.channel, data);

        handler(msg, reply, ack, nack, data);
      },
      consumeConfig
    );

    if (!this.routeHandlers[topic]) {
      this.routeHandlers[topic] = [];
    }

    this.routeHandlers[topic].push({
      queue,
      consumerTag,
    });

    return consumerTag;
  }
}

module.exports = KernelMicrotask;
