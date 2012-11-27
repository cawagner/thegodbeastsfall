define(["underscore", "constants", "chars", "display/speakers"], function(_, constants, chars, speakers) {
    "use strict";

    var FACE_WIDTH = 48, FACE_HEIGHT = 48;
    var STATUS_WINDOW_WIDTH = 36, STATUS_WINDOW_HEIGHT = 44;

    function GuiRenderer(graphics) {
        this.graphics = graphics;
        this.lineHeight = 16;
    }

    GuiRenderer.prototype.drawWindowRect = function(x, y, width, height) {
        this.graphics.setFillColor(constants.WINDOW_OB_COLOR);
        this.graphics.drawFilledRect(x - 7, y - 7, width + 14, height + 14);
        this.graphics.setFillColor(constants.WINDOW_IB_COLOR);
        this.graphics.drawFilledRect(x - 5, y - 5, width + 10, height + 10);
        this.graphics.setFillColor(constants.WINDOW_BG_COLOR);
        this.graphics.drawFilledRect(x - 3, y - 3, width + 6, height + 6);
    };

    GuiRenderer.prototype.drawTextWindow = function(x, y, width, height, lines) {
        this.drawWindowRect(x, y, width, height);
        this.drawTextLines(x, y, lines);
    };

    GuiRenderer.prototype.drawTextLines = function(x, y, lines) {
        var self = this;
        this.graphics.setFillColor(constants.WINDOW_TEXT_COLOR);
        _(lines).each(function(text, i) {
            self.graphics.drawText(x + 2, y + 2 + i * self.lineHeight, text);
        });
        return y + 2 + lines.length * self.lineHeight;
    };

    GuiRenderer.prototype.drawPortrait = function(x, y, name, withBorder) {
        var speaker = speakers[name] || {};
        var speakerSrcRect, speakerDestRect;
        if (speaker.image && speaker.frame !== undefined) {
            speakerSrcRect = this.graphics.getRectForFrame(speaker.frame, speaker.image.width, FACE_WIDTH, FACE_HEIGHT);
            speakerDestRect = { x: x, y: y, width: FACE_WIDTH, height: FACE_HEIGHT };

            if (withBorder) {
                this.drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
            }
            this.graphics.drawImageRect(speaker.image, speakerSrcRect, speakerDestRect);
        }
    };

    GuiRenderer.prototype.drawStatus = function(x, y, ally) {
        this.drawTextWindow(x, y, STATUS_WINDOW_WIDTH, STATUS_WINDOW_HEIGHT, [
            _(ally).result("name").toUpperCase(),
            chars.HEART + (""+_(ally).result("hp")).rset(3),
            chars.STAR + (""+_(ally).result("mp")).rset(3)]
        );
    };

    return GuiRenderer;
});