/**
 * zfill::(String, Int, String) => String
 * zfill('ff', 6, '0') => '0000ff';
 */
export function zfill(text, digit, prefix) {
	if(text.length >= digit) return text;

	return zfill(prefix + text);
}