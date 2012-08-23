function MainMenuState() {
    this.draw = function() {

    };

    this.update = function() {
        GameState.instance.newGame();
    };
}
