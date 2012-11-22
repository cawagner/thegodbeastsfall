define([
    "underscore",
    "jquery",
    "menu"
], function(_, $, Menu) {

    return function BattleWonState(xpPerPerson) {
        this.start = function() {
            var charactersToLevel = [];
            // TODO: handle leveling properly for multiple people!
            _(GameState.instance.party).each(function(member) {
                member.xp += xpPerPerson;
                if (member.xp >= member.xpNext) {
                    charactersToLevel.push(member);
                }
            });
            if (charactersToLevel.length) {
                _(charactersToLevel).each(function(character) {
                    $.publish("/npc/talk", [[{
                        text: [character.name + " grew to level " + (character.level + 1) + "! Choose an attribute to increase."]
                    }]]);
                    new Menu({
                        items: [
                            { text: "STR", stat: 'strength', disabled: character.lastStatIncreased === "strength" },
                            { text: "AGI", stat: 'agility', disabled: character.lastStatIncreased === "agility" },
                            { text: "INT", stat: 'intelligence', disabled: character.lastStatIncreased === "intelligence" },
                            { text: "LUK", stat: 'luck', disabled: character.lastStatIncreased === "luck" }
                        ]
                    }).select(function(index, item) {
                        this.close();
                        Game.instance.popState();
                        character.gainLevel(item.stat);
                        $.publish("/battle/end");
                    }).open();
                })
            } else {
                $.publish("/battle/end");
            }
        };
        this.update = _.noop;
        this.draw = _.noop;
    };
})