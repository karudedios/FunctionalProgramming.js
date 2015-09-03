export default (() => {
  "use strict";

  let Try = (() => {  
    let _Try = (() => {
      return class Try {
        constructor(value, isSuccess) {
          Object.assign(this, { value, isSuccess });
        }

        match({success, failure}) {
          return this.isSuccess
            ? success.call(this, this.value)
            : failure.call(this, this.value);
        }
      };
    })();

    class Success extends _Try {
      constructor(value) {
        super(value, true);
      }

      toString() {
        return `Success ${this.value}`;
      }
    }

    class Failure extends _Try {
      constructor(value) {
        super(value, false);
      }

      toString() {
        return `Failure ${this.value}`;
      }
    }

    return {
      prototype: _Try.prototype,

      unit(fn) {
        return this.lift(fn)();
      },

      lift(fn) {
        return (...args) => {
          try {
            return new Success(fn.apply(this, args));
          } catch(e) {
            return new Failure(e);
          }
        };
      },

      bind(fn) {
        return (...args) => {
          return args.some(x => !(x instanceof _Try))
            ? new Failure("'bind' requires Try typed paramenters")
            : args.some(x => x instanceof Failure)
              ? args.filter(x => x instanceof Failure)[0]
              : this.unit(() => fn.apply(null, args.map(x => x.value)));
        };
      }
    };
  })();

  return { Try };
})();