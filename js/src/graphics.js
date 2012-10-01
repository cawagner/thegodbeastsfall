function DeathwakeFont() {
    var rows = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "abcdefghijklmnopqrstuvwxyz",
        "0123456789.:,;+-*/=^_?",
        "!\"#$%`'(){@"
    ];

    var table = (function() {
        var result = {};
        var row, col, chars, c;
        for (row = 0; row < rows.length; ++row) {
            chars = rows[row];
            for (col = 0; col < chars.length; ++col) {
                c = chars[col];
                result[c] = { x: col * 8, y: row * 16, width: 6, height: 18 };
            }
        }
        return result;
    })();

    var image = new Image();
    image.src = "assets/img/deathwake.png";

    this.drawText = function(graphics, x, y, text) {
        var i, srcRect, dstRect = { x: x, y: y, width: 6, height: 18 };

        for (i = 0; i < text.length; ++i) {
            srcRect = table[text[i]];
            if (srcRect) {
                graphics.drawImageRect(image, srcRect, dstRect);
            }
            dstRect.x += 6;
        }
    };
};

function Graphics(canvasId, width, height, scale) {
    var visibleCanvas = document.getElementById(canvasId),
        offScreenCanvas = document.createElement("canvas"),
        visibleContext = visibleCanvas.getContext('2d'),
        context;
    var originOffset = { x: 0, y : 0 };
    var font = new DeathwakeFont();

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

    context.font = "8px 'Press Start 2P', Fixedsys, Courier";
    context.textBaseline = 'top';

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
}
