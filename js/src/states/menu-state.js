function MenuState(menu) {
    this.menu = menu;
    this.graphics = Game.instance.graphics;
    this.gui = new GuiRenderer(this.graphics);
    this.previousState = new NoopState();

    console.log(menu);
}

MenuState.prototype.start = function(previousState) {
	this.previousState = previousState;
}

MenuState.prototype.update = function() {
	
};

MenuState.prototype.draw = function(delta) {
	var i, x, y, item, colWidth = 80;
	
	this.previousState.draw(delta);

	this.gui.drawWindowRect(this.menu.x, this.menu.y, this.menu.cols * colWidth, this.menu.rows * this.gui.lineHeight);
	this.graphics.setFillColor("#fff");

	for (i = 0; i < this.menu.options.length; ++i) {
		item = this.menu.options[i];
		x = i % this.menu.cols;
		y = Math.floor(i / this.menu.cols);
		this.graphics.drawText(this.menu.x + x * colWidth + 16, 4 + this.menu.y + y * this.gui.lineHeight, item.toString());
	}
};

MenuState.prototype.suspend = function() {

};

MenuState.prototype.reactivate = function() {

};