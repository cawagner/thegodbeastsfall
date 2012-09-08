function FieldMenuState(menu) {
	var self = this;

    this.menu = new Menu([
        "Status",
        "Zauber",
        "Items",
        {
        	text: "System",
        	childMenu: new Menu([
        		"Save",
        		"Load",
        		"Options"
    		])
        }
    ]).select(function(index, item) {
    	if (item.childMenu) {
    		_(item).result("childMenu").open();
    	} else {
        	this.close();
        }
    }).size(2, 2);

    this.menuState = new MenuState(this.menu);
    this.gui = this.menuState.gui;
    this.previousState = new NoopState();
}

FieldMenuState.prototype.start = function(previousState) {
    this.previousState = previousState;
};

FieldMenuState.prototype.update = function(delta) {
	this.previousState.update(delta);
	this.menuState.update(delta);
};

FieldMenuState.prototype.draw = function(delta) {
	this.previousState.draw(delta);
	this.menuState.draw(delta);

	this.gui.drawTextWindow(260, 180, 36, 44, ["HELD", "\u2665 25", "\u2605 10"])
};

FieldMenuState.prototype.suspend = function() {

};

FieldMenuState.prototype.reactivate = function() {

};


