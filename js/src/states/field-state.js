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

    var mirv = testMirv(game, map, hero);
    var mirv2 = testMirv2(game, map, mirv, hero);

    map.actors.push(mirv2);
    map.actors.push(mirv);
    map.actors.push(hero);

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

function testMirv2(game, map, mirv, hero) {
    var npc = new Npc(map);
    npc.archetype = "heroine";
    npc.onTalk = function() {
        var messages = [
            {
                speaker: "mirv",
                text: [
                    "I'm following myself"
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
    npc.wander = $.noop;
    mirv.addFollower(npc);
    return npc;
}

function testMirv(game, map, hero) {
    var npc = new Npc(map);
    npc.warpTo(5, 20);
    npc.archetype = "heroine";
    npc.onTalk = function() {
        var messages = [
            {
                speaker: "mirv",
                text: [
                    "So you are Held...",
                    "you look just like I thought you would.",
                    "Thank you for releasing me."
                ]
            },
            {
                speaker: "mirv",
                text: [
                    "But we can't stay here. We need to return",
                    "to the surface."
                ]
            },
            {
                speaker: "held",
                text: [
                    "YOUR MOM IS A SURFACE DUR HURR",
                    "",
                    "i'm a paladin"
                ]
            }
        ];
        hero.lockMovement();
        npc.lockMovement();
        npc.direction = direction.oppositeOf(hero.direction);
        game.pushState(new DialogueState(game, messages, function() {
            hero.unlockMovement();
            npc.unlockMovement();
            npc.wander = $.noop;
            npc.occupiesSpace = false;
            npc.clearFollowers();
            hero.addFollower(npc);
        }));
    };
    return npc;
}