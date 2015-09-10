export default (() => {
  "use strict";

  let Maybe = (() => {
    class Maybe {
      constructor(isEmpty) {
        this.isEmpty = isEmpty;
      }

      match({just, nothing}) {
        return this instanceof Just
          ? just(this.value)
          : nothing();
      }

      selectMany(func) {
        return this.match({
          just: v => func(v),
          nothing: () => this
        });
      }

      select(func) {
        return this.selectMany((v) => Maybe.unit(func(v)));
      }

      where(predicate) {
        return this.match({
          just: v => predicate(v) ? this : Maybe.nothing(),
          nothing: () => this
        });
      }

      static nothing() {
        return new Nothing();
      }

      static unit(value) {
        if (value !== 0 && !(value && value.constructor))
          return new Nothing();

        let t = (new ((value).constructor)(value)).valueOf();
        let defaultValue = t.name === '' ? NaN : t;

        return (value || value === defaultValue)
          ? new Just(value)
          : new Nothing();
      }

      static when({predicate, just}) {
        return predicate
          ? new Just(just())
          : new Nothing();
      }
    }

    class Nothing extends Maybe {
      constructor() {
        super(true);
      }

      toString() {
        return 'Nothing';
      }
    }

    class Just extends Maybe {
      constructor(value) {
        super(false);
        this.value = value;
      }

      toString() {
        return `Just ${this.value}`;
      }
    }

    return Maybe;
  })();

  return { Maybe };
})();