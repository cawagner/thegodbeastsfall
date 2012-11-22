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
        var usable = true;
        if (skill.cooldown) {
            usable = usable && ((this.cooldowns[skill.name] || 0) === 0);
        }
        if (skill.mp) {
            usable = usable && (this.mp() >= skill.mp);
        }
        return usable;
    };

    CharacterPawn.prototype.useSkill = function(skill) {
        if (skill.cooldown) {
            this.cooldowns[skill.name] = skill.cooldown;
        }
        if (skill.mp) {
            this.character.mp -= skill.mp;
        }
    };

    return CharacterPawn;
});