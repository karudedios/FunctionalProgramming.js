"use strict";

var MaybeModule = require("./Maybe.js")
var EitherModule = require("./Either.js")
var TryModule = require("./Try.js")

var Maybe = MaybeModule.Maybe;
var Nothing = MaybeModule.Nothing;
var Just = MaybeModule.Just;

var Either = EitherModule.Either;

var Try = TryModule.Try;

/**
 * Extension method for Maybe which allows you to convert a potential value into either the value or an failure
 * @param  {Function} left	Function called on the Either if it's a failure
 * @return {Either}					Either the potential type or the designed error value
 */
Maybe.prototype.asEither = function (left) {
	return new Either(left.apply(this, [].slice.call(arguments, 1)), this.isEmpty ? null : this);
}

/**
 * Extension method for Maybe which allows you to specify scenarios in which the result will be a Nothing
 * @param  {Function} failFn	Criteria to match
 * @param  {String} exception	Exception to be thrown
 * @return {Maybe}						A potential value or nothing
 */
Maybe.prototype.failWhen = function(failFn, exception) {
	var self = this;
	return Try.Attempt(function() {
		var value = failFn.call(this, self.value);

		if (value){
			throw exception;
		};

		return self;
	});
}

/**
 * Extension method for Either which allows you to convert either a value or a failure into a potential value
 * @return {Maybe}	A potential value or nothing
 */
Either.prototype.toMaybe = function() {
	if (this.isRight) {
		return new Just(this.value);
	} else {
		return new Nothing();
	}
}

/**
 * Extensio method for Try which allows you to convert an attempt of a value to either a value or a failure
 * @param  {Function} left	failure function
 * @param  {Function} right	success function
 * @return {Either}					Either a value or a failure
 */
Try.prototype.asEither = function(left, right) {
	return new Either(left && left.call(this, this.error), right && right.call(this, this.value));
}

/**
 * Static method for Maybe which allows yo to turn a non-maybe function to a maybe one
 * @param  {Function} fn	Function to wrap
 * @return {Maybe}				A potential value or nothing
 */
Maybe.bind = function(fn) {
	return function() {
		var args = [].slice.call(arguments, 0).map(function(x) { return x instanceof Maybe ? x : new Maybe(x); });
		return Try.Attempt(function() {
			return new Maybe(args)
			.failWhen(function fail(collection) {
				return !collection ||
							 !collection.length ||
							  collection.some(function(x) { return (x instanceof Nothing); })
			}, "Arguments must have value")
			.match(
				function just(value) {
					return new Maybe(fn.apply(this, value.select(function(collection) { return collection.map(function(x) { return x.value; }) })));
			  }
			, function nothing(error) {
					return new Nothing();
				})
		}).match(
			function success(just) { return just; },
			function error(nothing) { console.error(nothing); return new Nothing; }
		);
	}
}

var sum = function(a, b) {
	if(arguments.length < 2) throw "There's not a valid call for sum with less than 2 arguments";
	if(arguments.length > 2) throw "There's not a valid call for sum with more than 2 arguments";
	return a + b;
};

var maybeSum = Maybe.bind(sum);

console.log(
	maybeSum(3, 1)
)

module.exports = {
	Maybe: Maybe,
	Just: Just,
	Nothing: Nothing,
	Either: Either,
	Try: Try
};