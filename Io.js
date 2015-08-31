module.exports = (() => {
  let _Io = (() => {
    return class Io {
      constructor(f) {
        if (!(f instanceof Function)) throw "Io only accepts function as constructor parameter";
        Object.defineProperty(this, 'resolve', { value: f, enumerable: true });
      }
    }
  })();

  let Io = {
    lift(fn) {
      return new _Io(fn);
    },
    bind(fn, ...defArgs) {
      return new _Io(() => fn.apply(this, defArgs.concat(args)));
    }
  }

  return { Io };
})();