module.exports = (function() {
	"use strict";

	var MaybeModule = require("./Maybe.js");
	var EitherModule = require("./Either.js");
	var TryModule = require("./Try.js");
	var IoModule = require("./Io.js");

	var Maybe = MaybeModule.Maybe;
	var Nothing = MaybeModule.Nothing;
	var Just = MaybeModule.Just;

	var Either = EitherModule.Either;

	var Try = TryModule.Try;

	var Io = IoModule.Io;

	/**
	 * Extension method for Maybe which allows you to convert a potential value into either the value or an failure
	 * @param  {Function} left	Function called on the Either if it's a failure
	 * @return {Either}					Either the potential type or the designed error value
	 */
	Maybe.prototype.asEither = function (left) {
		return new Either(this.isEmpty && left(), this.isEmpty ? null : this.value);
	}

	/**
	 * Extension method for Maybe which allows you to specify scenarios in which the result will be a Nothing
	 * @param  {Function} failFn	Criteria to match
	 * @param  {String} exception	Exception to be thrown
	 * @return {Maybe}						A potential value or nothing
	 */
	Maybe.prototype.failWhen = function(failFn, exception) {
		var self = this;
		return Try.attempt(function() {
			if (failFn.call(this, self.value)){
				throw exception;
			};

			return self;
		}).match(
			function success(v) { return v },
			function failure(f) { return new Nothing }
		);
	}

	/**
	 * Extension method for Either which allows you to convert either a value or a failure into a potential value
	 * @return {Maybe}	A potential value or nothing
	 */
	Either.prototype.toMaybe = function() {
		if (this.isRight) {
			return Maybe.lift(this.value);
		} else {
			return Maybe.nothing;
		}
	}

	/**
	 * Extension method for Try which allows you to convert an attempt of a value to either a value or a failure
	 * @param  {Function} left	failure function
	 * @param  {Function} right	success function
	 * @return {Either}		Either a value or a failure
	 */
	Try.prototype.asEither = function(left, right) {
		return new Either(left && left.call(null, this.error), right && right.call(null, this.value));
	}

	/**
	 * Static method for Maybe which allows yo to turn a non-maybe function to a maybe one
	 * @param  {Function} fn	Function to wrap
	 * @return {Maybe}		A potential value or nothing
	 */
	Maybe.bind = function(fn) {
		return function() {
			var args = [].slice.call(arguments, 0).map(function(x) { return x instanceof Maybe ? x : new Maybe(x); });
			return Try.attempt(function() {
				if (!(args && args.length) || args.some(function(x) { return (x instanceof Nothing); })) {
					throw new Error("Arguments must have value");
				}
				return new Maybe(args)
				.match(
					function just(value) {
						var v = fn.apply(this, value.map(function(x) { return x.value; }) );
						return v instanceof Function ? Maybe.bind(v) : new Maybe(v);
				  }
				, function nothing(error) {
						return new Nothing();
					})
			}).match(
				function success(value) {
					return value;
				}
			, function error(failure) {
				console.error(failure);
				return new Nothing;
			});
		}
	}

  Either.bind = function(fn, ret) {
    return (eitherParam) => {
      return eitherParam.match(
        function left(l) {
          return eitherParam;
        },
        function right(r) {
          let response = fn(r);
          return response
            ? new Either(null, response)
            : new Either(ret(), null);
        });
    }
  }

  /*Either.lift = function(eitherFn, value) {
    eitherFn = eitherFn || function(n) { return n; }
    return Maybe.lift(value).match(
      function just(v) {
        let t = (new ((value).constructor)(v)).valueOf();
        let defaultValue = t.name === '' ? NaN : t;

        if (!v && v !== defaultValue) {
          return new Either(eitherFn(), null);
        }

        return new Either(null, v);
      },
      function nothing() {
        return new Either(eitherFn(), null);
      });
  };*/

	return {
		Maybe: Maybe,
		Either: Either,
		Try: Try,
		Io: Io,
		NOOP: function(n) { return n; }
	};
})();