export default (() => {
  "use strict";

  let Io = (() => {
    class Io {
      constructor(f) {
        if (!(f instanceof Function)) throw "Io only accepts function as constructor parameter";
        Object.defineProperty(this, 'resolve', { value: f, enumerable: true });
      }

      static unit(fn) {
        return new Io(fn);
      }

      static lift(fn, ...defArgs) {
        return (...args) => new Io(() => fn.apply(this, defArgs.concat(args)));
      }
    }

    return Io;
  })();

  return { Io };
})();