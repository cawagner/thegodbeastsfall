define(["pawns/pawn-base"], function(PawnBase) {
    "use strict";

    function CharacterPawn(character) {
        PawnBase.call(this, character);
        this.character = character;
        this.cooldowns = {};
    };

    CharacterPawn.prototype = new PawnBase();

    CharacterPawn.prototype.takeDamage = function(amount) {
        this.character.hp -= amount;
    };

    CharacterPawn.prototype.refresh = function() {
        for (var key in this.cooldowns) {
            this.cooldowns[key] = Math.max(0, this.cooldowns[key] - 1);
        }
    };

    CharacterPawn.prototype.canUseSkill = function(skill) {
        if (skill.cooldown) {
            return (this.cooldowns[skill.name] || 0) === 0;
        }
        return true;
    };

    CharacterPawn.prototype.useSkill = function(skill) {
        if (skill.cooldown) {
            this.cooldowns[skill.name] = skill.cooldown;
        }
    };

    return CharacterPawn;
});