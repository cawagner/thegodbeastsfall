function MainMenuState() {
    this.draw = function() {

    };

    this.update = _.once(function() {
        GameState.instance.newGame();
    });
}
