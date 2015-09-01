export default (() => {
  let Trampoline = (() => {
    class Bounce {
      run() {
        class Empty {};
        let step = this;
        let result = new Empty;

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

    let trampoline = (_predicate, _call, _done, _init) => (...args) => {
      let step = (...subArgs) => _predicate.apply(null, subArgs)
        ? done(() => _done.apply(null, subArgs.concat([step])))
        : call(() => _call.apply(null, subArgs.concat([step])));

      return (_init || ((x) => x)).apply(null, [step].concat(args)).run();
    }

    return { 
      call(f) {
        return new Call(f);
      },

      done(f) {
        return new Done(f)
      },

      build({ predicate, call, done, init = (x => x) }) {
        return (...args) => {
          let step = (...subArgs) => predicate.apply(null, subArgs)
            ? new Done(() => done.apply(null, subArgs.concat([step])))
            : new Call(() => call.apply(null, subArgs.concat([step])));

          return init.apply(null, [step].concat(args)).run();
        }
      }
    }
  })();

  return { Trampoline };
})();