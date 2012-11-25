define([
    "jquery",
    "underscore",
    "map-loader",
    "game",
    "gui",
    "display/tilemap-view",
    "display/actor-renderer",
    "actors/hero",
    "direction",
    "util",
    "pubsub"
], function($, _, mapLoader, Game, GuiRenderer, TilemapView, ActorRenderer, Hero, direction, util) {
    "use strict";

    // TODO: make some function to open the state instead of having such a horrible constructor
    function FieldState(map, entrance) {
        var game = Game.instance,
            tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
            hero = new Hero(),
            frame = 0,
            actorRenderer = new ActorRenderer(game.graphics),
            gui = new GuiRenderer(game.graphics),
            containsHero = _.bind(util.pointInRect, null, hero),
            encounterSubscription,
            sortActors;

        map.addActor(hero);

        entrance = entrance || "default";
        if (entrance in map.entrances) {
            hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
            if (map.entrances[entrance].direction !== undefined) {
                hero.direction = direction.fromName(map.entrances[entrance].direction);
            }
        }

        setTimeout(function() {
            if (_.isFunction(map.onLoad)) {
                map.onLoad(hero, entrance);
            }
        }, 1);

        encounterSubscription = $.subscribe("/hero/step", function() {
            // TODO: nested encounter regions won't work right now!
            _(map.encounters).withFirst(containsHero, function(encounter) {
                var party;
                encounter.until--;
                if (encounter.until <= 0) {
                    encounter.triggered++;
                    party = encounter.parties[Math.floor(Math.random() * encounter.parties.length)];
                    $.publish("/battle/start", [party])
                    encounter.until = 2*encounter.triggered + Math.floor(
                        Math.random() * (encounter.maxFrequency - encounter.minFrequency) + encounter.minFrequency
                    );
                }
            });
        });

        this.update = function(timeScale) {
            _(map.actors).each(function(actor) {
                actor.update(timeScale);
            });

            _(map.exits).withFirst(containsHero, function(exit) {
                mapLoader.goToMap(exit.map, exit.entrance);
            });

            frame = (frame + 0.025 + hero.isMoving() * 0.05) % 4;

            tilemapView.focusOn(hero.x, hero.y);
        };

        this.end = function() {
            $.unsubscribe(encounterSubscription);
        };

        this.suspend = function() {
            hero.lockMovement();
        };

        this.reactivate = function() {
            hero.unlockMovement();
        };

        sortActors = _(function() {
            map.actors = _(map.actors).sortBy("y");
        }).throttle(150);

        this.draw = function(timeScale) {
            tilemapView.draw();

            sortActors();
            _(map.actors).each(function(actor) {
                actorRenderer.drawActor(actor, frame);
            });

            game.graphics.setOrigin();
        };
    }

    return FieldState;
});