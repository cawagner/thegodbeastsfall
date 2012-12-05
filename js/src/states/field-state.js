define([
    "pubsub",
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
], function(
    pubsub,
    _,
    mapLoader,
    Game,
    GuiRenderer,
    TilemapView,
    ActorRenderer,
    Hero,
    direction,
    util
) {
    "use strict";

    // TODO: make some function to open the state instead of having such a horrible constructor
    function FieldState(map, entrance) {
        var game = Game.instance,
            tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
            hero = new Hero(),
            frame = 0,
            actorRenderer = new ActorRenderer(game.graphics),
            gui = new GuiRenderer(game.graphics),
            stepSubscription,
            sortActors;

        map.addActor(hero);

        entrance = entrance || "default";
        if (typeof entrance === 'string') {
            if (entrance in map.entrances) {
                hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
                if (map.entrances[entrance].direction !== undefined) {
                    hero.direction = direction.fromName(map.entrances[entrance].direction);
                }
            }
        } else {
            hero.warpTo(entrance.x, entrance.y);
            hero.direction = entrance.direction || direction.UP;
        }

        setTimeout(function() {
            if (_.isFunction(map.onLoad)) {
                map.onLoad(hero, entrance);
            }
        }, 1);

        stepSubscription = pubsub.subscribe("/hero/step", function() {
            var containsHero = _.bind(util.pointInRect, null, hero)

            var encounter;

            var exit = _(map.exits).find(containsHero);
            if (exit) {
                mapLoader.goToMap(exit.map, exit.entrance);
                return;
            }

            encounter = _(map.encounters).find(containsHero);
            if (encounter) {
                encounter.step();
            };
        });

        this.update = function(timeScale) {
            _(map.actors).each(function(actor) {
                actor.update(timeScale);
            });

            frame = (frame + 0.05 + hero.isMoving() * 0.1) % 4;
        };

        this.end = function() {
            pubsub.unsubscribe(stepSubscription);
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
            tilemapView.focusOn(hero.x, hero.y);
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