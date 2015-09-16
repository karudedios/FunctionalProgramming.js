export default (() => {
  class Tuple {
    constructor(...args) {
      let id = 0;

      for (let item of args) {
        Object.defineProperty(this, `item${++id}`, { value: item, enumerable: true });
      }

      Object.defineProperty(this, 'items', { value: args });
    }

    toString() {
      return `(${this.items.join(', ')})`;
    }

    static create(...args) {
      return new Tuple(...args);
    }
  }

  return { Tuple };
})();