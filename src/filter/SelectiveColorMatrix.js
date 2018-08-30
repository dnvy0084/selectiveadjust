import {identity} from '../utils/matrix';
import {getHueAngle} from '../utils/canvas';
import {getFlatColorMat4x3} from '../utils/matrix';

const flatColorMat = getFlatColorMat4x3(1, 0, 0);

export default class SelectiveColorMatrix {
	constructor() {
		this.clear();
	}

	clear() {
		this._original = null;

		this.x = 0;
		this.y = 0;
		this.hueAngle = 0;
		this.range = 0;
		this.radius = 0;

		this._brightness = 0;
		this._contrast = 1;
		this._saturation = 1;
		this._hue = 0;
		this._changed = true;

		const c = 1.5;

		this._originalColorMat = 
		this._colorMatrix = identity();
	}

	applyFilter(source, dest) {
		const orgData = this.original.data
			, srcData = source.data
			, destData = dest.data
			, len = source.width * source.height * 4
			, t = this.range
			, hue = this.hueAngle
			, width = source.width
			, height = source.height
			, radius = this.radius * this.radius
			, ox = this.x
			, oy = this.y
			, m = this.colorMatrix
			, _a = m[0], _d = m[1], _g = m[2], _j = m[3]
			, _b = m[4], _e = m[5], _h = m[6], _k = m[7]
			, _c = m[8], _f = m[9], _i = m[10], _l = m[11];

		var r, g, b, hue2, f, 
			x, y, j, dx, dy,
			tr, tg, tb;

		for(var i = 0; i < len; i += 4) {
			r = srcData[i    ];
			g = srcData[i + 1];
			b = srcData[i + 2];

			j = i / 4
			x = j % width;
			y = j / width | 0;

			dx = ox - x;
			dy = oy - y;

			f = 1 - (dx * dx + dy * dy) / radius;

			if(f <= 0.0) {
				destData[i    ] = r;
				destData[i + 1] = g;
				destData[i + 2] = b;
				destData[i + 3] = srcData[i + 3];	
				continue;
			}

			hue2 = getHueAngle(orgData[i] / 255, orgData[i + 1] / 255, orgData[i + 2] / 255);
			f = f * Math.max(0, 1 - Math.abs(hue - hue2) / t);

			tr = _a*r + _d*g + _g*b + _j;
			tg = _b*r + _e*g + _h*b + _k;
			tb = _c*r + _f*g + _i*b + _l;

			destData[i] = r + f * (tr - r);
			destData[i + 1] = g + f * (tg - g);
			destData[i + 2] = b + f * (tb - b);
			destData[i + 3] = srcData[i + 3];
		}

		return dest;
	}


	get colorMatrix() {
		if(this._changed) {
			const b = this.brightness
				, c = this.contrast
				, tc = c * b + 128 * (1 - c)
				, lumR = 0.2125
				, lumG = 0.7154
				, lumB = 0.0721
				, s = this.saturation
				, sr = (1 - s) * lumR
				, sg = (1 - s) * lumG
				, sb = (1 - s) * lumB;

			this._colorMatrix = [
				c * (sr + s), c * sg, c * sb, tc,
				c * sr, c * (sg + s), c * sb, tc,
				c * sr, c * sg, c * (sb + s), tc,
			];
		}

		this._changed = false;
		return this._colorMatrix;
	}


	get brightness() {
		return this._brightness;
	}
	
	set brightness(value) {
		if(value == this.brightness) return;

		this._brightness = value;
		this._changed = true;
	}


	get contrast() {
		return this._contrast;
	}
	
	set contrast(value) {
		if(value == this.contrast) return;

		this._contrast = value;
		this._changed = true;
	}


	get hue() {
		return this._hue;
	}
	
	set hue(value) {
		if(value == this.hue) return;

		this._hue = value;
		this._changed = true;
	}


	get saturation() {
		return this._saturation;
	}
	
	set saturation(value) {
		if(value == this.saturation) return;

		this._saturation = value;
		this._changed = true;
	}



	get selectable() {
		return this.colorMatrix == flatColorMat;
	}
	
	set selectable(value) {
		if(value) {
			this._originalColorMat = this.colorMatrix;
			this._colorMatrix = flatColorMat;
		}
		else {
			this._colorMatrix = this._originalColorMat;
		}
	}



	get original() {
		return this._original;
	}
	
	set original(value) {
		this._original = value;
	}
}