define([
    "underscore",
    "game-state",
    "pawns/pawns",
    "gui",
    "battle/battle-message-state",
    "battle/battle-menu-state"
], function(
    _,
    gameState,
    pawns,
    GuiRenderer,
    BattleMessageState,
    BattleMenuState
) {
    function BattleState() {
        var self = this;

        this.gui = new GuiRenderer(Game.instance.graphics);

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        this.enemyPawns = [
            { name: "Rat" },
            { name: "Slime" }
        ];

        this.queuedStates = [];

        this.enqueueState(new BattleMessageState(_(this.enemyPawns).map(_.template("Aggressed by {{name}}!"))));
        this.enqueueState(new BattleMenuState(this));

        this.advanceState();
    };

    BattleState.prototype.enqueueState = function(state) {
        this.queuedStates.push(state);
    };

    BattleState.prototype.advanceState = function(result) {
        if (!this.queuedStates.length) {
            throw "Tried to advance state, but there is no next state!";
        }
        this.currentState = this.queuedStates.shift();
        this.currentState.start(result);
    };

    BattleState.prototype.update = function() {
        var result;
        if (result = this.currentState.update()) {
            this.advanceState(result);
        }
    };

    BattleState.prototype.draw = function() {
        Game.instance.graphics.setFillColorRGB(0, 0, 0);
        Game.instance.graphics.drawFilledRect(0, 0, 320, 240);

        this.currentState.draw();
    };

    return BattleState;
});