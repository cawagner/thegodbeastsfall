// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(game, map, entrance) {
    var tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
        hero = new Hero(map.tilemap, game.input),
        actors = [],
        frame = 0,
        actorRenderer = new ActorRenderer(game.graphics);

    entrance = entrance || "default";
    if (entrance in map.entrances) {
        hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
    }

    // followers need to be on the map before the hero, so the hero will draw on top and so update order will be right
    _(0).times(function() {
        var follower = new Actor(map.tilemap);
        follower.archetype = "heroine";
        follower.warpTo(hero.x, hero.y);

        actors.push(follower);
        hero.addFollower(follower);
    });

    actors.push(hero);

    this.talk = function() {
        var messages = [
            {
                speaker: "mirv",
                text: [
                    "You look around.",
                    "There is an abundance of nothing there.",
                    "I'm not kidding."
                ]
            }
        ];
        hero.lockMovement();
        game.pushState(new DialogueState(game, messages, function() {
            hero.unlockMovement();
        }));
    };

    this.update = function(timeScale) {
        _(actors).each(function(actor) {
            actor.update(timeScale);
        });

        frame = (frame + 0.05 + hero.isMoving() * 0.1) % 4;

        tilemapView.focusOn(hero.x, hero.y);

        if (game.input.wasConfirmPressed()) {
            this.talk();
        }
    };

    this.draw = function(timeScale) {
        tilemapView.draw();

        _(actors).chain().sortBy("y").each(function(actor) {
            actorRenderer.drawActor(actor, frame);
        });
    };
}
