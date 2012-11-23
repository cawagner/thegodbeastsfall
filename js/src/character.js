define(["underscore", "dice"], function(_, Dice) {
    "use strict";

    function Character(options) {
        var defaults = {
            strength: 10,
            agility: 10,
            intelligence: 10,
            luck: 10,
            learnSet: []
        };

        _(this).chain().extend(options).defaults(defaults);
    }

    Character.create = function(options) {
        var character = new Character(options);

        character.level = 1;
        character.hp = 20 + character.strength;
        character.maxHp = character.hp;

        character.mp = Math.max(0, character.intelligence - 5);
        character.maxMp = character.mp;

        character.xp = 0;
        character.xpNext = 100;

        character.face = options.face;

        character.lastStatIncreased = '';

        return character;
    };

    Character.prototype.skillsToLearn = function() {
        var character = this;
        var skillsToLearn = { Fight: [], Magic: [] };
        _(this.learnSet).each(function(skillsOfType, skillType) {
            _(skillsOfType).each(function(statRequirements, skill) {
                var stat, willLearn = true;
                if (!_(character.skills[skillType]).contains(skill)) {
                    for (stat in statRequirements) {
                        willLearn = willLearn && character[stat] >= statRequirements[stat];
                    }
                    if (willLearn) {
                        skillsToLearn[skillType].push(skill);
                    }
                }
            });
        });
        return skillsToLearn;
    };

    Character.prototype.gainLevel = function(statToBoost) {
        var d6 = Dice.parse("d6");
        var hpGain = d6.roll() + Math.floor(Math.max(3, this.strength - 10) / 3);
        var mpGain = Math.ceil(Math.max(4, this.intelligence - 6) / 4);
        var learnedSkills;

        this.maxHp += hpGain;
        this.maxMp += mpGain;

        this.hp += hpGain;
        this.mp += mpGain;

        if (statToBoost !== undefined) {
            this[statToBoost] += 1;
        }

        // if level was gained through non-XP means...
        if (this.xp < this.xpNext) {
            this.xp = this.xpNext;
        }

        this.xpNext = (this.level + 1) * this.level * 100;
        this.level += 1;
        this.lastStatIncreased = statToBoost;

        learnedSkills = this.skillsToLearn();

        console.log(learnedSkills);

        // HACK: too much hardcoded "Fight" and "Magic" in these parts...
        this.skills.Fight = this.skills.Fight.concat(learnedSkills.Fight);
        this.skills.Magic = this.skills.Magic.concat(learnedSkills.Magic);

        return {
            hpGain: hpGain,
            mpGain: mpGain,
            learnedSkills: learnedSkills
        };
    };

    return Character;
});