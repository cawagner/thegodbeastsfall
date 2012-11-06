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
    function BattleState() {
        var self = this;

        this.gui = new GuiRenderer(Game.instance.graphics);

        this.playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        this.partyIndex = 0;

        setTimeout(function() {
            var menu = self.getMenu();
            menu.open();
        }, 2000);
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

    BattleState.prototype.update = function() {

    };

    BattleState.prototype.draw = function() {
        Game.instance.graphics.setFillColorRGB(0, 0, 0);
        Game.instance.graphics.drawFilledRect(0, 0, 320, 240);

    };

    return BattleState;
});