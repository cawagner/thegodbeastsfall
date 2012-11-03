define([
    "jquery",
    "underscore",
    "map-loader",
    "gui",
    "display/tilemap-view",
    "display/actor-renderer",
    "states/dialogue-state",
    "actors/hero",
    "direction",
    "pubsub"
], function($, _, mapLoader, GuiRenderer, TilemapView, ActorRenderer, DialogueState, Hero, direction) {
    "use strict";

    // TODO: make some function to open the state instead of having such a horrible constructor
    function FieldState(map, entrance) {
        var game = Game.instance,
            tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
            hero = new Hero(),
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
                        mapLoader.goToMap(exit.map, exit.entrance);
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
        };

        this.end = function() {
            $.unsubscribe(talkSubscription);
        };

        this.draw = function(timeScale) {
            tilemapView.draw();

            _(map.actors).chain().sortBy("y").each(function(actor) {
                actorRenderer.drawActor(actor, frame);
            });

            game.graphics.setOrigin();
        };

        subscribeToTalk();
    }

    return FieldState;
});