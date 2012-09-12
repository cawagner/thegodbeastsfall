function MenuState(menu) {
    this.menu = menu;
    this.graphics = Game.instance.graphics;
    this.gui = new GuiRenderer(this.graphics);
    this.previousState = new NoopState();
    this.selectionIndex = 0;
    this.input = Game.instance.input;

    var subscription = $.subscribe("/menu/close", function(menuToClose) {
        if (menuToClose === menu) {
            $.unsubscribe(subscription);
            Game.instance.popState();
        }
    });
}

MenuState.prototype.start = function(previousState) {
    this.previousState = previousState;
};

MenuState.prototype.update = function() {
    if (this.input.wasUpPressed()) {
        this.selectionIndex = Math.max(0, this.selectionIndex - this.menu.cols);
    }
    if (this.input.wasDownPressed()) {
        this.selectionIndex = Math.min(this.menu.options.length - 1, this.selectionIndex + this.menu.cols);
    }
    if (this.input.wasLeftPressed()) {
        this.selectionIndex = Math.max(0, this.selectionIndex - 1);
    }
    if (this.input.wasRightPressed()) {
        this.selectionIndex = Math.min(this.menu.options.length - 1, this.selectionIndex + 1);
    }
    if (this.input.wasConfirmPressed()) {
        this.menu.triggerSelect(this.selectionIndex, this.menu.options[this.selectionIndex]);
    }
    if (this.input.wasCancelPressed()) {
        this.menu.triggerCancel();
    }

    this.previousState.update();
};

MenuState.prototype.draw = function(delta) {
    var i, x, y, item, colWidth = 80;
    
    this.previousState.draw(delta);

    this.gui.drawWindowRect(this.menu.x, this.menu.y, this.menu.cols * colWidth, this.menu.rows * this.gui.lineHeight);
    this.graphics.setFillColor("#fff");

    for (i = 0; i < this.menu.options.length; ++i) {
        item = this.menu.options[i] instanceof String ? this.menu.options[i] : this.menu.options[i].text || this.menu.options[i].toString();
        x = i % this.menu.cols;
        y = Math.floor(i / this.menu.cols);
        this.graphics.drawText(this.menu.x + x * colWidth + 12, 4 + this.menu.y + y * this.gui.lineHeight, item);
    }

    x = this.selectionIndex % this.menu.cols;
    y = Math.floor(this.selectionIndex / this.menu.cols);

    this.graphics.drawText(this.menu.x + x * colWidth, 4 + this.menu.y + y * this.gui.lineHeight, "\u25b6");
};

MenuState.prototype.suspend = function() {

};

MenuState.prototype.reactivate = function() {

};