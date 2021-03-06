define([
    "underscore",
    "radio",
    "game",
    "menu",
    "states/dialogue-state",
    "graphics",
    "game-state",
    "data/skills"
], function(
    _,
    radio,
    game,
    Menu,
    DialogueState,
    graphics,
    gameState,
    skills
) {
    "use strict";

    var character;

    var nextCharacterToLevel = function() {
        var i, member;
        for (i = 0; i < gameState.party.length; ++i) {
            member = gameState.party[i];
            if (member.xp >= member.xpNext) {
                return member;
            }
        }
        return null;
    };

    var levelCharacters = function() {
        var levelUpMenu;
        character = nextCharacterToLevel();
        if (character) {
            levelUpMenu = new Menu({
                items: [
                    { text: "STR", stat: 'strength', disabled: character.lastStatIncreased === "strength" },
                    { text: "AGI", stat: 'agility', disabled: character.lastStatIncreased === "agility" },
                    { text: "INT", stat: 'intelligence', disabled: character.lastStatIncreased === "intelligence" },
                    { text: "LUK", stat: 'luck', disabled: character.lastStatIncreased === "luck" }
                ]
            });
            levelUpMenu.on('select', function(e) {
                var gains = character.gainLevel(e.item.stat);
                var growthText = [];

                e.sender.close();

                character = null;

                growthText.push("Maximum HP went up by " + gains.hpGain + "!");
                growthText.push("Maximum MP went up by " + gains.mpGain + "!");

                (gains.learnedSkills.Fight || []).forEach(function(learnedSkill) {
                    growthText.push('Learned the technique "' + skills[learnedSkill.skill].name + '"!');
                });
                (gains.learnedSkills.Magic || []).forEach(function(learnedSkill) {
                    growthText.push('Learned the spell "' + skills[learnedSkill.skill].name + '"!');
                });

                game.pushState(new DialogueState(
                    { text: growthText },
                    function() {
                        setTimeout(levelCharacters, 1);
                    }
                ));
            });
            levelUpMenu.open();
        } else {
            setTimeout(function() {
                radio("/battle/end").broadcast({ result: 'won' });
            }, 1);
        }
    };

    return function BattleWonState(xpPerPerson, drops) {
        this.start = function() {
            // TODO: handle leveling properly for multiple people!
            gameState.party.forEach(function(member) {
                member.xp += xpPerPerson;
            });

            // TODO: display spoils to the user!
            _(drops).each(function(quantity, item) {
                gameState.inventory.addItem(item, quantity);
            });

            levelCharacters();
        };
        this.update = function() {};
        this.draw = function() {
            if (character) {
                graphics.drawText(120, 20, character.name + " grew to level " + (character.level + 1) + "!");
                graphics.drawText(120, 36, "Choose an attribute to increase.");
            }
        }
    };
});