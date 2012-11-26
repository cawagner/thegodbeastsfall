define([], function() {
    "use strict";

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

    return {
        deathwake: new DeathwakeFont()
    }
});