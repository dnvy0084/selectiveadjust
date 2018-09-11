function varify(value) {
	return !(value === null || typeof value === 'undefined');
}

class Just {
	static of(value) {
		if(varify(value)) 
			return new Just(value);

		return new Nothing();
	}

	constructor(value) {
		this._value = value;
	}

	map(f) {
		return Just.of(f(this._value));
	}

	pluck(key) {
		return Just.of(this._value[key]);
	}

	do(f) {
		return f(this._value);
	}

	get(other) {
		return this._value;
	}
}

class Nothing extends Just {
	constructor() {
		super();
	}

	map(f) {
		return this;
	}

	pluck(key) {
		return this;
	}

	do(f) {
		// nothing;
	}

	get(other) {
		return other;
	}
}

/**
 * maybe::Any => Just or Nothing
 * 1. null일 수도 있는 객체를 받아 Just나 Nothing Monad를 반환한다. 
 * 2. Just나 Nothing의 map, pluck, do, get을 이용해 제어할 수 있다. 
 * 3. null 체크가 필요없어진다. 
 */
export function maybe(e) {
	return Just.of(e);
}