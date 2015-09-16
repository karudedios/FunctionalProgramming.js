export default (() => {
  class Tuple {
    constructor(...args) {
      let id = 0;

      for (let item of args) {
        Object.defineProperty(this, `item${++id}`, { value: item });
      }

      Object.defineProperty(this, 'items', { value: args });
    }
  }

  return {
    create(...args) {
      return new Tuple(...args);
    }
  }
})();