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
        return this.enemy.skills;
    };

    EnemyPawn.prototype.takeDamage = function(amount) {
        this.currentHp -= amount;
    };

    EnemyPawn.prototype.xp = function() {
        return this.enemy.xp;
    };

    EnemyPawn.prototype.useSkill = function() {
        // TODO: care about cooldown...
    };

    return EnemyPawn;
});