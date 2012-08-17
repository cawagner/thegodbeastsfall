function Graphics(width, height, scale) {
    var visibleCanvas = document.getElementById("gameCanvas"),
        offScreenCanvas = document.createElement("canvas"),
        visibleContext = visibleCanvas.getContext('2d'),
        context;

    offScreenCanvas.width = width;
    offScreenCanvas.height = height;

    context = offScreenCanvas.getContext('2d');

    this.setOrigin = function(x, y) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(x | 0, y | 0);
    };

    this.swapBuffers = function() {
        visibleContext.drawImage(offScreenCanvas, 0, 0);
    };

    this.cls = function() {
        this.setFillColorRGB(0, 0, 0);
        this.drawFilledRect(0, 0, width, height);
    };

    this.setFillColor = function(color) {
        context.fillStyle = color;
    };

    this.setFillColorRGB = function(r, g, b) {
        context.fillStyle = ["rgb(", r, ",", g, ",", b, ")"].join("");
    };

    this.drawFilledRect = function(x, y, width, height) {
        context.fillRect(x, y, width, height);
    };

    this.drawImageRect = function(image, sourceRect, destRect) {
        context.drawImage(image,
                sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
                destRect.x | 0, destRect.y | 0, destRect.width, destRect.height);
    };

    this.drawText = function(x, y, text) {
        context.fillText(text, (x + .5) << 0, (y + .5) << 0);
    };

    this.width = function() { return width; };
    this.height = function() { return height; };

    context.font = "8px 'Press Start 2P'";
    context.textBaseline = 'top';

    visibleContext.webkitImageSmoothingEnabled = false;
    visibleContext.mozImageSmoothingEnabled = false;
    visibleContext.imageSmoothingEnabled = false;
    visibleContext.scale(2, 2);
}
