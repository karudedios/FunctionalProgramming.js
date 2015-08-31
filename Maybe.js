module.exports = (() => {
	let Maybe = (() => {
		class Maybe {
			constructor(isEmpty) {
				this.isEmpty = isEmpty;
			}

			match(just, nothing) {
				return this instanceof Nothing
					? nothing()
					: just(this.value);
			}
		}

		class Nothing extends Maybe {
			constructor() {
				super(true);
			}
		}

		class Just extends Maybe {
			constructor(value) {
				super(false);
				this.value = value;
			}
		}

		return {
			lift(value) {
				if (!(value && value.constructor))
					return new Nothing;

	      let t = (new ((value).constructor)(value)).valueOf();
	      let defaultValue = t.name === '' ? NaN : t;

				return (!value && value !== defaultValue)
					? new Nothing
					: new Just(value);
			},

			if(predicate, just) {
				return predicate
					? new Just(just())
					: new Nothing
			},
			
			nothing() {
				return new Nothing
			}
		};
	})();

	return { Maybe };
})();