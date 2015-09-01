export default (() => {
  "use strict";

  let Trampoline = (() => {
    class Bounce {
      run() {
        class Empty {}
        let step = this;
        let result = new Empty();

        while(result instanceof Empty) {
          if (step instanceof Call) {
            step = step.thunk();
          } else if (step instanceof Done) {
            result = step.val();
          }
        }

        return result;
      }
    }

    class Call extends Bounce {
      constructor(fn) { super(); this.thunk = fn; }
    }

    class Done extends Bounce {
      constructor(f) { super(); this.val = f; }
    }

    return { 
      call(f) {
        return new Call(f);
      },

      done(f) {
        return new Done(f);
      },

      build({ predicate, call, done, init }) {
        return (...args) => {
          let step = (...subArgs) => predicate.apply(null, subArgs)
            ? new Done(() => done.apply(null, subArgs.concat([step])))
            : new Call(() => call.apply(null, subArgs.concat([step])));

          return (init || (x => x)).apply(null, [step].concat(args)).run();
        };
      }
    };
  })();

  return { Trampoline };
})();