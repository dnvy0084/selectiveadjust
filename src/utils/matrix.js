export function getContrastMat(c) {
	const t = 128 * (1 - c);

	return [
		c, 0, 0, t,
		0, c, 0, t,
		0, 0, c, t,
	];
}

export function getBrightnessMat(brightness) {
	const b = 256 * brightness

	return [
		1, 0, 0, b,
		0, 1, 0, b,
		0, 0, 1, b,
	]
}

export function getFlatColorMat4x3(r, g, b) {
	return [
		0, 0, 0, r * 255 | 0,
		0, 0, 0, g * 255 | 0,
		0, 0, 0, b * 255 | 0,
	];
}

export function identity(mat = []) {
	mat[0] = 1, mat[1] = 0, mat[2] = 0, mat[3] = 0,
	mat[4] = 0, mat[5] = 1, mat[6] = 0, mat[7] = 0,
	mat[8] = 0, mat[9] = 0, mat[10] = 1, mat[11] = 0;

	return mat;
}