export default (() => {
  "use strict";

  let Try = (() => {  
    class Try {
      constructor(value, isSuccess) {
        Object.assign(this, { value, isSuccess });
      }

      match({success, failure}) {
        return this.isSuccess
          ? success.call(this, this.value)
          : failure.call(this, this.value);
      }

      static unit(fn) {
        return this.lift(fn)();
      }

      static lift(fn) {
        return (...args) => {
          try {
            return new Success(fn.apply(this, args));
          } catch(e) {
            return new Failure(e);
          }
        };
      }

      static bind(fn) {
        return (...args) => {
          return args.some(x => !(x instanceof Try))
            ? new Failure("'bind' requires Try typed paramenters")
            : args.some(x => x instanceof Failure)
              ? args.filter(x => x instanceof Failure)[0]
              : this.unit(() => fn.apply(null, args.map(x => x.value)));
        };
      }
    }

    class Success extends Try {
      constructor(value) {
        super(value, true);
      }

      toString() {
        return `Success ${this.value}`;
      }
    }

    class Failure extends Try {
      constructor(value) {
        super(value, false);
      }

      toString() {
        return `Failure ${this.value}`;
      }
    }

    return Try;
  })();

  return { Try };
})();