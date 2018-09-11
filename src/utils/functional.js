/**
 * 커리 함수를 생성한다. 
 */
export function curry(f) {
	return function(...rest) {
		if(rest.length >= f.length) 
			return f(...rest);

		return curry(f.bind(null, ...rest));
	}
}

/**
 * tap::(Function) => (Any) => Any
 * tap(console.log, 'test') => 'test' // log test;
 */
export const tap = curry(function(f, e) {
	f(e);
	return e;
});

/**
 * zip::(...Arrays) => Array;
 * zip([1, 2, 3], ['a', 'b', 'c']) => [[1, 'a'], [2, 'b'], [3, 'c']];
 */
export function zip(...arrays) {
	const len = Math.max(...arrays.map(arr => arr.length))
		, zipped = [];

	for(let i = 0; i < len; i++) {
		zipped.push([...arrays.map(arr => arr[i])]);
	}

	return zipped;
}

/**
 * setProps::(Object, Array, Array) => Object;
 * setProps({}, ['a', 'b'], [1, 2]) => {a: 1, b: 2};
 */
export function setProps(target, props, values) {
	zip(props, values)
		.forEach(([prop, value]) => target[prop] = value);

	return target;
}

/**
 * first::(Array, Function) => Any
 * first([1, 2, 3, 4], n => n % 2 == 0) => 2;
 */
export function first(iter, condition) {
	for(let e of iter) {
		if(condition(e)) return e;
	}

	return null;
}

/**
 * pluck::(String) => (Object) => Any
 * pluck('a')({a: 1, b: 2}) => 1;
 */
export const pluck = curry(
	function(key, target) {
		return target[key];
	}
);