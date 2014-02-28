define(["constants", "pawns/pawn-base"], function(constants, PawnBase) {
    "use strict";

    function CharacterPawn(character, isBattle) {
        PawnBase.call(this, character);
        this.character = character;
        this.isDying = false;
        this.isDead = false;
        this.type = 'player';
        this.restoreMpOnNextHit = true;
        this.equipment = character.equipment;
        this.archetype = character.archetype;
        this.isBattle = isBattle;
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
            return skill.cooldown + constants.chars.REFRESH + (skill.cooldown - this.cooldowns[skill.name] || skill.cooldown);
        }
        if (skill.mp) {
            return constants.chars.STAR + (""+skill.mp).rset(2);
        }
        return "";
    };

    CharacterPawn.prototype.isAlive = function() {
        return !this.isDead;
    };

    CharacterPawn.prototype.refresh = function() {
        var result = PawnBase.prototype.refresh.call(this);
        if (this.isDying) {
            this.isDead = this.character.hp === 0;
            this.isDying = false;
        }
        this.restoreMpOnNextHit = true;
        return result;
    };

    CharacterPawn.prototype.criticalChance = function() {
        var chance = PawnBase.prototype.criticalChance.call(this);
        return this.isDying ? chance * 3 : chance;
    };

    CharacterPawn.prototype.priority = function() {
        var priority = PawnBase.prototype.priority.call(this);
        if (this.isBattle) {
            if (this.isDying) {
                return -Math.floor(Math.random() * 5);
            } else if (this.hp() < this.maxHp() * .5) {
                return priority * (this.hp() / this.maxHp());
            }
        }
        return priority;
    };

    CharacterPawn.prototype.accuracy = function() {
        var accuracy = PawnBase.prototype.accuracy.call(this);
        return this.isDying ? accuracy * 5 : accuracy;
    };

    return CharacterPawn;
});