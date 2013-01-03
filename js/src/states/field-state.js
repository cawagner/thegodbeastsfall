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
            containsHero = _.bind(pointInRect, null, hero),
            sortActors = _(function() {
                map.actors = _(map.actors).sortBy("y");
            }).throttle(150);

        this.hero = hero;
        this.entrance = entrance;
        this.map = map;
        this.subscriptions = pubsub.set();

        map.addActor(hero);

        entrance = entrance || "default";
        if (typeof entrance === 'string') {
            entrance = map.entrances[entrance];
        }
        this.warpHeroToEntrance(entrance);

        this.subscriptions.subscribe("/hero/step", function() {
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
    };

    FieldState.prototype.warpHeroToEntrance = function(entrance) {
        this.hero.warpTo(entrance.x, entrance.y, entrance.direction);
    };

    FieldState.prototype.start = function() {
        var that = this;

        setTimeout(function() {
            if (_.isFunction(that.map.onLoad)) {
                that.map.onLoad(that.hero, that.entrance);
            }
        }, 1);
    };

    FieldState.prototype.end = function() {
        this.subscriptions.unsubscribe();
    };

    FieldState.prototype.update = function(timeScale) {
        _(this.map.actors).each(function(actor) {
            actor.update(timeScale);
        });
    };

    return FieldState;
});