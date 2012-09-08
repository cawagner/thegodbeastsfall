// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(map, entrance) {
    var game = Game.instance,
        tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
        hero = new Hero(game.input),
        frame = 0,
        actorRenderer = new ActorRenderer(game.graphics),
        firstRun = true,
        gui = new GuiRenderer(game.graphics),
        talkSubscription,
        subscribeToTalk = function() {
            talkSubscription = $.subscribe("/npc/talk", function(messages, npc) {
                var deferred = $.Deferred();

                npc.lockMovement();
                npc.direction = direction.oppositeOf(hero.direction);

                game.pushState(new DialogueState(messages, function() {
                    npc.unlockMovement();
                    deferred.resolve();
                }));
                return deferred.promise();
            })
        },
        subscribeToMenu = function() {
            // TODO: does not go here!
            var menuSubscription = $.subscribe("/menu/show", function(menu) {
                game.pushState(new MenuState(menu));
            });
        };

    map.addActor(hero);

    entrance = entrance || "default";
    if (entrance in map.entrances) {
        hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
        if (map.entrances[entrance].direction !== undefined) {
            hero.direction = direction.fromName(map.entrances[entrance].direction);
        }
    }

    this.update = function(timeScale) {
        if (firstRun) {
            if (_.isFunction(map.onLoad)) {
               map.onLoad(hero, entrance);
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

        if (game.input.wasCancelPressed()) {
            new Menu([
                { text: "Status" },
                { text: "Items" },
                { text: "Magie" },
                { text: "Options" }
            ]).show();
        }

        frame = (frame + 0.025 + hero.isMoving() * 0.05) % 4;

        tilemapView.focusOn(hero.x, hero.y);
    };

    this.suspend = function() {
        hero.lockMovement();
    };

    this.reactivate = function() {
        hero.unlockMovement();
    };

    this.end = function() {
        $.unsubscribe(talkSubscription);
    };

    this.draw = function(timeScale) {
        tilemapView.draw();

        _(map.actors).chain().sortBy("y").each(function(actor) {
            actorRenderer.drawActor(actor, frame);
        });

        game.graphics.setOrigin(0, 0);

        // gui.drawTextWindow(8, 8, 36, 44, ["HELD", "\u2665 25", "\u2605 10"]);
    };

    subscribeToTalk();
    subscribeToMenu();
}
