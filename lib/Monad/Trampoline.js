export default (() => {
  "use strict";

  let Trampoline = (() => {
    class Bounce {
      run() {
        let result = this;

        while(result instanceof Bounce) {
          result = result instanceof Call
            ? result.thunk()
            : result.val();
        }

        return result;
      }
    }

    class Call extends Bounce {
      constructor(fn) { super(); this.thunk = fn; }

      toString() {
        return 'Pending';
      }
    }

    class Done extends Bounce {
      constructor(f) { super(); this.val = f; }

      toString() {
        return 'Done';
      }
    }

    return { 
      call(f) {
        return new Call(f);
      },

      done(f) {
        return new Done(f);
      },

      build({ predicate, call, done, init }) {
        let f = (...args) => {
          let step = (...subArgs) => predicate.apply(null, subArgs)
            ? this.done(() => done.apply(null, subArgs.concat([step, f])))
            : this.call(() => call.apply(null, subArgs.concat([step, f])));

          return (init
            ? init.apply(null, [step].concat(args))
            : step.apply(null, args)).run();
        };

        return f;
      }
    };
  })();

  return { Trampoline };
})();