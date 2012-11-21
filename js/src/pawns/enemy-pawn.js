define(["pawns/pawn-base", "json!enemies.json"], function(PawnBase, enemies) {
    "use strict";

    var enemyImage = new Image();
    enemyImage.src = "assets/img/enemies.png";

    // TODO: enemies besides rats!
    function EnemyPawn(enemyId) {
        var proto = enemies[enemyId];
        PawnBase.call(this, proto);

        this.desc = proto.name;
        this.rect = proto.rect;
        this.skills = proto.skills;
        this.image = enemyImage;
    };

    EnemyPawn.prototype = new PawnBase();

    return EnemyPawn;
});