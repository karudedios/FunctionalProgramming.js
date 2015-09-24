import { Tuple } from './Bundle';

export default (() => {
  let nil = new (class Nil {});
  
  class List {
    size() {
      return this.match({
        cons: (head, tail) => 1 + tail.size(),
        nil: () => 0
      })
    }

    push(value) {
      return this.match({
        cons: (head, tail) => List.cons(head, tail.push(value)),
        nil: () => List.cons(value, List.nil())
      });
    }

    concat(list) {
      return this.match({
        cons: (head, tail) => List.cons(head, tail.concat(list)),
        nil: () => list
      });
    }

    getAt(index) {
      return this.match({
        cons: (head, tail) => {
          return index <= 0
            ? head
            : tail.getAt(index - 1)
        },
        nil: () => null
      })
    }

    reverse() {
      return this.match({
        cons: (head, tail) => tail.reverse().push(head),
        nil: List.nil
      });
    }

    selectMany(apply) {
      return this.match({
        cons: (head, tail) => apply(head).concat(tail.selectMany(apply)),
        nil: List.nil
      });
    }

    select(apply) {
      return this.match({
        cons: (head, tail) => List.cons(apply(head), tail.select(apply)),
        nil: List.nil
      });
    }

    where(predicate) {
      return this.match({
        cons: (head, tail) => predicate(head)
          ? List.cons(head, tail.where(predicate))
          : tail.where(predicate),
        nil: List.nil
      })
    }

    fold(defaultValue, apply) {
      return this.match({
        cons: (head, tail) => tail.fold(apply(defaultValue, head), apply),
        nil: () => defaultValue
      });
    }

    forEach(action) {
      return this.match({
        cons: (head, tail) => {
          action(head);
          return tail.forEach(action);
        },
        nil: List.nil
      })
    }

    any(predicate) {
      return this.match({
        cons: (head, tail) => predicate(head) ? true : tail.any(predicate),
        nil: () => false
      });
    }

    every(predicate) {
      return this.match({
        cons: (head, tail) => predicate(head) ? tail.every(predicate) : false,
        nil: () => true
      });
    }

    take(num) {
      return num <= 0
        ? List.nil()
        : this.match({
            cons: (head, tail) => List.cons(head, tail.take(num - 1)),
            nil: List.nil
          });
    }

    skip(num) {
      return num <= 0
        ? this
        : this.match({
          cons: (head, tail) => tail.skip(num - 1),
          nil: List.nil
        })
    }

    splitAt(num) {
      return Tuple.create(this.take(num), this.skip(num));
    }

    zipWith(list) {
      return this.match({
        cons: (head1, tail1) =>
          list.match({
            cons: (head2, tail2) =>
              List.cons(Tuple.create(head1, head2), tail1.zipWith(tail2)),
            nil: () => List.cons(Tuple.create(head1, nil), List.nil())
          }),
        nil: List.nil
      });
    }

    clone() {
      return this.match({
        cons: (head, tail) => List.cons(head, tail.copy()),
        nil: List.nil
      });
    }

    toString() {
      return this.match({
        cons: (head, tail) => tail.match({
          cons: (_, __) => `${head} ${tail.toString()}`,
          nil: () => `${head}`
        }),
        nil: () => "Empty"
      });
    }

    isEmpty() {
      return this.match({
        cons: () => false,
        nil: () => true
      });
    }

    static nil() {
      return new NilList();
    }

    static cons(value, tail = List.nil()) {
      return new ConsList(value, tail)
    }

    static make(...args) {
      return args.reduceRight((cons, value) => List.cons(value, cons), List.nil());
    }
  }

  class ConsList extends List {
    constructor(head, tail) {
      super();
      Object.assign(this, { head, tail });
    }

    match({ cons, nil }) {
      return cons(this.head, this.tail);
    }
  }

  class NilList extends List {
    constructor() {
      super();
    }

    match({ cons, nil }) {
      return nil();
    }
  }

  return { List };
})();