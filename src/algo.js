/**
 * range:: (Number, [Number) => Array
 * range(5, 10) => [5, 6, 7, 8, 9];
 * range(3) => [0, 1, 2];
 */
function range(a, b) {
	if(typeof b === 'undefined') 
		[a, b] = [0, a];

	const result = [];

	for(; a < b; a++) {
		result.push(a);
	}

	return result;
}

/**
 * curry :: Function => Function
 * f(a, b)의 형태를 f(a)(b)로 호출 할 수 있도록 변경한다. 
 */
function curry(f) {
	return function(...rest) {
		if(rest.length >= f.length)
			return f(...rest);

		return curry(f.bind(null, ...rest));
	}
}

/**
 * 배열의 첫번째 원소를 반환한다. 
 */
function head(arr) {
	return (arr || [])[0];
}

/**
 * match :: RegEx => String => Array;
 */
const match = curry(
	function(regex, str) {
		return str.match(regex);
	}
);

const pluck = curry(
	function(key, target) {
		return (target || {})[key];
	}
);

function zip(...arrays) {
	const len = Math.max(
		...arrays.map(pluck('length')));

	return range(len)
		.map(n => arrays.map(arr => arr[n]));
}



function toString(problem) {
	const s = problem
		.map(match(/./g))
		.map(split => split.join('\t'))
		.join('\n');

	console.log(s);
}

function blocksToString(blocks) {
	// const problem = zip(...blocks)
	// 	.reverse()
	// 	.map(a => a.join(''));

	// return toString(problem);

	const s = blocks.map(a => a.join(' '))
		.join('\n');

	console.log(s);
}


/**
 * 배열안의 문자열을 잘라 아래 블록이 배열의 0번부터 오도록 변환한다. 
 */
function arrayToBlocks(array) {
	return zip(...array.map(match(/./g)))
		.map(arr => arr.reverse());
}

function deleteColumn(block, column) {
	for(let i = column.length; i--; ) {
		if(column[i] == 0) continue;

		block.splice(i, 1);
	}
}

/**
 * 2x2 블록이 없을 때까지 제거하며 제거된 블록의 개수를 반환한다. 
 */
function* calcNumBlocks(w, h, blocks) {
	let match, result, numBlocks = 1;

	const add = (a, b) => a + b;

	while(numBlocks > 0) {
		match = matchBlocks(w, h, blocks);
		// result = match.map(a => [a.indexOf(1), a.filter(n => n == 1).length]);
		// result.forEach(([index, len], i) => blocks[i].splice(index, len));
		
		// numBlocks = result.reduce((sum, [index, n]) => sum + n, 0);
		numBlocks = match
			.map(a => a.reduce(add))
			.reduce(add);

		match.forEach((a, i) => deleteColumn(blocks[i], a));
		yield numBlocks;
	}
}

/**
 * 2x2 블록을 찾아 아래 형태로 블록의 위치를 반환한다. 
 * [0, 1, 1, 0]
 * [0, 1, 1, 0]
 * [1, 1, 0, 0]
 * [1, 1, 0, 0]
 */
function matchBlocks(w, h, blocks) {
	const result = range(w).map(n => new Array(h).fill(0))
		, mat = [[0, 0], [1, 0], [0, -1], [1, -1]]

	for(let y = h - 1; y >= 1; y--) {
		for(let x = 0; x < w - 1; x++) {
			if(y >= blocks[x].length) continue;
			if(!varifyBlock(blocks, x, y)) continue;

			mat.forEach(([tx, ty]) => result[x + tx][y + ty] = 1);
		}
	}

	return result;
}

/**
 * x, y 위치의 블록과 주변 블록이 같은지 확인한다. 
 */
function varifyBlock(blocks, x, y) {
	const mat = [[1, 0], [0, -1], [1, -1]]
		, b = blocks[x][y];

	return mat.every(([tx, ty]) => blocks[x + tx][y + ty] == b);
}


/**
 * 2x2 블록의 개수를 모두 더하여 반환한다. 
 */
function scanNumOf2x2Blocks(problem) {
	const blocks = arrayToBlocks(problem)
		, w = blocks.length
		, h = head(blocks).length;

	return [...calcNumBlocks(w, h, blocks)]
		.reduce((a, b) => a + b);
}

const samples = [
	['AACD', 'ABBB', 'BBBC', 'BBCC'],
	['AA', 'AA'],
	['AB', 'CD'],
	['BC', 'AA', 'AA', 'CA', 'DD', 'DD'],
	['CCBDE', 'AAADE', 'AAABF', 'CCBBF'],
	['TTTANT', 'RRFACC', 'RRRFCC', 'TRRRAA', 'TTMMMF', 'TMMTTJ'],
	["AAAAAAABAA","BAABAABBBA","BAABAAAABA","BBBBAAAAAA","ABBBABBABB","BAAABBAAAB","ABABBBBBAB","AAAAABABBA","BBABABAAAA","BAABBBBAAA"],
	["ABAAABBBBBA","BAAAAABBABA","ABBBBBBBABB","BABBABABABA","BBABABAAABA","BBAAAAAAABB","ABBAABAAABA","AAABBBABAAA","BABBAAABBAA","BBABBABBBBB","ABABBAABBBB"],
	["AABBAAABBAAA","AABBAABAABAB","BBAABAAABBBB","BBBABAAABAAA","BBBBABBBBABA","AABBBAABBAAA","ABAAAAABBABB","ABBABABBBABB","BAABBABBBBBB","BABABAAAAABA","BBBAAAABABBB","AABABAAABBAB"],
	["ABBABABBBABAA","BAAABABBABBAB","BABBAABAABABA","BBBABABBBABAA","BBBAAABBAABBA","ABABAAAABAAAB","BABABAABBAAAA","BBBABAABBBAAA","BAAAABBBABABB","ABBABAAABBBAA","AAABAABBAAAAB","ABBAABAABBBBA","BABABAAABBAAB"],
	["BAAABAAAABAABA","BABABABABBABAB","ABBABBBAABBAAA","ABAABBAAAABAAB","BAABABBAAABABB","AAABBAABABBBAA","ABABBBAABAAABA","ABBBBBABBBAAAA","BAAABBBABBBBAA","AABABABBAABBBA","BAAAAAAABAABBA","ABBABBAABABAAA","BAABBBABABAAAB","AABBBBBAAAABAB"],
];

console.log(samples.map(scanNumOf2x2Blocks));



