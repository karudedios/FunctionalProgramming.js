export default (() => {
  "use strict";

  let Maybe = (() => {
    class Maybe {
      constructor(isEmpty) {
        this.isEmpty = isEmpty;
      }

      /**
       * Method to decide the path the Maybe object will take
       * 
       * @param   {[Function]}  options.just    Path to take if just
       * @param   {[Function]}  options.nothing Path to take if nothing
       * @return  {[T]}                         The resolved path
       */
      match({just, nothing}) {
        return this instanceof Just
          ? just(this.value)
          : nothing();
      }

      /**
       * Method to select a Maybe from a Maybe
       * 
       * @param   {[Function]}  func  Function that should return an Maybe
       * @return  {[Maybe]}           Just with applied function or Nothing
       */
      selectMany(func) {
        return this.match({
          just: v => func(v),
          nothing: () => this
        });
      }

      /**
       * Method to select a value from a Maybe
       * 
       * @param   {[Function]}  func  Function that should return an value
       * @return  {[Maybe]}           Just with applied function or Nothing
       */
      select(func) {
        return this.selectMany((v) => Maybe.unit(func(v)));
      }

      /**
       * Method to verify if Maybe is valid
       * 
       * @param   {[Function]}  predicate Predicate function
       * @return  {[Maybe]}               Just if criteria matched or Nothing
       */
      where(predicate) {
        return this.match({
          just: v => predicate(v) ? this : Maybe.nothing(),
          nothing: () => this
        });
      }

      /**
       * Method to build a Nothing of Maybe
       * 
       * @return  {[Maybe]}     A Nothing of Maybe
       */
      static nothing() {
        return new Nothing();
      }

      /**
       * Method to validate value and return a unit of Maybe
       * 
       * @param   {[T]}         value   Value to try and turn into an Maybe
       * @return  {[Maybe]}             Maybe a Just or a Nothing
       */
      static unit(value) {
        if (value !== 0 && !(value && value.constructor))
          return new Nothing();

        let t = (new ((value).constructor)(value)).valueOf();
        let defaultValue = t.name === '' ? NaN : t;

        return (value || value === defaultValue)
          ? new Just(value)
          : new Nothing();
      }

      /**
       * Method to decide a path based on a predicate
       * 
       * @param   {[Boolean]}   options.predicate Condition to base the path with
       * @param   {[Function]}  options.just     Func that returns value for Just path
       * @return  {[Maybe]}                       Maybe a Just or a Nothing
       */
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