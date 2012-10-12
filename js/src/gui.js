define([], function() {
    function GuiRenderer(graphics) {
        this.graphics = graphics;
        this.lineHeight = 16;
    }

    GuiRenderer.prototype.drawWindowRect = function(x, y, width, height) {
        this.graphics.setFillColor("#000");
        this.graphics.drawFilledRect(x - 7, y - 7, width + 14, height + 14);
        this.graphics.setFillColor("#fff");
        this.graphics.drawFilledRect(x - 5, y - 5, width + 10, height + 10);
        this.graphics.setFillColor("#000");
        this.graphics.drawFilledRect(x - 3, y - 3, width + 6, height + 6);
    };

    GuiRenderer.prototype.drawTextWindow = function(x, y, width, height, lines) {
        this.drawWindowRect(x, y, width, height);
        this.drawTextLines(x, y, lines);
    };

    GuiRenderer.prototype.drawTextLines = function(x, y, lines) {
        var self = this;
        this.graphics.setFillColor("#fff");
        _(lines).each(function(text, line) {
            self.graphics.drawText(x + 2, y + 2 + line * self.lineHeight, text);
        });
        return y + 2 + lines.length * self.lineHeight;
    };

    GuiRenderer.prototype.drawPortrait = function(x, y, name, withBorder) {
        var speaker = SPEAKERS[name], image = SPEAKERS[name] && SPEAKERS[name].image, frame = SPEAKERS[name] && SPEAKERS[name].frame;
        if (!speaker || !image || frame === undefined)
            return;

        var faceWidth = 48, faceHeight = 48;
        var speakerSrcRect = this.graphics.getRectForFrame(frame, image.width, faceWidth, faceHeight);
        var speakerDestRect = { x: x, y: y, width: faceWidth, height: faceHeight };

        if (withBorder) {
            this.drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
        }
        this.graphics.drawImageRect(image, speakerSrcRect, speakerDestRect);
    };

    return GuiRenderer;
});