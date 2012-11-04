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
                return new Menu(skills);
            }
        };

        var menu = new Menu([
            {
                text: "Fight",
                childMenu: skillsOfType("Fight")
            },
            {
                text: "Magic",
                childMenu: skillsOfType("Magic")
            },
            { text: "Item" },
            {
                text: "Tactic",
                childMenu: new Menu([
                    "Defend",
                    "Run Away",
                    "Inspect"
                ]).position(10, 220).size(1, 3)
            }
        ])
        .size(2, 2)
        .position(10, 200)
        .cancel(_.give(false))
        .select(function(index, item) {
            if (item.childMenu) {
                _(item).result("childMenu").open();
            } else {
                //this.close();
            }
        });

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