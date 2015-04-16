"use strict";

var MaybeModule = require("./Maybe.js")
var EitherModule = require("./Either.js")
var TryModule = require("./Try.js")

var Maybe = MaybeModule.Maybe;
var Nothing = MaybeModule.Nothing;
var Just = MaybeModule.Just;

var Either = EitherModule.Either;

var Try = TryModule.Try;

Maybe.prototype.asEither = function (left) {
	return new Either(left.apply(this, [].slice.call(arguments, 1)), this.isEmpty ? null : this);
}

Maybe.prototype.failWhen = function(failFn, exception) {
	var self = this;
	return Try.Attempt(function() {
		var value = failFn.call(this, self.value);

		if (value){
			throw exception;
		};

		return self.value;
	});
}

Either.prototype.toMaybe = function() {
	if (this.isRight) {
		return new Just(this.value);
	} else {
		return new Nothing();
	}
}

Try.prototype.asEither = function(left, right) {
	return new Either(left && left.call(this, this.error), right && right.call(this, this.value));
}

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
					return new Maybe(fn.apply(this, value.map(function(x) { return x.value; })))
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