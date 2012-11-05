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
        var gui = new GuiRenderer(Game.instance.graphics);

        var playerPawns = _(gameState.party).map(function(character) {
            return new pawns.CharacterPawn(character);
        });

        var partyIndex = 0;

        var skillsOfType = function(type) {
            return function() {
                var member = playerPawns[partyIndex];
                var skills = member.character.skills[type];
                return new Menu({
                    items: skills
                });
            }
        };

        var menuOptions = {
            hierarchical: true,
            rows: 2,
            cols: 2,
            x: 10,
            y: 200,
            items: [
                { text: "Fight", childMenu: skillsOfType("Fight") },
                { text: "Magic", childMenu: skillsOfType("Magic") },
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
        };
        var menu = new Menu(menuOptions);

        setTimeout(function() {
            menu.open();
        }, 2000);

        this.update = function() {

        };

        this.draw = function() {
            Game.instance.graphics.setFillColorRGB(0, 0, 0);
            Game.instance.graphics.drawFilledRect(0, 0, 320, 240);


        };
    }

    return BattleState;
});