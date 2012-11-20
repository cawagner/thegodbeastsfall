define(["underscore", "menu"], function(_, Menu) {
    "use strict";

    // TODO: this knows way too much about battleState!

    var skillsOfType = function(type, battleState, partyIndex) {
        var self = battleState;
        return function() {
            var member = self.playerPawns[partyIndex];
            var skills = member.character.skills[type];
            return new Menu({
                items: skills
            });
        };
    };

    var getMenu = function(battleState, partyIndex) {
        return new Menu({
            hierarchical: true,
            rows: 2,
            cols: 2,
            x: 10,
            y: 200,
            items: [
                { text: "Fight", childMenu: skillsOfType("Fight", battleState, partyIndex) },
                { text: "Magic", childMenu: skillsOfType("Magic", battleState, partyIndex) },
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

    function BattleMenuState(battleState) {
        var partyIndex = 0;

        this.start = function() {
            getMenu(battleState, partyIndex).open();
        };

        this.update = _.noop;
        this.draw = _.noop;
    };

    return BattleMenuState;
});