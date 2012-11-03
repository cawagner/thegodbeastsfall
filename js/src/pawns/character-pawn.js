define(["underscore"], function(_) {
    "use strict";

    function CharacterPawn(character) {
        this.character = character;
    }

    _(CharacterPawn.prototype).extend({
        name: function() {
            return this.character.name;
        },
        hp: function() {
            return this.character.hp;
        },
        maxHp: function() {
            return this.character.maxHp;
        },
        mp: function() {
            return this.character.mp;
        },
        maxMp: function() {
            return this.character.maxMp;
        },
        strength: function() {
            return this.character.strength;
        },
        agility: function() {
            return this.character.agility;
        },
        intelligence: function() {
            return this.character.intelligence;
        },
        luck: function() {
            return this.character.luck;
        },
        attack: function() {
            // TODO: factor in weapon / buffs!
            return this.character.strength;
        },
        defense: function() {
            // TODO: factor in armor / buffs!
            return this.character.strength;
        },
        priority: function() {
            return this.character.agility;
        },
        accuracy: function() {
            return Math.floor((3*(this.character.strength + this.character.agility) + this.character.luck) / 6 + 57);
        },
        evade: function() {
            return Math.floor((3 * this.character.agility + this.character.luck) / 4);
        },
        force: function() {
            return Math.floor((2 * this.character.intelligence + this.character.agility) / 3);
        },
        support: function() {
            return Math.floor((2 * this.character.intelligence + this.character.luck) / 3);
        },
        resist: function() {
            return Math.floor((this.character.intelligence + this.character.strength) / 2);
        },
        criticalChance: function() {
            return this.character.luck;
        },
        criticalMultiplier: function() {
            return 2;
        },
        takeDamage: function() {
        }
    });

    return CharacterPawn;
});