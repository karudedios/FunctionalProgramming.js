module.exports = (() => {
	let Either = (() => {
		class Either {
			constructor(value, isRight) {
				this.value = value;
				Object.defineProperty(this, 'isRight', { value: isRight });
			}

			match(left, right) {
				if (this instanceof Right) {
					return right && right.call(this, this.value);
				} else {
					return left && left.call(this, this.error);
				}
			}
		}

		class Right extends Either {
			constructor(value) {
				super(value, true);
			}
		}

		class Left extends Either {
			constructor(value) {
				super(value, false);
			}
		}

		return {
			left(l) {
				new Left(l)
			},

			right(r) {
				new Right(r)
			},

			lift(failFn, value) {
				if (!(value && value.constructor))
					return Either.left(failFn());

	      let t = (new ((value).constructor)(value)).valueOf();
	      let defaultValue = t.name === '' ? NaN : t;

				return (!value && value !== defaultValue)
					? Either.left(failFn())
					: Either.right(value);
			},
			
			if(predicate, left, right) {
				return predicate
					? Either.left(left())
					: Either.right(right());
			}
		}
	})();

	return { Either };
})();
