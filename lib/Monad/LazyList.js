import { Maybe, Trampoline } from './Bundle';

export default (() => {
  class LazyList {
    push(item) {
      return this.match({
        cons: (head, tail) => LazyList.cons(head, () => tail.push(item)),
        nil: () => LazyList.cons(item, LazyList.empty)
      });
    }

    concat(lazyList) {
      return this.match({
        cons: (head, tail) => LazyList.cons(head, () => tail.concat(lazyList)),
        nil: () => lazyList
      });
    }

    selectMany(apply) {
      return this.match({
        cons: (head, tail) => apply(head).concat(tail.selectMany(apply)),
        nil: LazyList.empty
      });
    }

    select(apply) {
      return this.match({
        cons: (head, tail) => LazyList.cons(apply(head), () => tail.select(apply)),
        nil: LazyList.empty
      });
    }

    where(predicate) {
      return this.match({
        cons: (head, tail) => predicate(head)
          ? LazyList.cons(head, () => tail.where(predicate))
          : tail.where(predicate),
        nil: LazyList.empty
      })
    }

    take(num) {
      return num <= 0
        ? LazyList.empty()
        : this.match({
            cons: (head, tail) => LazyList.cons(head, () => tail.take(num - 1)),
            nil: LazyList.empty
          });
    }

    skip(num) {
      return num <= 0
        ? this
        : this.match({
          cons: (head, tail) => tail.skip(num - 1),
          nil: LazyList.empty
        })
    }

    toArray() {
      let seq = (arr, list) =>
        list.match({
          cons: (head, tail) => Trampoline.call(() => seq(arr.concat([head]), tail)),
          nil: () => Trampoline.done(() => arr)
        });

      return seq([], this).run();
    }

    toString() {
      let seq = (str, list) =>
        list.match({
          cons: (head, tail) => Trampoline.call(() => seq(str.concat(`${head} `), tail)),
          nil: () => Trampoline.done(() => str)
        });

      return seq("", this).run().trim();
    }

    isEmpty() {
      return this.match({
        cons: () => false,
        nil: () => true
      });
    }

    static generate(generatorMaker, ...args) {      
      return {
        run(...args2) {
          let generate = (generator) =>
            Maybe.unit(generator()).match({
              just: (head) => LazyList.cons(head, () => generate(generator)),
              nothing: LazyList.empty
            });

          return generate(generatorMaker(...args.concat(args2)));
        }
      };
      return ;
    }

    static cons(head, tail) {
      return new LazyConsList(head, tail);
    }

    static empty() {
      return new LazyNilList();
    }
  }
    
  class LazyConsList extends LazyList {
    constructor(head, tail) {
      super();

      if (typeof tail !== 'function')
        throw "Tail must be a function for laziness to work";

      Object.assign(this, { head, tail });
    }

    match({ cons, nil }) {
      return cons(this.head, this.tail());
    }
  }

  class LazyNilList extends LazyList {
    constructor() {
      super();
    }

    match({ cons, nil }) {
      return nil();
    }
  }

  return { LazyList };
})();