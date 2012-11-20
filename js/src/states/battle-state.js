<<<<<<< HEAD
define([
    "underscore",
    "game-state",
    "pawns/pawns",
    "gui",
    "battle/battle-menu"
], function(
    _,
    gameState,
    pawns,
    GuiRenderer,
    battleMenu
) {
    var MESSAGE_DELAY = 250;

    function BattleState() {
        var self = this;

        this.gui = new GuiRenderer(Game.instance.graphics);

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        this.partyIndex = 0;

        this.messages = [
            "Aggressed by Rat!",
            "Aggressed by Slime!"
        ];
        this.currentMessage = "";
        this.messageDelay = 0;

        this.currentState = this.messagePhase;
        this.nextState = this.enterCommands;

        // setTimeout(function() {
        //     var menu = self.getMenu();
        //     menu.open();
        // }, 2000);
    };

    BattleState.prototype.messagePhase = function() {
        // TODO: work smarter, not harder
        // this is the "message phase..."
        this.messageDelay--;
        if (this.messageDelay < 0) {
            if (this.advanceMessage()) {
                this.messageDelay = MESSAGE_DELAY;
            } else {
                this.advanceState();
            }
        }
    };

    BattleState.prototype.enqueueState = function(state) {
        this.nextState = state;
    };

    BattleState.prototype.advanceState = function() {
        if (!this.nextState) {
            throw "Tried to advance state, but there is no next state!";
        }
        this.currentState = this.nextState;
        this.nextState = null;
    };

    BattleState.prototype.update = function() {
        this.currentState();
    };

    BattleState.prototype.enterCommands = function() {
        battleMenu.get(this).open();
        this.enqueueState(_.noop);
        this.advanceState();
    };

    BattleState.prototype.advanceMessage = function() {
        return (this.currentMessage = this.messages.shift());
    };

    BattleState.prototype.draw = function() {
        Game.instance.graphics.setFillColorRGB(0, 0, 0);
        Game.instance.graphics.drawFilledRect(0, 0, 320, 240);

        if (this.currentMessage) {
            this.gui.drawTextWindow(10, 10, 300, 20, [this.currentMessage]);
        }
    };

    return BattleState;
});