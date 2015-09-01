import { Trampoline, Either, Maybe, Try, Io } from '../lib/index';

export default (() => {
  "use strict";

  Object.assign(Either.prototype, {
    /**
     * Extension method for Either which allows you to convert either a value or a failure into a potential value
     * @return {Maybe}  A potential value or nothing
     */
    toMaybe() {
      return this.match({
        left: () => Maybe.nothing(),
        right: (v) => Maybe.unit(v)
      });
    }
  });

  Object.assign(Maybe.prototype, {
    /**
     * Extension method for Maybe which allows you to convert a potential value into either the value or an failure
     * @param  {Function} left  Function called on the Either if it's a failure
     * @return {Either}         Either the potential type or the designed error value
     */
    asEither(left) {
      return this.match({
        just: (v) => Either.right(v),
        nothing: () => Either.left(left())
      });
    },

    /**
     * Extension method for Maybe which allows you to specify scenarios in which the result will be a Nothing
     * @param  {Function} failFn  Criteria to match
     * @param  {String} exception Exception to be thrown
     * @return {Maybe}            A potential value or nothing
     */
    failWhen(failFn, exception) {
      var self = this;
      return Try.attempt(function() {
        if (failFn.call(this, self.value)){
          throw exception;
        }

        return self;
      }).match({
        success: (v) => v,
        failure: () => Maybe.nothing()
      });
    }
  });
  
	Object.assign(Try.prototype, {
    /**
     * Extension method for Try which allows you to convert an attempt of a value to either a value or a failure
     * @return {Either}   Either a value or a failure
     */
    asEither() {
      return this.match({
        success: (v) => Either.right(v),
        failure: (v) => Either.left(v)
      });
    },

    /**
     * Extension method for Try which allows you to convert an attempt of a value to a potential value or nothing
     * @return {Maybe}   Potential value or nothing
     */
    toMaybe() {
      return this.match({
        success: (v) => Maybe.unit(v),
        failure: () => Maybe.nothing()
      });
    }
  });

  Object.assign(Either, {
    /**
     * Function to lift a function to a higher kinded type
     * To receive value and return Either value or failure
     * @param  {[Function]} fail  Failure to evaluate if left
     * @param  {Function}   fn    Function to lift
     * @return {[Function]}       Function that was lifted to a higher kinded type 
     */
    lift(fail, fn) {
      return (...args) => {
        return Try.unit(() => {
          return fn.apply(null, args);
        }).match({
          success: (v) => Either.unit(fail, v),
          failure: (f) => Either.left(f)
        });
      };
    },

    /**
     * Function to bind a function to a higher kinded type
     * To receive Either and return Either value or failure
     * @param  {[Function]} fail  Failure to evaluate if left
     * @param  {Function}   fn    Function to bind
     * @return {[Function]}       Function that was binded to a higher kinded type 
     */
    bind(fail, fn) {
      return (...args) => {
        return Try.unit(() => {
          if (args.some(x => !(x instanceof Either.prototype.constructor)))
            throw new Error("'bind' requires Either typed paramenters");
          else if (args.some(x => !x.isRight))
            throw args.filter(x => !x.isRight)[0].value;

          let unwrappedArgs = args.map(x => x.value);
          return fn.apply(null, unwrappedArgs);
        }).match({
          success: (v) => Either.unit(fail, v),
          failure: (f) => Either.left(f)
        });
      };
    }
  });

  Object.assign(Maybe, {
    /**
     * Function to lift a function to a higher kinded type
     * To receive a potential value and return a potential value
     * @param  {Function}   fn    Function to lift
     * @return {[Function]}       Function that was lifted to a higher kinded type 
     */
    lift(fn) {
      return (...args) => {
        return Try.unit(() => {
          return fn.apply(null, args);
        }).match({
          success: (v) => Maybe.unit(v),
          failure: () => Maybe.nothing()
        });
      };
    },

    /**
     * Function to bind a function to a higher kinded type
     * To receive a value and return a potential value
     * @param  {Function}   fn    Function to bind
     * @return {[Function]}       Function that was binded to a higher kinded type 
     */
    bind(fn) {
      return (...args) => {
        return Try.unit(() => {
          if (args.some(x => !(x instanceof Maybe.prototype.constructor)))
            throw new Error("'bind' requires Maybe typed paramenters");
          else if (args.some(x => x.isEmpty))
            throw "Nothing";

          let unwrappedArgs = args.map(x => x.value);
          return fn.apply(null, unwrappedArgs);
        }).match({
          success: (v) => Maybe.unit(v),
          failure: () => Maybe.nothing()
        });
      };
    }
  });

  return { Trampoline, Either, Maybe, Try, Io, NoOperation(n) { return n; } };
})();