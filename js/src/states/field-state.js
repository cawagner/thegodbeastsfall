// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(game, map, entrance) {
    var tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
        hero = new Hero(game.input),
        frame = 0,
        actorRenderer = new ActorRenderer(game.graphics);

    map.addActor(hero);

    entrance = entrance || "default";
    if (entrance in map.entrances) {
        hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
    }

    this.update = function(timeScale) {
        _(map.actors).each(function(actor) {
            actor.update(timeScale);
        });

        // handle switching maps...
        _(map.exits).each(function(exit) {
            if (hero.x >= exit.x && hero.x <= exit.x + exit.width) {
                if (hero.y >= exit.y && hero.y <= exit.y + exit.height) {
                    goToMap(game, exit.map, exit.entrance);
                }
            }
        });

        frame = (frame + 0.025 + hero.isMoving() * 0.05) % 4;

        tilemapView.focusOn(hero.x, hero.y);
    };

    this.draw = function(timeScale) {
        tilemapView.draw();

        _(map.actors).chain().sortBy("y").each(function(actor) {
            actorRenderer.drawActor(actor, frame);
        });
    };
}

function haveConversation(messages, hero, npc) {
    var game = Game.instance;
    var deferred = $.Deferred();
    // TODO: send message that we're locking movement instead...?
    if (hero) {
        hero.lockMovement();
    }

    if (npc) {
        npc.lockMovement();
        npc.direction = direction.oppositeOf(hero.direction);
    }
    game.pushState(new DialogueState(game, messages, function() {
        // TODO: send message that we're locking the NPC instead...
        if (hero) {
            hero.unlockMovement();
        }
        if (npc) {
            npc.unlockMovement();
        }
        deferred.resolve();
    }));
    return deferred.promise();
}
