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
