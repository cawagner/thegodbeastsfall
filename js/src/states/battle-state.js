define([
    "underscore",
    "game-state",
    "pawns/pawns",
    "gui",
    "menu"
], function(
    _,
    gameState,
    pawns,
    GuiRenderer,
    Menu
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

    BattleState.prototype.skillsOfType = function(type) {
        var self = this;
        return function() {
            var member = self.playerPawns[self.partyIndex];
            var skills = member.character.skills[type];
            return new Menu({
                items: skills
            });
        };
    };

    BattleState.prototype.getMenu = function() {
        return new Menu({
            hierarchical: true,
            rows: 2,
            cols: 2,
            x: 10,
            y: 200,
            items: [
                { text: "Fight", childMenu: this.skillsOfType("Fight") },
                { text: "Magic", childMenu: this.skillsOfType("Magic") },
                { text: "Item", childMenu: new Menu() },
                {
                    text: "Tactic",
                    childMenu: new Menu({
                        items: [ "Defend", "Run Away", "Inspect" ],
                        rows: 1,
                        cols: 3,
                        x: 10,
                        y: 200
                    })
                }
            ],
            cancel: _.give(false)
        });
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
        this.getMenu().open();
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