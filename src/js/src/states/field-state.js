define([
    "radio",
    "underscore",
    "map-loader",
    "graphics",
    "display/tilemap-view",
    "display/actor-renderer",
    "actors/hero"
], function(
    radio,
    _,
    mapLoader,
    graphics,
    TilemapView,
    actorRenderer,
    Hero
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
        this.subscriptions = [];

        this.regionContainsHero = function(rect) {
            return pointInRect(that.hero, rect);
        };

        entrance = entrance || "default";
        if (typeof entrance === 'string') {
            entrance = map.entrances[entrance];
        }
        this.entrance = entrance;

        this.map.addActor(this.hero);
        this.warpHeroToEntrance(this.entrance);
    };

    FieldState.prototype.draw = function() {
        this.tilemapView.focusOn(this.hero.x, this.hero.y);
        this.tilemapView.draw();

        this.sortActors();
        this.map.actors.forEach(function(actor) {
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

        var step = function() {
            if (!that.checkDoors()) {
                that.angerMonsters();
            }
        };

        radio("/hero/step").subscribe(step);
        this.subscriptions.push(["/hero/step", step]);

        setTimeout(function() {
            that.map.onLoad(that.hero, that.entrance);
        }, 1);
    };

    FieldState.prototype.end = function() {
        this.subscriptions.forEach(function(sub) {
            radio(sub[0]).unsubscribe(sub[1]);
        });
    };

    FieldState.prototype.update = function(timeScale) {
        this.map.actors.forEach(function(actor) {
            actor.update(timeScale);
        });
    };

    return FieldState;
});