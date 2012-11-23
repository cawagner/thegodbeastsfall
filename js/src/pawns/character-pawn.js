define(["pawns/pawn-base"], function(PawnBase) {
    "use strict";

    function CharacterPawn(character) {
        PawnBase.call(this, character);
        this.character = character;
    };

    CharacterPawn.prototype = new PawnBase();

    CharacterPawn.prototype.takeDamage = function(amount) {
        this.character.hp = Math.max(0, this.character.hp - amount);
    };

    CharacterPawn.prototype.consumeMp = function(amount) {
        this.character.mp -= amount;
    };

    CharacterPawn.prototype.restoreHp = function(amount) {
        this.character.hp = Math.min(this.character.maxHp, this.character.hp + amount);
    };

    CharacterPawn.prototype.formatCost = function(skill) {
        if (skill.cooldown) {
            return skill.cooldown + "^" + (skill.cooldown - this.cooldowns[skill.name] || skill.cooldown);
        }
        if (skill.mp) {
            return skill.mp;
        }
        return "";
    };

    return CharacterPawn;
});