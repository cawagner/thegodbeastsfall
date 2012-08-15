// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(game, map, entrance) {
    var tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
        hero = new Hero(map, game.input),
        frame = 0,
        actorRenderer = new ActorRenderer(game.graphics);

    entrance = entrance || "default";
    if (entrance in map.entrances) {
        hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
    }

    map.actors.push(hero);

    var npc = new Npc(map);
    npc.warpTo(5, 20);
    npc.archetype = "heroine";
    npc.onTalk = function() {
        var messages = [
            {
                speaker: "mirv",
                text: [
                    "So you are Held...",
                    "you look just like I thought you would."
                ]
            }
        ];
        hero.lockMovement();
        npc.lockMovement();
        npc.direction = direction.oppositeOf(hero.direction);
        game.pushState(new DialogueState(game, messages, function() {
            hero.unlockMovement();
            npc.unlockMovement();
        }));
    };
    map.actors.push(npc);

    this.update = function(timeScale) {
        _(map.actors).each(function(actor) {
            actor.update(timeScale);
        });

        frame = (frame + 0.05 + hero.isMoving() * 0.1) % 4;

        tilemapView.focusOn(hero.x, hero.y);
    };

    this.draw = function(timeScale) {
        tilemapView.draw();

        _(map.actors).chain().sortBy("y").each(function(actor) {
            actorRenderer.drawActor(actor, frame);
        });
    };
}
