const KernelMicrotask = require('../../core/kernel/microtask');

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

  async register() {
    await this.task.subscribe(this.inbound, (msg, reply, ack, nack) => {
      ack();
    });

    this.notifyRoot();
  }

  notifyRoot() {
    this.task.send('root.inbound', {
      registerPlugin: this.pluginName
    });
  }
}

module.exports = HXPlugin;
