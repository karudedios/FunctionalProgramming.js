import { Identity } from '../Core/Bundle';
import { Either, Try } from './Bundle';

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
       * Method to get current value or a default value wrapped by a function
       * 
       * @param   {[Function]}  defaultFunction   Function with default value wrapped
       * @return  {[T]}                           T of current value or defaultFunction
       */
      getOrElse(defaultFunction) {
        return this.match({
          just: Identity,
          nothing: defaultFunction
        });
      }

      /**
       * Method to select a Maybe from a Maybe
       * 
       * @param   {[Function]}  func  Function that should return an Maybe
       * @return  {[Maybe]}           Just with applied function or Nothing
       */
      selectMany(func) {
        return this.match({
          just: v => func(v).match({
            just: Maybe.unit,
            nothing: Maybe.nothing
          }),
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
       * Extension method for Maybe which allows you to convert a potential value into either the value or an failure
       * @param  {Function} left  Function called on the Either if it's a failure
       * @return {Either}         Either the potential type or the designed error value
       */
      asEither(left) {
        return this.match({
          just: Either.right,
          nothing: () => Either.left(left())
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
          : new Nothing();8
      }

      /**
       * Abstraction for maybeObject.match
       * Useful for .match a Monad that returns a Maybe
       * 
       * @param   {[function]}  options.just    Path to take if just
       * @param   {[Function]}  options.nothing Path to take if nothing
       * @return  {[T]}                         The resolved path
       */
      static match({just, nothing}) {
        return (maybe) => maybe.match({ just, nothing });
      }

      /**
       * Abstraction for maybeObject.getOrElse
       * Useful for .match a Monad that returns a Maybe
       * 
       * @param   {[Function]}  defaultFunction   Function with default value wrapped
       * @return  {[T]}                           T of current value or defaultFunction
       */
      static getOrElse(defaultFunction) {
        return (maybe) => maybe.getOrElse(defaultFunction);
      }

      /**
       * Function to lift a function to a higher kinded type
       * To receive a potential value and return a potential value
       * @param  {Function}   fn    Function to lift
       * @return {[Function]}       Function that was lifted to a higher kinded type 
       */
      static lift(fn) {
        return (...args) => {
          return Try.unit(() => {
            return fn.apply(null, args);
          }).match({
            success: Maybe.unit,
            failure: Maybe.nothing
          });
        };
      }

      /**
       * Function to bind a function to a higher kinded type
       * To receive a value and return a potential value
       * @param  {Function}   fn    Function to bind
       * @return {[Function]}       Function that was binded to a higher kinded type 
       */
      static bind(fn) {
        return (...args) => {
          return Try.unit(() => {
            return args.some(x => !(x instanceof Maybe))
              ? Maybe.nothing()
              : args.some(x => x.isEmpty)
                ? Maybe.nothing()
                : Maybe.unit(fn.apply(null, args.map(x => x.value)));
          }).match({
            success: Identity,
            failure: Maybe.nothing
          });
        };
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