define(["pawns/pawn-base"], function(PawnBase) {
    "use strict";

    function CharacterPawn(character) {
        PawnBase.call(this, character);
        this.character = character;
        this.isDying = false;
        this.isDead = false;
        this.type = 'player';
        this.restoreMpOnNextHit = true;
        this.equipment = character.equipment;
    };

    CharacterPawn.prototype = new PawnBase();

    CharacterPawn.prototype.dealtDamage = function(amount, damageType) {
        if (damageType === "melee" && this.restoreMpOnNextHit) {
            this.restoreMpOnNextHit = false;
            this.restoreMp(1); // only players receive this bonus...
        }
    };

    CharacterPawn.prototype.takeDamage = function(amount) {
        this.character.hp = Math.max(0, this.character.hp - amount);
        if (this.character.hp === 0) {
            this.isDying = true;
        }
    };

    CharacterPawn.prototype.consumeMp = function(amount) {
        this.character.mp -= amount;
    };

    CharacterPawn.prototype.restoreHp = function(amount) {
        this.character.hp = Math.min(this.maxHp(), this.character.hp + amount);
    };

    CharacterPawn.prototype.restoreMp = function(amount) {
        this.character.mp = Math.min(this.maxMp(), this.character.mp + amount);
    };

    CharacterPawn.prototype.formatCost = function(skill) {
        if (skill.cooldown) {
            return skill.cooldown + "^" + (skill.cooldown - this.cooldowns[skill.name] || skill.cooldown);
        }
        if (skill.mp) {
            return skill.mp + "MP";
        }
        return "";
    };

    CharacterPawn.prototype.isAlive = function() {
        return !this.isDead;
    };

    CharacterPawn.prototype.refresh = function() {
        var result = PawnBase.prototype.refresh.apply(this);
        if (this.isDying) {
            this.isDead = this.character.hp === 0;
            this.isDying = false;
        }
        this.restoreMpOnNextHit = true;
        return result;
    };

    return CharacterPawn;
});