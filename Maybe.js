"use strict";

function Maybe(value) {
	this.value = (value == null || value == undefined) ? Maybe.unit : value;
	this.isEmpty = (value == Maybe.unit);

	if (this.isEmpty) return new Nothing();
	if (!this.isEmpty) return new Just(value);
}

Maybe.unit = new (function unit() { return this; })

Maybe.prototype.select = function(just) {
	return just && just.call(this, this.value);
}

Maybe.prototype.match = function(just, nothing) {
	if (this instanceof Nothing) {
		return nothing.call(this);
	} else {
		return just.call(this, this.value);
	}
}

Maybe.prototype.getWhenNothing = function (NothingFn) {
	if (this instanceof Nothing)
		return NothingFn();
	else
		return this.value;
}

function Nothing() {
	this.value = {}

	Object.defineProperty(this, 'isEmpty', {
		  value: true
		, enumerable: false
		, writable: false
		, configurable: false
	});
}
Nothing.prototype = Object.create(Maybe.prototype);
Nothing.constructor = Nothing;

function Just(value) {
	if (value == null || value == undefined) {
		return new Nothing();
	}

	Object.defineProperty(this, 'isEmpty', {
		  value: false
		, enumerable: false
		, writable: false
		, configurable: false
	});

	this.value = value;
}

Just.prototype = Object.create(Maybe.prototype);
Just.constructor = Just;

module.exports = {
	Maybe: Maybe,
	Just: Just,
	Nothing: Nothing
}