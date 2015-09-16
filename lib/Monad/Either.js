import { Identity } from '../Core/Bundle';
import { Maybe, Try } from './Bundle';

export default (() => {
  "use strict";

  let Either = (() => {
    class Either {
      constructor(value, isRight) {
        Object.assign(this, { value, isRight });
      }

      /**
       * Method to decide the path the Either object will take
       * 
       * @param   {[Function]}  options.left   Path to take if left
       * @param   {[Function]}  options.right  Path to take if right
       * @return  {[T]}                        The resolved path
       */
      match({left, right}) {
        return this instanceof Right
          ? right(this.value)
          : left(this.value);
      }

      /**
       * Method to select an Either from an Either
       * 
       * @param   {[Function]}  func  Function that should return an Either
       * @return  {[Either]}          Right with applied function or Left
       */
      selectMany(func) {
        return this.match({
          right: v => func(v),
          left: () => this
        });
      }

      /**
       * Method to select a value from an Either
       * 
       * @param   {[Function]}  func  Function that should return a value
       * @return  {[Either]}          Right with applied function or Left
       */
      select(func) {
        return this.selectMany((v) => Either.unit(() => "Could not select", func(v)));
      }

      /**
       * Method to verify if Either is valid
       * 
       * @param   {[Function]}  options.predicate Predicate function
       * @param   {[Function]}  options.failure   Failure scenario resolution
       * @return  {[Either]}                      Right if criteria matched or Left
       */
      where({predicate, failure}) {
        return this.match({
          right: v => predicate(v) ? this : Either.left(failure()),
          left: () => this
        });
      }

      /**
       * Extension method for Either which allows you to convert either a value or a failure into a potential value
       * @return {Maybe}  A potential value or nothing
       */
      toMaybe() {
        return this.match({
          left: Maybe.nothing,
          right: Maybe.unit
        });
      }

      /**
       * Method to build a Left of Either
       * 
       * @param   {[T]}       l  Left value
       * @return  {[Either]}     A Left of Either
       */
      static left(l) {
        return new Left(l);
      }

      /**
       * Method to build a Right of Either
       * 
       * @param   {[T]}       r  Right value
       * @return  {[Either]}     A Right of Either
       */
      static right(r) {
        return new Right(r);
      }

      /**
       * Method to validate value and return a unit of Either
       * 
       * @param   {[Function]}  failFn  Left scenario
       * @param   {[T]}         value   Value to try and turn into an Either
       * @return  {[Either]}            Either a Right or a Left
       */
      static unit(failFn, value) {
        if (value !== 0 && !(value && value.constructor))
          return new Left(failFn());

        let t = (new ((value).constructor)(value)).valueOf();
        let defaultValue = t.name === '' ? NaN : t;

        return (!value && value !== defaultValue)
          ? new Left(failFn())
          : new Right(value);
      }
      
      /**
       * Method to decide a path based on a predicate
       * 
       * @param   {[Boolean]}   options.predicate Condition to base the path with
       * @param   {[Function]}  options.right     Func that returns value for Right path
       * @param   {[Function]}  options.left      Func that returns value for Left path
       * @return  {[Either]}                      Either a Left or a Right
       */
      static when({predicate, right, left}) {
        return predicate
          ? new Right(right())
          : new Left(left());
      }

      /**
       * Abstraction for eitherObject.match
       * Useful for .match a Monad that returns an Either
       * 
       * @param   {[Function]}  options.left   Path to take if left
       * @param   {[Function]}  options.right  Path to take if right
       * @return  {[T]}                        The resolved path
       */
      static match({left, right}) {
        return (either) => either.match({ left, right });
      }

      /**
       * Function to lift a function to a higher kinded type
       * To receive value and return Either value or failure
       * @param  {[Function]} fail  Failure to evaluate if left
       * @param  {Function}   fn    Function to lift
       * @return {[Function]}       Function that was lifted to a higher kinded type 
       */
      static lift(fail, fn) {
        return (...args) => {
          return Try.unit(() => {
            return fn.apply(null, args);
          }).match({
            success: (v) => Either.unit(fail, v),
            failure: Either.left
          });
        };
      }

      /**
       * Function to bind a function to a higher kinded type
       * To receive Either and return Either value or failure
       * @param  {[Function]} fail  Failure to evaluate if left
       * @param  {Function}   fn    Function to bind
       * @return {[Function]}       Function that was binded to a higher kinded type 
       */
      static bind(fail, fn) {
        return (...args) => {
          return Try.unit(() => {
            return args.some(x => !(x instanceof Either))
              ? Either.left(fail())
              : args.some(x => !x.isRight)
                ? args.filter(x => !x.isRight)[0]
                : Either.unit(fail, fn.apply(null, args.map(x => x.value)));
          }).match({
            success: Identity,
            failure: () => Either.left(fail())
          });
        };
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
