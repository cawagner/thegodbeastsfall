function StatusState(character) {
    this.character = character;
    this.pawn = new CharacterPawn(this.character);

    this.graphics = Game.instance.graphics;
    this.gui = new GuiRenderer(this.graphics);

    this.input = Game.instance.input;
    
    this.previousState = new NoopState();
}

StatusState.prototype.start = function(previousState) {
    this.previousState = previousState;
};

StatusState.prototype.update = function() {
    if (this.input.wasCancelPressed()) {
        Game.instance.popState();
    }
};

StatusState.prototype.draw = function(delta) {
    this.previousState.draw(delta);

    this.gui.drawWindowRect(20, 20, this.graphics.width() - 40, this.graphics.height() - 80);
};
