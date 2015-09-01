export default (() => {
  "use strict";

  let Try = (() => {  
    let _Try = (() => {
      return class Try {
        constructor(value, isSuccess) {
          Object.assign(this, { value, isSuccess });
        }

        match(success, failure) {
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
      lift(fn) {
        return (...args) => {
          try {
            return new Success(fn.apply(this, args));
          } catch(e) {
            return new Failure(e);
          }
        };
      },

      unit(fn) {
        return this.lift(fn)();
      },

      bind(fn) {
        return (...args) => {
          if (args.some(x => !(x instanceof _Try))) {
            throw new Error("'bind' requires Try typed paramenters");
          }
          else if (args.some(x => x instanceof Failure)) {
            return args.filter(x => x instanceof Failure)[0];
          }

          let unwrappedValues = args.map(x => x.value);
          return this.unit(() => fn.unit(null, unwrappedValues));
        };
      }
    };
  })();

  return { Try };
})();