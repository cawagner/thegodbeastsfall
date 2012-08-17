function Graphics(width, height, scale) {
    var gameCanvas = document.getElementById("gameCanvas"),
        context = gameCanvas.getContext('2d');

    this.setOrigin = function(x, y) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate((scale * x + .5) << 0, (scale * y + .5) << 0);
    };

    this.swapBuffers = function() {
    };

    this.cls = function() {
        this.setFillColorRGB(0, 0, 0);
        this.drawFilledRect(0, 0, scale * width, scale * height);
    };

    this.setFillColor = function(color) {
        context.fillStyle = color;
    };

    this.setFillColorRGB = function(r, g, b) {
        context.fillStyle = ["rgb(", r, ",", g, ",", b, ")"].join("");
    };

    this.drawFilledRect = function(x, y, width, height) {
        context.fillRect((scale * x + .5) << 0, (scale * y + .5) << 0, scale * width, scale * height);
    };

    this.drawImageRect = function(image, sourceRect, destRect) {
        context.drawImage(image,
                (sourceRect.x + .5) << 0, (sourceRect.y + .5) << 0, sourceRect.width, sourceRect.height,
                (scale * destRect.x + .5) << 0, (scale * destRect.y + .5) << 0, scale * destRect.width, scale * destRect.height);
    };

    this.drawText = function(x, y, text) {
        context.fillText(text, (scale * x + .5) << 0, (scale * y + .5) << 0);
    };

    this.width = function() { return width; };
    this.height = function() { return height; };

    context.font = (12 * scale) + "px Arial";
    context.textBaseline = 'top';
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
}
