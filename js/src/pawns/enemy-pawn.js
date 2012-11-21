define(["json!enemies.json"], function(enemies) {
    "use strict";

    var enemyImage = new Image();
    enemyImage.src = "assets/img/enemies.png";

    // TODO: enemies besides rats!
    function EnemyPawn(enemyId) {
        var proto = enemies[enemyId];
        this.name = proto.name;
        this.desc = proto.name;
        this.rect = proto.rect;
        this.skills = proto.skills;
        this.image = enemyImage;
    };

    return EnemyPawn;
});