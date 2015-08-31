module.exports = (() => {
  let Io = (() => {
    class Io {
      constructor(f) {
        if (!(f instanceof Function)) throw "Io only accepts function as constructor parameter";
        Object.defineProperty(this, 'resolve', { value: f, enumerable: true });
      }
    }

    return {
      prototype: Io.prototype,
      
      unit(fn) {
        return new Io(fn);
      },

      lift(fn, ...defArgs) {
        return new Io(() => fn.apply(this, defArgs.concat(args)));
      }
    }
  })();

  return { Io };
})();