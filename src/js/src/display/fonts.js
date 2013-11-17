define([
    "image!../assets/img/deathwake.png",
    "image!../assets/img/deathwake_disabled.png",
    "image!../assets/img/kesjfont.png"
], function(normal, disabled, kesj) {
    "use strict";

    function DeathwakeFont(image) {
        var rows = [
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz",
            "0123456789.:,;+-*/=^_?>^&",
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

    function KesjFont(image) {
        var alphabet = "abdefghijklmnoprstuvyz";

        this.drawText = function(graphics, x, y, text) {
            var i,
                c,
                srcRect = { x: 0, y: 0, width: 10, height: 10 },
                dstRect = { x: x, y: y + 4, width: 10, height: 10 };

            var lowerText = text.toLowerCase();

            for (i = 0; i < text.length; ++i) {
                if (lowerText[i] === "y") {
                    dstRect.y -= 1;
                    dstRect.x -= 6;
                }

                c = null;

                if (alphabet.indexOf(lowerText[i].toLowerCase()) >= 0) {
                    c = lowerText.charCodeAt(i) - 'a'.charCodeAt(0);
                }

                if (text[i] === '.') {
                    c = 'q'.charCodeAt(0) - 'a'.charCodeAt(0);
                }

                if (text[i] === '"') {
                    c = 'x'.charCodeAt(0) - 'a'.charCodeAt(0);
                }

                if (c !== null) {
                    srcRect.x = c * 10;
                    graphics.drawImageRect(image, srcRect, dstRect);

                    // really is uppercase... add the naming dot
                    if (text[i] !== lowerText[i]) {
                        srcRect.x = 2 * 10;
                        graphics.drawImageRect(image, srcRect, dstRect);
                    }
                }
                dstRect.x += 6;
                dstRect.y = y + 4;
            }
        };
    };

    return {
        normal: new DeathwakeFont(normal),
        disabled: new DeathwakeFont(disabled),
        kesj: new KesjFont(kesj)
    }
});