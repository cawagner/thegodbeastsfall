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
    };

    EnemyPawn.prototype = new PawnBase();

    EnemyPawn.prototype.damageReduction = function() {
        return this.enemy.damageReduction || this.enemy.strength;
    };
    EnemyPawn.prototype.damageAbsorption = function() {
        return this.enemy.damageAbsorption || 10+this.enemy.strength;
    };

    EnemyPawn.prototype.usableSkills = function() {
        return this.enemy.skills;
    };

    return EnemyPawn;
});