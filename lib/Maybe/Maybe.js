export default (() => {
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

			toString() {
				return 'Nothing';
			}
		}

		class Just extends Maybe {
			constructor(value) {
				super(false);
				this.value = value;
			}

			toString() {
				return `Just ${this.value}`;
			}
		}

		return {
      prototype: Maybe.prototype,
      
			nothing() {
				return new Nothing
			},

			unit(value) {
				if (!(value && value.constructor))
					return new Nothing;

	      let t = (new ((value).constructor)(value)).valueOf();
	      let defaultValue = t.name === '' ? NaN : t;

				return (!value && value !== defaultValue)
					? new Nothing
					: new Just(value);
			},

			when(predicate, just) {
				return predicate
					? new Just(just())
					: new Nothing;
			}
		};
	})();

	return { Maybe };
})();