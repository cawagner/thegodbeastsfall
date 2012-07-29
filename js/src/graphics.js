function Graphics(width, height) {
    var bufferElements = [document.getElementById("buffer0"), document.getElementById("buffer1")],
        bufferContexts = [bufferElements[0].getContext("2d"), bufferElements[1].getContext("2d")],
        drawingBuffer = 1;

    this.context = function() {
        return bufferContexts[drawingBuffer];
    };

    this.swapBuffers = function() {
        bufferElements[1-drawingBuffer].style.visibility = 'hidden';
        bufferElements[drawingBuffer].style.visibility = 'visible';

        drawingBuffer = 1 - drawingBuffer;
    };

    this.cls = function() {
        this.setFillColorRGB(0, 0, 0);
        this.drawFilledRect(0, 0, width, height);
    };

    this.setFillColorRGB = function(r, g, b) {
        this.context().fillStyle = ["rgb(", r, ",", g, ",", b, ")"].join("");
    };

    this.drawFilledRect = function(x, y, width, height) {
        this.context().fillRect(x, y, width, height);
    };

    this.width = function() { return width; };
    this.height = function() { return height; };
}
