module.exports = (() => {
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
    constructor(v) { super(); this.val = v; }
  }

  let call = (f) => new Call(f);
  let done = (v) => new Done(v);

  return { call, done };
})();