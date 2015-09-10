export default (() => {
  "use strict";

  let Either = (() => {
    class Either {
      constructor(value, isRight) {
        Object.assign(this, { value, isRight });
      }

      match({left, right}) {
        return this instanceof Right
          ? right(this.value)
          : left(this.value);
      }

      selectMany(func) {
        return this.match({
          right: v => func(v),
          left: () => this
        });
      }

      select(func) {
        return this.selectMany((v) => Either.unit(() => "Could not select", func(v)));
      }

      where({predicate, failure}) {
        return this.match({
          right: v => predicate(v) ? this : Either.left(failure()),
          left: () => this
        });
      }

      static left(l) {
        return new Left(l);
      }

      static right(r) {
        return new Right(r);
      }

      static unit(failFn, value) {
        if (value !== 0 && !(value && value.constructor))
          return new Left(failFn());

        let t = (new ((value).constructor)(value)).valueOf();
        let defaultValue = t.name === '' ? NaN : t;

        return (!value && value !== defaultValue)
          ? new Left(failFn())
          : new Right(value);
      }
      
      static when({predicate, right, left}) {
        return predicate
          ? new Right(right())
          : new Left(left());
      }
    }

    class Right extends Either {
      constructor(value) {
        super(value, true);
      }

      toString() {
        return `Right ${this.value}`;
      }
    }

    class Left extends Either {
      constructor(value) {
        super(value, false);
      }

      toString() {
        return `Left ${this.value}`;
      }
    }

    return Either;
  })();

  return { Either };
})();
