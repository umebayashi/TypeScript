var Complex = (function () {
    function Complex(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }
    Complex.prototype.norm = function () {
        return this.real * this.real + this.imaginary * this.imaginary;
    };
    Complex.add = function add(c1, c2) {
        return new Complex(c1.real + c2.real, c1.imaginary + c2.imaginary);
    }
    Complex.multiply = function multiply(c1, c2) {
        return new Complex(c1.real * c2.real - c1.imaginary * c2.imaginary, c1.imaginary * c2.real + c1.real * c2.imaginary);
    }
    return Complex;
})();
var Color = (function () {
    function Color(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
    return Color;
})();
var ColorPalette = (function () {
    function ColorPalette() {
        this.colors = new Array();
        var i = 0;
        for(var r = 1; r <= 8; r++) {
            for(var g = 1; g <= 8; g++) {
                for(var b = 1; b <= 8; b++) {
                    this.colors.push(new Color(r * 32 - 1, g * 32 - 1, b * 32 - 1, 255));
                }
            }
        }
        this.black = new Color(0, 0, 0, 255);
    }
    ColorPalette.prototype.getColor = function (index) {
        if(-1 < index && index < 512) {
            return this.colors[index];
        } else {
            return this.black;
        }
    };
    return ColorPalette;
})();
var PointToComplexConverter = (function () {
    function PointToComplexConverter(width, height, leftTop, rightBottom) {
        this.width = width;
        this.height = height;
        this.leftTop = leftTop;
        this.rightBottom = rightBottom;
        this.dx = (rightBottom.real - leftTop.real) / width;
        this.dy = (leftTop.imaginary - rightBottom.imaginary) / height;
    }
    PointToComplexConverter.prototype.convertTo = function (x, y) {
        return new Complex(this.leftTop.real + this.dx * x, this.leftTop.imaginary - this.dy * y);
    };
    return PointToComplexConverter;
})();
var MandelbrotDrawer = (function () {
    function MandelbrotDrawer(canvasId, canvasSize) {
        this.canvasId = canvasId;
        this.canvasSize = canvasSize;
        this.calcLimit = 512;
        this.colorPalette = new ColorPalette();
    }
    MandelbrotDrawer.prototype.calculate = function (comp) {
        var z = new Complex(0, 0);
        var count = 0;
        for(count = 0; count < this.calcLimit && z.norm() < 4; ++count) {
            z = Complex.add(Complex.multiply(z, z), comp);
        }
        return this.colorPalette.getColor(count);
    };
    MandelbrotDrawer.prototype.setColorToImageData = function (imgData, x, y, color) {
        imgData.data[x * 4 + y * this.canvasSize * 4] = color.red;
        imgData.data[x * 4 + y * this.canvasSize * 4 + 1] = color.green;
        imgData.data[x * 4 + y * this.canvasSize * 4 + 2] = color.blue;
        imgData.data[x * 4 + y * this.canvasSize * 4 + 3] = color.alpha;
    };
    MandelbrotDrawer.prototype.drawMandelbrot = function (leftTop, rightBottom) {
        var elmCanvas = document.getElementById(this.canvasId);
        elmCanvas.width = this.canvasSize;
        elmCanvas.height = this.canvasSize;
        var context = elmCanvas.getContext("2d");
        var imgData = context.createImageData(elmCanvas.width, elmCanvas.height);
        var converter = new PointToComplexConverter(this.canvasSize, this.canvasSize, leftTop, rightBottom);
        for(var y = 0; y < this.canvasSize; y++) {
            for(var x = 0; x < this.canvasSize; x++) {
                var comp = converter.convertTo(x, y);
                var color = this.calculate(comp);
                this.setColorToImageData(imgData, x, y, color);
            }
        }
        context.putImageData(imgData, 0, 0);
    };
    return MandelbrotDrawer;
})();
var drawer = new MandelbrotDrawer("canvas", 500);
drawer.drawMandelbrot(new Complex(-2, 1.5), new Complex(1, -1.5));
