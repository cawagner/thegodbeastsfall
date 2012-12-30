define(["underscore",
    "constants",
    "graphics",
    "json!speakers.json",
    "image!assets/img/faces.png"
], function(_, constants, graphics, speakers, facesImage) {
    "use strict";

    var STATUS_WINDOW_WIDTH = 36, STATUS_WINDOW_HEIGHT = 44;

    function GuiRenderer() {
        this.lineHeight = 16;
    }

    GuiRenderer.prototype.drawWindowRect = function(x, y, width, height) {
        graphics.setFillColor(constants.WINDOW_OB_COLOR);
        graphics.drawFilledRect(x - 7, y - 7, width + 14, height + 14);
        graphics.setFillColor(constants.WINDOW_IB_COLOR);
        graphics.drawFilledRect(x - 5, y - 5, width + 10, height + 10);
        graphics.setFillColor(constants.WINDOW_BG_COLOR);
        graphics.drawFilledRect(x - 3, y - 3, width + 6, height + 6);
    };

    GuiRenderer.prototype.drawTextWindow = function(x, y, width, height, lines, charactersRevealed, font) {
        this.drawWindowRect(x, y, width, height);
        this.drawTextLines(x, y, lines, charactersRevealed, font);
    };

    GuiRenderer.prototype.drawTextLines = function(x, y, lines, charactersRevealed, font) {
        var self = this, charsSoFar = 0, charsInLine;
        _(lines).each(function(text, i) {
            if (charactersRevealed === undefined || charactersRevealed >= charsSoFar + text.length) {
                graphics.drawText(x + 2, y + 2 + i * self.lineHeight, text, font);
                charsSoFar += text.length;
            } else {
                charsInLine = charactersRevealed - charsSoFar;
                if (charsInLine > 0) {
                    graphics.drawText(x + 2, y + 2 + i * self.lineHeight, text.substring(0, charsInLine), font);
                }
                charsSoFar += charsInLine;
            }
        });
        return y + 2 + lines.length * self.lineHeight;
    };

    GuiRenderer.prototype.drawPortrait = function(x, y, name, withBorder) {
        var speaker = speakers[name] || {};
        var speakerSrcRect, speakerDestRect;
        if (speaker.frame !== undefined) {
            speakerSrcRect = graphics.getRectForFrame(speaker.frame, facesImage.width, constants.FACE_WIDTH, constants.FACE_HEIGHT);
            speakerDestRect = { x: x, y: y, width: constants.FACE_WIDTH, height: constants.FACE_HEIGHT };

            if (withBorder) {
                this.drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
            }
            graphics.drawImageRect(facesImage, speakerSrcRect, speakerDestRect);
        }
    };

    GuiRenderer.prototype.drawStatus = function(x, y, ally) {
        this.drawTextWindow(x, y, STATUS_WINDOW_WIDTH, STATUS_WINDOW_HEIGHT, [
            _(ally).result("name").toUpperCase(),
            constants.chars.HEART + (""+_(ally).result("hp")).rset(3),
            constants.chars.STAR + (""+_(ally).result("mp")).rset(3)]
        );
    };

    GuiRenderer.prototype.drawPointer = function(x, y) {
        graphics.drawText(x, y + 4, constants.chars.POINTER);
    };

    return new GuiRenderer();
});