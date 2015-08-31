import { Trampoline, Either, Maybe, Try, Io } from '../lib/index'

export default (() => {
  Object.assign(Either.prototype, {
    /**
     * Extension method for Either which allows you to convert either a value or a failure into a potential value
     * @return {Maybe}  A potential value or nothing
     */
    toMaybe() {
      return this.match(
        function left(v) {
          return Maybe.nothing();
        },
        function right(v) {
          return Maybe.lift(v);
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
      return this.match(
        function just(v) {
          return Either.right(v)
        },
        function nothing() {
          return Either.left(left());
        })
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
        };

        return self;
      }).match(
        function success(v) { return v },
        function failure(f) { return Maybe.nothing() }
      );
    }
  });

	Object.assign(Try.prototype, {
    /**
     * Extension method for Try which allows you to convert an attempt of a value to either a value or a failure
     * @return {Either}   Either a value or a failure
     */
    asEither() {
      return this.match(
        function success(v) {
          return Either.right(v);
        },
        function failure(v) {
          return Either.left(v);
        });
    },

    /**
     * Extension method for Try which allows you to convert an attempt of a value to a potential value or nothing
     * @return {Maybe}   Potential value or nothing
     */
    toMaybe() {
      return this.match(
        function success(v) {
          return Maybe.lift(v);
        },
        function failure() {
          return Maybe.nothing();
        });
    }
  });

  Object.assign(Either, {
    lift(fail, fn) {
      return (...args) => {        
        return Try.unit(() => {
          return fn.apply(null, args);
        }).match(
          function success(v) {
            return Either.unit(fail, v);
          },
          function failure(f) {
            return Either.left(f);
          });
      }
    },

    bind(fail, fn) {
      return (...args) => {        
        return Try.unit(() => {
          if (args.some(x => !(x instanceof Either.prototype.constructor)))
            throw new Error("'bind' requires Either typed paramenters");
          else if (args.some(x => !x.isRight))
            throw args.filter(x => !x.isRight)[0].value;

          let unwrappedArgs = args.map(x => x.value);
          return fn.apply(null, unwrappedArgs);
        }).match(
          function success(v) {
            return Either.unit(fail, v);
          },
          function failure(f) {
            return Either.left(f);
          });
      }
    }
  });

  Object.assign(Maybe, {
    lift(fn) {
      return (...args) => {        
        return Try.unit(() => {
          return fn.apply(null, args);
        }).match(
          function success(v) {
            return Maybe.unit(v);
          },
          function failure(f) {
            return Maybe.nothing();
          });
      }
    },

    bind(fn) {
      return (...args) => {        
        return Try.unit(() => {
          if (args.some(x => !(x instanceof Maybe.prototype.constructor)))
            throw new Error("'bind' requires Maybe typed paramenters");
          else if (args.some(x => x.isEmpty))
            throw "Nothing";

          let unwrappedArgs = args.map(x => x.value);
          return fn.apply(null, unwrappedArgs);
        }).match(
          function success(v) {
            return Maybe.unit(v);
          },
          function failure(f) {
            return Maybe.nothing();
          });
      }
    }
  });

	return { Trampoline, Either, Maybe, Try, Io, NoOperation(n) { return n; } };
})();