define([
    "underscore",
    "jquery",
    "menu",
    "states/dialogue-state",
    "json!skills.json"
], function(_, $, Menu, DialogueState, skills) {

    "use strict";

    var character;

    var nextCharacterToLevel = function() {
        var i, member;
        for (i = 0; i < GameState.instance.party.length; ++i) {
            member = GameState.instance.party[i];
            if (member.xp >= member.xpNext) {
                return member;
            }
        }
        return null;
    };

    var levelCharacters = function() {
        character = nextCharacterToLevel();
        if (character) {
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

                character = null;

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
                        setTimeout(levelCharacters, 1);
                    }
                ));
            }).open();
        } else {
            setTimeout(function() {
                $.publish("/battle/end");
            }, 1);
        }
    };

    return function BattleWonState(xpPerPerson) {
        this.start = function() {
            // TODO: handle leveling properly for multiple people!
            _(GameState.instance.party).each(function(member) {
                member.xp += xpPerPerson;
            });

            levelCharacters();
        };
        this.update = _.noop;
        this.draw = function() {
            if (character) {
                Game.instance.graphics.drawText(120, 20, character.name + " grew to level " + (character.level + 1) + "!");
                Game.instance.graphics.drawText(120, 36, "Choose an attribute to increase.");
            }
        }
    };
})