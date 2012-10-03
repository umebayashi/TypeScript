class Complex {
	constructor (public real: number, public imaginary: number) {
	}

	norm() {
		return this.real * this.real + this.imaginary * this.imaginary;
	}

	static add(c1: Complex, c2: Complex): Complex {
		return new Complex(c1.real + c2.real, c1.imaginary + c2.imaginary);
	}

	static multiply(c1: Complex, c2: Complex): Complex {
		return new Complex(
			c1.real * c2.real - c1.imaginary * c2.imaginary,
			c1.imaginary * c2.real + c1.real * c2.imaginary);
	}
}

class Color {
	constructor (public red: number, public green: number, public blue: number, public alpha: number) {
	}
}

class ColorPalette {
	constructor () {
		this.colors = new Color[];
		var i = 0;
		for (var r = 1; r <= 8; r++) {
			for (var g = 1; g <= 8; g++) {
				for (var b = 1; b <= 8; b++) {
					this.colors.push(new Color(r * 32 - 1, g * 32 - 1, b * 32 - 1, 255));
				}
			}
		}

		this.black = new Color(0, 0, 0, 255);
	}

	getColor(index: number) {
		if (-1 < index && index < 512) {
			return this.colors[index];
		}
		else {
			return this.black;
		}
	}

	colors: Color[];
	black: Color;
}

class PointToComplexConverter {
	constructor (public width: number, public height: number, public leftTop: Complex, public rightBottom: Complex) {
		this.dx = (rightBottom.real - leftTop.real) / width;
		this.dy = (leftTop.imaginary - rightBottom.imaginary) / height;
	}

	dx: number;
	dy: number;

	// Canvas上の座標を複素数平面上の座標に変換する
	convertTo(x: number, y: number): Complex {
		return new Complex(this.leftTop.real + this.dx * x, this.leftTop.imaginary - this.dy * y);
	}
}

class MandelbrotDrawer {
	constructor (public canvasId: string, public canvasSize: number) {
		this.calcLimit = 512;
		this.colorPalette = new ColorPalette();
	}

	calcLimit: number;
	colorPalette: ColorPalette;

	calculate(comp: Complex): Color {
		var z = new Complex(0, 0);
		var count = 0;
		for (count = 0; count < this.calcLimit && z.norm() < 4.0; ++count) {
			z = Complex.add(Complex.multiply(z, z), comp);
		}

		return this.colorPalette.getColor(count);
	}

	// ImageDataオブジェクトにピクセル情報を設定
	setColorToImageData(imgData: ImageData, x: number, y: number, color: Color) {
		imgData.data[x * 4 + y * this.canvasSize * 4] = color.red;
		imgData.data[x * 4 + y * this.canvasSize * 4 + 1] = color.green;
		imgData.data[x * 4 + y * this.canvasSize * 4 + 2] = color.blue;
		imgData.data[x * 4 + y * this.canvasSize * 4 + 3] = color.alpha;
	}

	drawMandelbrot(leftTop: Complex, rightBottom: Complex) {
		var elmCanvas = <HTMLCanvasElement>document.getElementById(this.canvasId);

		elmCanvas.width = this.canvasSize;
		elmCanvas.height = this.canvasSize;

		var context = elmCanvas.getContext("2d");
		var imgData = context.createImageData(elmCanvas.width, elmCanvas.height);

		var converter = new PointToComplexConverter(this.canvasSize, this.canvasSize, leftTop, rightBottom);

		for (var y = 0; y < this.canvasSize; y++) {
			for (var x = 0; x < this.canvasSize; x++) {
				var comp = converter.convertTo(x, y);
				var color = this.calculate(comp);

				this.setColorToImageData(imgData, x, y, color);
			}
		}

		context.putImageData(imgData, 0, 0);
	}
}

var drawer = new MandelbrotDrawer("canvas", 500);
drawer.drawMandelbrot(new Complex(-2.0, 1.5), new Complex(1.0, -1.5));

