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
    var self = this;
    this.drawWindowRect(x, y, width, height);

    this.graphics.setFillColor("#fff");
    _(lines).each(function(text, line) {
        self.graphics.drawText(x + 2, y + 2 + line * self.lineHeight, text);
    });
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

function Menu(options) {
    this.cols = 1;
    this.rows = options.length;
    this.options = options;

    this.x = 20;
    this.y = 20;

    this.selectHandlers = [];
    this.cancelHandlers = [];
}

Menu.prototype.position = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
};

Menu.prototype.size = function(rows, cols) {
    this.rows = rows;
    this.cols = cols || this.cols;
    return this;
};

Menu.prototype.select = function(fn) {
    this.selectHandlers.push(fn);
    return this;
};

Menu.prototype.triggerSelect = function(selectionIndex, item) {
    var self = this;
    _(this.selectHandlers).each(function(f) {
        f.call(self, selectionIndex, item);
    });
};

Menu.prototype.cancel = function(fn) {
    this.cancelHandlers.push(fn);
    return this;
};

Menu.prototype.triggerCancel = function() {
    var self = this, suppressClose;
    _(this.cancelHandlers).each(function(f) {
        suppressClose = suppressClose || (f.call(self) === false);
    });
    if (!suppressClose) {
        self.close();
    }
}

Menu.prototype.close = function() {
    $.publish("/menu/close", [this]);
    return this;
};

Menu.prototype.open = function() {
    $.publish("/menu/open", [this]);
    return this;
};
