import { Identity, ThrowException } from '../Core/Bundle';

export default (() => {
  "use strict";

  let Try = (() => {  
    class Try {
      constructor(value, isSuccess) {
        Object.assign(this, { value, isSuccess });
      }

      /**
       * Method to decide the path the Try object will take
       * 
       * @param   {[Function]}  options.success     Path to take if success
       * @param   {[Function]}  options.failure     Path to take if failure
       * @return  {[T]}                             The resolved path
       */
      match({success, failure}) {
        return this.isSuccess
          ? success.call(this, this.value)
          : failure.call(this, this.value);
      }

      /**
       * Method to match current try, if success the holded value will be returned
       * Otherwise an exception will be thrown
       * 
       * @return  {[T]}     T of the holded value by the Try
       * @throws {[Error]}  If Try is a Failure
       */
      getOrThrow() {
        return this.match({
          success: Identity,
          failure: ThrowException
        });
      }

      /**
       * Method to select a Try from a Try
       * 
       * @param   {[Function]}  func  Function that should return an Try
       * @return  {[Try]}             Success with applied function or Failure
       */
      selectMany(func) {
        return this.match({
          success: v => func(v),
          failure: () => this
        });
      }

      /**
       * Method to select a value from a Try
       * 
       * @param   {[Function]}  func  Function that should return an value
       * @return  {[Try]}             Success with applied function or Failure
       */
      select(func) {
        return this.selectMany((v) => Try.unit(() => func(v)));
      }

      /**
       * Method to verify if Try is valid
       * 
       * @param   {[Function]}  options.predicate Predicate function
       * @param   {[Function]}  options.failure   Failure scenario resolution
       * @return  {[Try]}                         Success if criteria matched or Failure
       */
      where({predicate, failure}) {
        return this.match({
          success: v => predicate(v) ? this : new Failure(failure()),
          failure: () => this
        });
      }

      /**
       * Method to validate value and return a unit of Try
       * 
       * @param   {[T]}         value   Value to try and turn into an Try
       * @return  {[Try]}               Try a Success or a Failure
       */
      static unit(fn) {
        return this.lift(fn)();
      }

      /**
       * Method to up-lift a function in order to receive regular parameters
       * and output function resolution wrapped on a Try Object.
       * 
       * @param   {Function}  fn  Function to lift
       * @return  {[Try]}         Success or Failure
       */
      static lift(fn) {
        return (...args) => {
          try {
            return new Success(fn.apply(this, args));
          } catch(e) {
            return new Failure(e);
          }
        };
      }

      /**
       * Method to up-lift a function in order to receive Try parameters
       * and output function resolution wrapped on a Try Object.
       * 
       * @param   {Function}  fn  Function to bind
       * @return  {[Try]}         Success or Failure
       */
      static bind(fn) {
        return (...args) => {
          return args.some(x => !(x instanceof Try))
            ? new Failure("'bind' requires Try typed paramenters")
            : args.some(x => x instanceof Failure)
              ? args.filter(x => x instanceof Failure)[0]
              : this.unit(() => fn.apply(null, args.map(x => x.value)));
        };
      }

      /**
       * Abstraction for tryObject.match
       * Useful for .match a Monad that returns a Try
       * 
       * @param   {[Function]}  options.success     Path to take if success
       * @param   {[Function]}  options.failure     Path to take if failure
       * @return  {[T]}                             The resolved path
       */
      static match({success, failure}) {
        return (_try) => _try.match({success, failure});
      }


      /**
       * Abstraction for tryObject.getOrThrow
       * Useful for .match a Monad that returns a Try
       * 
       * @return  {[T]}     T of the holded value by the Try
       * @throws {[Error]}  If Try is a Failure
       */
      static getOrThrow() {
        return (_try) => _try.getOrThrow();
      }
    }

    class Success extends Try {
      constructor(value) {
        super(value, true);
      }

      toString() {
        return `Success ${this.value}`;
      }
    }

    class Failure extends Try {
      constructor(value) {
        super(value, false);
      }

      toString() {
        return `Failure ${this.value}`;
      }
    }

    return Try;
  })();

  return { Try };
})();