define(["pawns/pawn-base", "json!enemies.json", "json!skills.json"], function(PawnBase, enemies, skills) {
    "use strict";

    var enemyImage = new Image();
    enemyImage.src = "assets/img/enemies.png";

    // TODO: enemies besides rats!
    function EnemyPawn(enemyId) {
        var proto = enemies[enemyId];
        PawnBase.call(this, proto);

        this.enemy = proto;
        this.desc = proto.name;
        this.rect = proto.rect;
        this.skills = proto.skills;
        this.image = enemyImage;

        this.currentHp = proto.hp;
        this.currentMp = proto.mp || 0;

        this.type = 'enemy';
    };

    EnemyPawn.prototype = new PawnBase();

    EnemyPawn.prototype.hp = function() {
        return this.currentHp;
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

    EnemyPawn.prototype.xp = function() {
        return this.enemy.xp;
    };

    EnemyPawn.prototype.consumeMp = function() {
        this.currentMp -= amount;
    };

    return EnemyPawn;
});