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

    function BattleMessageState(messages) {
        this.gui = new GuiRenderer(Game.instance.graphics);

        this.messageDelay = 0;
        this.currentMessage = "";
        this.messages = messages;

        this.start = _.noop;

        this.update = function() {
            // TODO: work smarter, not harder
            // this is the "message phase..."
            this.messageDelay--;
            if (this.messageDelay < 0) {
                if (this.advanceMessage()) {
                    this.messageDelay = MESSAGE_DELAY;
                } else {
                    return true;
                }
            }
        };

        this.advanceMessage = function() {
            return (this.currentMessage = this.messages.shift());
        };

        this.draw = function() {
            this.gui.drawTextWindow(10, 10, 300, 20, [this.currentMessage]);
        };
    }

    function BattleMenuState(battle) {
        this.start = function() {
            battleMenu.get(battle).open();
        };

        this.update = _.noop;
        this.draw = _.noop;
    };

    function BattleState() {
        var self = this;

        this.gui = new GuiRenderer(Game.instance.graphics);

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        this.partyIndex = 0;

        this.queuedStates = [];

        this.enqueueState(new BattleMessageState([
            "Aggressed by Rat!",
            "Aggressed by Slime!"
        ]));
        this.enqueueState(new BattleMenuState(this));

        this.advanceState();

        // setTimeout(function() {
        //     var menu = self.getMenu();
        //     menu.open();
        // }, 2000);
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