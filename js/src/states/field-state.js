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

    function FieldState(map, entrance) {
        var that = this;

        this.tilemapView = new TilemapView(map.tilemap, map.tilesets);

        this.sortActors = _(function() {
            map.actors = _(map.actors).sortBy("y");
        }).throttle(150);

        this.hero = new Hero();
        this.map = map;
        this.subscriptions = pubsub.set();

        this.regionContainsHero = function(rect) {
            return pointInRect(that.hero, rect);
        };

        entrance = entrance || "default";
        if (typeof entrance === 'string') {
            entrance = map.entrances[entrance];
        }
        this.entrance = entrance;
    };

    FieldState.prototype.draw = function() {
        this.tilemapView.focusOn(this.hero.x, this.hero.y);
        this.tilemapView.draw();

        this.sortActors();
        _(this.map.actors).each(function(actor) {
            actorRenderer.drawActor(actor);
        });

        graphics.setOrigin();
    };

    FieldState.prototype.checkDoors = function() {
        var exit = _(this.map.exits).find(this.regionContainsHero);
        if (exit) {
            mapLoader.goToMap(exit.map, exit.entrance);
            return exit;
        }
        return false;
    }

    FieldState.prototype.angerMonsters = function() {
        var encounter = _(this.map.encounters).find(this.regionContainsHero);
        if (encounter) {
            encounter.step();
        };
    };

    FieldState.prototype.suspend = function() {
        this.hero.lockMovement();
    };

    FieldState.prototype.reactivate = function() {
        this.hero.unlockMovement();
    };

    FieldState.prototype.warpHeroToEntrance = function(entrance) {
        this.hero.warpTo(entrance.x, entrance.y, entrance.direction);
    };

    FieldState.prototype.start = function() {
        var that = this;

        this.map.addActor(this.hero);
        this.warpHeroToEntrance(this.entrance);

        this.subscriptions.subscribe("/hero/step", function() {
            if (!that.checkDoors()) {
                that.angerMonsters();
            }
        });

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