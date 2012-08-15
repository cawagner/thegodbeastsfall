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

    _(1).times(function(){
        var mirv2 = testMirv2(game, map, mirv, hero);
        map.actors.push(mirv2);
    });
    map.actors.push(mirv);
    map.actors.push(hero);

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

function haveConversation(game, messages, hero, npc) {
    var deferred = $.Deferred();
    hero.lockMovement();
    npc.lockMovement();
    npc.direction = direction.oppositeOf(hero.direction);
    game.pushState(new DialogueState(game, messages, function() {
        hero.unlockMovement();
        npc.unlockMovement();
        deferred.resolve();
    }));
    return deferred.promise();
}

function testMirv2(game, map, mirv, hero) {
    var npc = new Npc(map);
    npc.archetype = "oldman";
    npc.onTalk = function() {
        var messages = [
            {
                speaker: "oldman",
                text: [
                    "Mirv is appealing to me"
                ]
            }
        ];
        haveConversation(game, messages, hero, npc);
    };
    npc.onShove = function() {
        var messages = [
            {
                speaker: "oldman",
                text: [
                    "I might break my hip"
                ]
            }
        ];
        if (Math.random() < 0.2) {
            haveConversation(game, messages, hero, npc);
        }
    }
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
        haveConversation(game, messages, hero, npc).done(function() {
            npc.wander = $.noop;
            npc.occupiesSpace = false;
            npc.clearFollowers();
            hero.addFollower(npc);
        })
    };
    return npc;
}