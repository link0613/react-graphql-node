class WidgetsRegistry {
  constructor() {
    if (!WidgetsRegistry.instance) {
      this.registry = [];
      WidgetsRegistry.instance = this;
    }

    return WidgetsRegistry.instance;
  }

  /**
   *
   * @param {string}   namespace
   * @param {string}   widget
   * @param {Function} component
   * @returns {WidgetsRegistry}
   */
  add(namespace, widget, component) {
    if (!this.registry.hasOwnProperty(namespace)) {
      this.registry[namespace] = {};
    }
    this.registry[namespace][widget] = component;

    return this;
  }

  /**
   *
   * @param {string} namespace
   * @param {string} widget
   * @return {boolean}
   */
  has(namespace, widget) {
    return (
      this.registry.hasOwnProperty(namespace) &&
      this.registry[namespace].hasOwnProperty(widget)
    );
  }

  /**
   * @param {string} namespace
   * @param {string} widget
   * @return {Function}
   */
  getComponent(namespace, widget) {
    if (!this.has(namespace, widget)) {
      throw new Error(`No widget "${widget}" defined within namespace "${namespace}"`);
    }

    return this.registry[namespace][widget];
  }

  /**
   * @param {string} spec
   * @return {Function}
   */
  getComponentBySpec(spec) {
    const specParts = spec.split('.', 2);

    const namespace = specParts[0];
    const widget = specParts[1];

    return this.getComponent(namespace, widget);
  }

  widgetsCount() {
    let count = 0;

    for (const ns in this.registry) {
      count += Object.keys(this.registry[ns]).length;
    }

    return count;
  }

  /**
   * @return {Object}
   */
  list() {
    return this.registry;
  }
}

const instance = new WidgetsRegistry();
Object.freeze(instance);

export default instance;
