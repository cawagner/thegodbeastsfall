define([
    "dice",
    "equipment",
    "pawns/pawn-base",
    "data/enemies",
    "json!enemy-families.json",
    "data/skills"
], function(
    Dice,
    Equipment,
    PawnBase,
    enemies,
    enemyFamilies,
    skills
) {
    "use strict";

    var enemyImage = new Image();
    enemyImage.src = "assets/img/enemies.png";

    // TODO: enemies besides rats!
    function EnemyPawn(enemyId) {
        var proto = enemies[enemyId];
        var hitDice;

        PawnBase.call(this, proto);

        this.enemy = proto;
        this.desc = proto.name;
        this.rect = proto.rect;
        this.skills = proto.skills;
        this.image = enemyImage;
        this.buffs = proto.buffs || {};
        this.family = enemyFamilies[proto.family] || enemyFamilies["default"];

        hitDice = Dice.parse(proto.hp + "");
        this.rolledHp = hitDice.roll();
        this.currentHp = this.rolledHp;
        this.currentMp = proto.mp || 0;

        this.equipment = new Equipment();

        this.type = 'enemy';
    };

    EnemyPawn.prototype = new PawnBase();

    EnemyPawn.prototype.hp = function() {
        return this.currentHp;
    };

    EnemyPawn.prototype.maxHp = function() {
        return this.rolledHp;
    };

    EnemyPawn.prototype.damageReduction = function() {
        return this.enemy.damageReduction || this.enemy.strength;
    };
    EnemyPawn.prototype.damageAbsorption = function() {
        return this.enemy.damageAbsorption || 10+this.enemy.strength;
    };

    EnemyPawn.prototype.usableSkills = function() {
        var self = this;
        return _(this.enemy.skills).filter(function(skill) {
            return self.canUseSkill(skills[skill]);
        });
    };

    EnemyPawn.prototype.takeDamage = function(amount) {
        this.currentHp -= amount;
    };

    EnemyPawn.prototype.restoreHp = function(amount) {
        this.currentHp = Math.min(this.maxHp(), this.currentHp + amount);
    };

    EnemyPawn.prototype.restoreMp = function(amount) {
        this.currentMp = Math.min(this.maxMp(), this.currentMp + amount);
    }

    EnemyPawn.prototype.xp = function() {
        return this.enemy.xp;
    };

    EnemyPawn.prototype.consumeMp = function(amount) {
        this.currentMp -= amount;
    };

    return EnemyPawn;
});