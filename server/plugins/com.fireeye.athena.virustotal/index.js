const fetch = require('node-fetch');
const KernelMicrotask = require('../../core/kernel/microtask');

const TEST_SHA256 = '52d3df0ed60c46f336c131bf2ca454f73bafdc4b04dfa2aea80746f5ba9e6d1c';
const API_KEY = '31b6a49c2af9a4d7040d8be757ab68b945a91bd3bb41fd1576a892a5e6341d39';
const RATE_LIMIT = 4;
const MSECS_PER_MINUTE = 60 * 1000;

class HXPlugin {
  constructor(pluginName) {
    this.task = new KernelMicrotask({});
    this.pluginName = pluginName;

    return this.register();
  }

  get inbound() {
    return `plugin.${this.pluginName}.inbound`;
  }

  get outbound() {
    return `plugin.${this.pluginName}.outbound`;
  }

  sleep(delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  async register() {
    await this.task.subscribe(this.inbound, (msg, reply, ack) => {
      if (msg.getEntityData) {
        const resourceID = '7FDE1CA2F77A0361A15875A06A7C9E17';

        fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${API_KEY}&resource=${resourceID}`)
          .then(response => response.json())
          .then((res) => {
            reply(this.outbound, {
              ...msg.getEntityData,
              body: res
            });

            this.sleep(MSECS_PER_MINUTE / RATE_LIMIT).then(() => {
              ack();
            });
          });
      }

      if (msg.resource) {
        fetch(`https://www.virustotal.com/vtapi/v2/file/report?apikey=${API_KEY}&resource=${msg.resource}`)
          .then(response => response.json())
          .then((res) => {
            reply(this.outbound, res);

            this.sleep(MSECS_PER_MINUTE / RATE_LIMIT).then(() => {
              ack();
            });
          });
      }
    });

    this.notifyRoot();
  }

  notifyRoot() {
    this.task.send('root.inbound', {
      registerPlugin: this.pluginName,
      appendSchema: {
        Alert: {
          addFields: {
            'virusTotal': 'JSON'
          }
        },
        Host: {
          addFields: {
            'virusTotal': 'JSON'
          }
        }
      }
    });
  }
}

module.exports = HXPlugin;
