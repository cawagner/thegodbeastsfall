define(["display/fonts"], function(fonts) {
    "use strict";

    var Graphics = function(visibleCanvas, width, height, scale) {
        var offScreenCanvas = document.createElement("canvas"),
            visibleContext = visibleCanvas.getContext('2d'),
            context = offScreenCanvas.getContext('2d');

        var originOffset = { x: 0, y : 0 };

        var font = fonts.deathwake;

        offScreenCanvas.width = width;
        offScreenCanvas.height = height;

        this.width = width;
        this.height = height;

        this.setOrigin = function(x, y) {
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.translate(originOffset.x + (x | 0), originOffset.y + (y | 0), 0);
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

        this.swapBuffers = function() {
            visibleContext.drawImage(offScreenCanvas, 0, 0);
        };

        this.cls = context.clearRect.bind(context, 0,0,width,height);

        this.setFillColor = function(color) {
            context.fillStyle = color;
        };

        this.setFillColorRGB = function(r, g, b) {
            context.fillStyle = ["rgb(", r, ",", g, ",", b, ")"].join("");
        };

        this.drawFilledRect = function(x, y, width, height) {
            context.fillRect(x, y, width, height);
        };

        this.drawImage = context.drawImage.bind(context);

        this.drawImageRect = function(image, sourceRect, destRect) {
            context.drawImage(image,
                    sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height,
                    destRect.x | 0, destRect.y | 0, destRect.width, destRect.height);
        };

        this.setAlpha = function(alpha) {
            context.globalAlpha = alpha;
        }

        this.drawText = function(x, y, text, fontId) {
            (fonts[fontId]||font).drawText(this, x | 0, (y | 0) - 6, text);
        };

        this.setGlobalScale = function(newScale) {
            scale = newScale;
            visibleCanvas.width = newScale * width;
            visibleCanvas.height = newScale * height;
            visibleContext.restore();
            visibleContext.webkitImageSmoothingEnabled = false;
            visibleContext.mozImageSmoothingEnabled = false;
            visibleContext.imageSmoothingEnabled = false;
            visibleContext.scale(newScale, newScale);
        };

        this.setGlobalScale(scale);
    };

    return Graphics;
});