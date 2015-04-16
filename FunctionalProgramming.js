function Either(error, value) {
	var cValue = value;
	var cError = error;

	var _isRight = value != null;
	var _isLeft = !_isRight;

	this.isRight = _isRight;
	this.isLeft = _isLeft;

	this.match = function(failure, success) {
		if (_isRight) {
			return success && success.call(this, cValue);
		} else if (_isLeft) {
			return failure && failure.call(this, cError);
		}
	}

	this.select = function(failure, success) {
		return new Either(failure(cError), success(cValue));
	}

	this.toMaybe = function() {
		if (_isRight) {
			return new Just(cValue);
		} else {
			return new Nothing();
		}
	}
}

var Try = {}
Try.Attempt = function(fn) {
	var params = [].slice.call(arguments, 1);
	try {
		return new Either(null, fn.apply(this, params));
	} catch (e) {
		return new Either(e, null);
	}
}

var Maybe = function(value, isEmpty) {
	this.value = value == null || value == undefined ? Maybe.unit : value;
	this.isEmpty = isEmpty;
}

Maybe.bind = function(fn) {
	return function() {
		var args = [].slice.call(arguments, 0).map(function(x) { return x instanceof Maybe ? x : new Just(x); });
		var response = new Nothing();

		var invalid = args.some(function(x) {
			return x instanceof Nothing; 
		});

		if (!invalid) {
			response = new Just(
				fn.apply(this, args.map(function (x) {
					return x.value;
				}))
			);
		}

		return response;
	}
}

Maybe.unit = new (function unit() { })();

Maybe.prototype.match = function(just, nothing) {
	if (this instanceof Nothing) {
		return nothing.call(this);
	} else {
		return just.call(this, this.value);
	}
}

Maybe.prototype.asEither = function (left) {
	return new Either(left.apply(this, [].slice.call(arguments, 1)), this.isEmpty ? null : this);
}

Maybe.prototype.getWhenNothing = function (NothingFn) {
	if (this instanceof Nothing)
		return NothingFn();
	else
		return this.value;
}

Maybe.prototype.failWhen = function(failFn, exception) {
	var self = this;
	return Try.Attempt(function() {
		var value = failFn(self.value);

		if (value){
			throw exception;
		};

		return self;
	}).Match(
		function failure(e) { return e; },
		function success(v) { return v; }
	);
}

var Nothing = function() {
	Maybe.call(this, null, true);
}
Nothing.prototype = Object.create(Maybe.prototype);
Nothing.constructor = Nothing;

var Just = function(value) {
	if (value == null || value == Maybe.unit) {
		return new Nothing();
	}

	if (value instanceof Maybe) {
		return value;
	}

	Maybe.call(this, value, false);
}

Just.prototype = Object.create(Maybe.prototype);
Just.constructor = Just;

module.exports = {
	Maybe: Maybe,
	Just: Just,
	Nothing: Nothing,
	Either: Either,
	Try: Try
};