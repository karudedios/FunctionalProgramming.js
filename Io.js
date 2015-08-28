module.exports = (() => {
  let _Io = (() => {
    return class Io {
      constructor(f) {
        if (!(f instanceof Function)) throw "Io only accepts function as constructor parameter";
        Object.defineProperty(this, 'resolve', { value: f, enumerable: true });
      }
    }
  })();

  function Io() {};

  Object.defineProperty(Io, 'lift', {
    value: (fn) => new _Io(fn),
    enumerable: true
  });

  Object.defineProperty(Io, 'bind', {
    value: function(fn, ...defParams) {
      return (...args) => new _Io(() => fn.apply(this, defParams.concat(args)));
    },
    enumerable: true
  });
  
  return { Io };
})();