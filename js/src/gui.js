function GuiRenderer(graphics) {
    this.graphics = graphics;
}

GuiRenderer.prototype.drawWindowRect = function(x, y, width, height) {
    this.graphics.setFillColor("#000");
    this.graphics.drawFilledRect(x - 7, y - 7, width + 14, height + 14);
    this.graphics.setFillColor("#fff");
    this.graphics.drawFilledRect(x - 5, y - 5, width + 10, height + 10);
    this.graphics.setFillColor("#000");
    this.graphics.drawFilledRect(x - 3, y - 3, width + 6, height + 6);
};

GuiRenderer.prototype.drawPortrait = function(x, y, image, frame, withBorder) {
    if (!image)
        return;

    var faceWidth = 48, faceHeight = 48;
    var speakerSrcRect = this.graphics.getRectForFrame(frame, image.width, faceWidth, faceHeight);
    var speakerDestRect = { x: x, y: y, width: faceWidth, height: faceHeight };

    if (withBorder) {
        this.drawWindowRect(speakerDestRect.x, speakerDestRect.y, speakerDestRect.width, speakerDestRect.height);
    }
    this.graphics.drawImageRect(image, speakerSrcRect, speakerDestRect);
};