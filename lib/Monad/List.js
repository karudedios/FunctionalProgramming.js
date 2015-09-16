import { Tuple } from './Bundle';

export default (() => {
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
        nil: () => List.cons(value, List.empty())
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
        nil: List.empty
      });
    }

    selectMany(apply) {
      return this.match({
        cons: (head, tail) => apply(head).concat(tail.selectMany(apply)),
        nil: () => List.empty
      });
    }

    select(apply) {
      return this.match({
        cons: (head, tail) => List.cons(apply(head), tail.select(apply)),
        nil: List.empty
      });
    }

    where(predicate) {
      return this.match({
        cons: (head, tail) => predicate(head)
          ? List.cons(head, tail.where(predicate))
          : tail.where(predicate),
        nil: List.empty
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
        nil: List.empty
      })
    }

    take(num) {
      return num <= 0
        ? List.empty()
        : this.match({
            cons: (head, tail) => List.cons(head, tail.take(num - 1)),
            nil: List.empty
          });
    }

    skip(num) {
      return num <= 0
        ? this
        : this.match({
          cons: (head, tail) => tail.skip(num - 1),
          nil: List.empty
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
            nil: () => List.empty
          }),
        nil: List.empty
      });
    }

    clone() {
      return this.match({
        cons: (head, tail) => List.cons(head, tail.copy()),
        nil: List.empty
      });
    }

    toString() {
      return this.match({
        cons: (head, tail) => tail.match({
          cons: (_, __) => `${head}, ${tail.toString()}`,
          nil: () => `${head}.`
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

    static empty() {
      return new EmptyList();
    }

    static cons(value, tail = List.empty()) {
      return new NonEmptyList(value, tail)
    }

    static make(...args) {
      return args.reduceRight((cons, value) => List.cons(value, cons), List.cons(args.pop(), new EmptyList()));
    }
  }

  class NonEmptyList extends List {
    constructor(head, tail) {
      super();
      Object.assign(this, { head, tail });
    }

    match({ cons, nil }) {
      return cons(this.head, this.tail);
    }
  }

  class EmptyList extends List {
    constructor() {
      super();
    }

    match({ cons, nil }) {
      return nil();
    }
  }

  return { List };
})();