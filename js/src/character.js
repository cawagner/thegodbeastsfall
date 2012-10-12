define(["underscore", "dice"], function(_, Dice) {
    "use strict";

    function Character(options) {
        var defaults = {
            strength: 10,
            agility: 10,
            intelligence: 10,
            luck: 10
        };

        _(this).chain().extend(options).defaults(defaults);
    }

    Character.create = function(options) {
        var character = new Character(options);

        character.level = 1;
        character.hp = 10 + character.strength;
        character.maxHp = character.hp;

        character.mp = Math.max(0, character.intelligence - 5);
        character.maxMp = character.mp;

        character.xp = 0;
        character.xpNext = 100;

        character.face = options.face;

        return character;
    }

    Character.prototype.gainLevel = function(statToBoost) {
        var d4 = Dice.parse("d4");
        var hpGain = d4.roll() + Math.floor(Math.max(4, this.strength - 10) / 4);
        var mpGain = Math.ceil(Math.max(4, this.intelligence - 6) / 4);

        this.maxHp += hpGain;
        this.maxMp += mpGain;

        this.hp = this.maxHp;
        this.mp = this.maxMp;

        if (statToBoost !== undefined) {
            this[statToBoost] += 1;
        }

        // if level was gained through non-XP means...
        if (this.xp < this.xpNext) {
            this.xp = this.xpNext;
        }

        this.xpNext = (this.level + 1) * this.level * 100;
        this.level += 1;
    };

    return Character;
});