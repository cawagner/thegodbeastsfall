define([
    "pubsub",
    "underscore",
    "map-loader",
    "graphics",
    "gui",
    "display/tilemap-view",
    "display/actor-renderer",
    "actors/hero",
    "direction",
    "pubsub"
], function(
    pubsub,
    _,
    mapLoader,
    graphics,
    gui,
    TilemapView,
    actorRenderer,
    Hero,
    direction
) {
    "use strict";

    var pointInRect = function(point, rect) {
        return (
            (point.x >= rect.x && point.x < rect.x + rect.width) &&
            (point.y >= rect.y && point.y < rect.y + rect.height)
        );
    };

    // TODO: make some function to open the state instead of having such a horrible constructor
    function FieldState(map, entrance) {
        var tilemapView = new TilemapView(map.tilemap, map.tilesets),
            hero = new Hero(),
            stepSubscription,
            containsHero = _.bind(pointInRect, null, hero),
            sortActors = _(function() {
                map.actors = _(map.actors).sortBy("y");
            }).throttle(150);

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
                _(map.onLoad(hero, entrance)).defer();
            }
        }, 1);

        stepSubscription = pubsub.subscribe("/hero/step", function() {
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

        this.start = function() {
        };

        this.update = function(timeScale) {
            _(map.actors).each(function(actor) {
                actor.update(timeScale);
            });
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

        this.draw = function(timeScale) {
            tilemapView.focusOn(hero.x, hero.y);
            tilemapView.draw();

            sortActors();
            _(map.actors).each(function(actor) {
                actorRenderer.drawActor(actor);
            });

            graphics.setOrigin();
        };
    }

    return FieldState;
});