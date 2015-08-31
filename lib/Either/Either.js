export default (() => {
	let Either = (() => {
		class Either {
			constructor(value, isRight) {
				Object.assign(this, { value, isRight });
			}

			match(left, right) {
				return this instanceof Right
					? right(this.value)
					: left(this.value);
			}
		}

		class Right extends Either {
			constructor(value) {
				super(value, true);
			}

			toString() {
				return `Right ${this.value}`
			}
		}

		class Left extends Either {
			constructor(value) {
				super(value, false);
			}

			toString() {
				return `Left ${this.value}`
			}
		}

		return {
      prototype: Either.prototype,
      
			left(l) {
				return new Left(l);
			},

			right(r) {
				return new Right(r);
			},

			unit(failFn, value) {
				if (value != 0 && !(value && value.constructor))
					return new Left(failFn());

	      let t = (new ((value).constructor)(value)).valueOf();
	      let defaultValue = t.name === '' ? NaN : t;

				return (!value && value !== defaultValue)
					? new Left(failFn())
					: new Right(value);
			},
			
			when(predicate, right, left) {
				return predicate
					? new Right(right())
					: new Left(left());
			}
		}
	})();

	return { Either };
})();
