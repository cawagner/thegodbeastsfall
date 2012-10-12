define(["display/fonts"], function(fonts) {
    var Graphics = function(canvasId, width, height, scale) {
        var visibleCanvas = document.getElementById(canvasId),
            offScreenCanvas = document.createElement("canvas"),
            visibleContext = visibleCanvas.getContext('2d'),
            context;
        var originOffset = { x: 0, y : 0 };

        var font = fonts.deathwake;

        offScreenCanvas.width = width;
        offScreenCanvas.height = height;

        context = offScreenCanvas.getContext('2d');

        this.setOrigin = function(x, y) {
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.translate(originOffset.x + x | 0, originOffset.y + y | 0);
        };

        this.withOriginOffset = function(x, y, fn) {
            var oldOffset = { x : originOffset.x, y : originOffset.y };
            originOffset = { x: originOffset.x + x, y : originOffset.y + y };
            fn();
            originOffset = oldOffset;
        };

        this.getRectForFrame = function(frame, imageWidth, frameWidth, frameHeight) {
            var framesInRow = Math.floor(imageWidth / frameWidth);
            return {
                x: frameWidth * (frame % framesInRow),
                y: Math.floor(frame / framesInRow) * frameHeight,
                width: frameWidth,
                height: frameHeight
            };
        };

        this.setFont = function(newFont) {
            font = newFont;
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
            font.drawText(this, x | 0, (y | 0) - 6, text);
        };

        this.width = function() { return width; };
        this.height = function() { return height; };

        this.setScale = function(newScale) {
            scale = newScale;
            visibleCanvas.width = newScale * width;
            visibleCanvas.height = newScale * height;
            visibleContext.restore();
            visibleContext.webkitImageSmoothingEnabled = false;
            visibleContext.mozImageSmoothingEnabled = false;
            visibleContext.imageSmoothingEnabled = false;
            visibleContext.scale(newScale, newScale);
        };

        this.setScale(scale);
    };

    return Graphics;
});