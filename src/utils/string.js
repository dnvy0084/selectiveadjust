export function zfill(text, digit, prefix) {
	if(text.length >= digit) return text;

	return zfill(prefix + text);
}