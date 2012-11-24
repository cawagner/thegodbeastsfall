define([
    "underscore",
    "jquery",
    "menu",
    "states/dialogue-state",
    "json!skills.json"
], function(_, $, Menu, DialogueState, skills) {

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
                        var gains = character.gainLevel(item.stat);
                        var growthText = [];

                        this.close();
                        Game.instance.popState();

                        growthText.push("Maximum HP went up by " + gains.hpGain + "!");
                        growthText.push("Maximum MP went up by " + gains.mpGain + "!");

                        _(gains.learnedSkills.Fight).each(function(id) {
                            growthText.push('Learned the technique "' + skills[id].name + '"!');
                        });
                        _(gains.learnedSkills.Magic).each(function(id) {
                            growthText.push('Learned the spell "' + skills[id].name + '"!');
                        });

                        Game.instance.pushState(new DialogueState(
                            [{ text: growthText }],
                            function() {
                                setTimeout(function() {
                                    $.publish("/battle/end");
                                }, 1);
                            }
                        ));
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