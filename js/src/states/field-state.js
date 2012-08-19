// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(map, entrance) {
    var game = Game.instance,
        tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
        hero = new Hero(game.input),
        frame = 0,
        actorRenderer = new ActorRenderer(game.graphics),
        firstRun = true;

    map.addActor(hero);

    entrance = entrance || "default";
    if (entrance in map.entrances) {
        hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
    }

    this.update = function(timeScale) {
        if (firstRun) {
            if (_.isFunction(map.onLoad)) {
               map.onLoad(hero);
            }
            firstRun = false;
        }

        _(map.actors).each(function(actor) {
            actor.update(timeScale);
        });

        // handle switching maps...
        _(map.exits).each(function(exit) {
            if (hero.x >= exit.x && hero.x <= exit.x + exit.width) {
                if (hero.y >= exit.y && hero.y <= exit.y + exit.height) {
                    goToMap(exit.map, exit.entrance);
                }
            }
        });

        frame = (frame + 0.025 + hero.isMoving() * 0.05) % 4;

        tilemapView.focusOn(hero.x, hero.y);
    };

    this.suspend = function() {
        hero.lockMovement();
    };

    this.reactivate = function() {
        hero.unlockMovement();
    }

    this.draw = function(timeScale) {
        tilemapView.draw();

        _(map.actors).chain().sortBy("y").each(function(actor) {
            actorRenderer.drawActor(actor, frame);
        });
    };
}
