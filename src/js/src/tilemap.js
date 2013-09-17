define(["underscore", "pubsub", "radio"], function(_, pubsub, radio) {
    "use strict";

    function Map(tilemap, mask, data) {
        // TODO: don't duplicate...
        var indexFor = function(x, y) {
            return x + y * tilemap.width;
        };

        var self = this;

        var subscriptions = pubsub.set();

        this.tilemap = tilemap;
        this.actors = [];

        _.extend(this, data);

        this.setMask = function(x, y) {
            mask[indexFor(x, y)] = true;
        };

        this.unsetMask = function(x, y) {
            mask[indexFor(x, y)] = false;
        };

        this.getActor = function(x, y) {
            var actor = _.last(_(this.actors).filter(function(actor) {
                return actor.destX === x && actor.destY === y && actor.occupiesSpace;
            }));
            return actor;
            //return actorMap[indexFor(x, y)];
        }

        this.isWalkable = function(x, y) {
            return tilemap.isInBounds(x, y) && !mask[indexFor(x, y)] && !(this.getActor(x, y));
        };

        this.addActor = function(actor) {
            this.actors.push(actor);
            actor.map = this;
        };

        this.removeActor = function(actor) {
            var index = this.actors.indexOf(actor);
            if (index >= 0) {
                this.actors.splice(index, 1);
            }
        };

        this.subscribe = subscriptions.subscribe;

        radio("/map/loading").subscribe(function() {
            subscriptions.unsubscribe();
        });

        if (data && data.npcs) {
            _(data.npcs).each(function(npc) {
                self.addActor(npc);
            });
        }
    }

    Map.prototype.width = function() {
        return this.tilemap.width;
    };

    Map.prototype.height = function() {
        return this.tilemap.height;
    };

    Map.prototype.onLoad = function() { };

    function Tilemap(width, height, layers) {
        var tiles;

        var indexFor = function(x, y) {
            return x + y * width;
        };

        this.isInBounds = function(x, y) {
            return !(x < 0 || x >= width || y <0 || y >= height);
        };

        this.getAt = function(x, y, layer) {
            if (x < 0 || x >= width || y < 0 || y >= height) {
                return undefined;
            }
            return tiles[layer][indexFor(x, y)];
        };

        this.setAt = function(x, y, layer, tile) {
            if (x < 0 || x >= width || y < 0 || y >= height) {
                return false;
            }
            tiles[layer][indexFor(x, y)] = tile;
            return true;
        };

        this.rect = function(opts) {
            _.each2d(opts.width, opts.height, function(ix, iy) {
                this.setAt(opts.x + ix, opts.y + iy, opts.layer, opts.tile);
            }, this);
        };

        this.width = width;
        this.height = height;
        this.layers = layers || 1;

        tiles = [];
        _(this.layers).times(function() {
            tiles.push(new Array(width * height));
        });
    }

    // TODO: don't mash together horribly like this...
    return {
        Map: Map,
        Tilemap: Tilemap
    };
});