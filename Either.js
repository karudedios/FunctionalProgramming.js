module.exports = (function() {
	"use strict";
	
	function Either(error, value) {
		this.value = value;
		this.error = error;
		this.isRight = value != null;
		this.isLeft = !this.isRight;
	}

	Either.prototype.match = function(failure, success) {
		if (this.isRight) {
			return success && success.call(this, this.value);
		} else {
			return failure && failure.call(this, this.error);
		}
	}

	Either.prototype.select = function(failure, success) {
		return new Either(failure.call(this, this.error), success.call(this, this.value));
	}

	Either.prototype.get = function() {
		return this.match(
			function left(l) { return l; },
			function right(r) { return r; }
		);
	}

	return {
		Either: Either
	};
})();
