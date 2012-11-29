// This is awful. I was actually drunk when I wrote it, unfortunately.
define([
    "jquery",
    "underscore",
    "tilemap",
    "actors/npc",
    "constants",
    "image-loader",
    "pubsub"
], function(
    $,
    _,
    tilemap,
    Npc,
    constants,
    imageLoader
) {
    "use strict";

    // TODO: HACK
    var Tilemap = tilemap.Tilemap;
    var Map = tilemap.Map;

    var TILE_SIZE = constants.TILE_SIZE;

    function MapLoader() {
        var self = this;

        var deferreds = [];
        this.loadTileSet = function(tilesetData) {
            var path = 'assets/' + tilesetData.image.replace("\/", "/").replace(/..\//, '');
            var tileset = {
                image: null,
                name: tilesetData.name,
                width: tilesetData.imagewidth / TILE_SIZE,
                height: tilesetData.imageheight / TILE_SIZE,
                tileWidth: tilesetData.tilewidth,
                tileHeight: tilesetData.tileheight,
                length: (tilesetData.imagewidth / TILE_SIZE) * (tilesetData.imageheight / TILE_SIZE)
            };

            deferreds.push(imageLoader.loadImage(path).done(function(image) {
                tileset.image = image;
            }));

            return tileset;
        };

        this.load = function(mapName) {
            var deferred = $.Deferred();
            $.ajax({
                url: "assets/maps/" + mapName + ".json",
                dataType: "json",
                cache: false
            }).success(function(data) {
                var map = self.createMap(mapName, data);
                window.setupMap = function(fn) {
                    fn(map, window.GameState.instance);
                    window.setupMap = null;
                };
                $.getScript("assets/maps/" + mapName + ".js", function() {
                    $.when.apply($, deferreds).then(function() {
                        deferred.resolve(map);
                    });
                });
            })
            return deferred.promise();
        };

        this.createMap = function(mapName, data) {
            var tileLayers = _(data.layers).filter(function(layer) { return layer.type === "tilelayer"; });
            var objectLayers = _(data.layers).filter(function(layer) { return layer.type === "objectgroup"; })

            var mask = _(tileLayers).filter(function(layer) { return layer.name === "Mask"; })[0];
            var layerCount = tileLayers.length - (mask !== undefined);

            // TODO: don't use mask data directly?
            var tilemap = new Tilemap(data.width, data.height, layerCount, mask ? mask.data : []);

            var tilesets = _(data.tilesets).map(this.loadTileSet);
            var entrances = {};
            var exits = {};
            var npcs = {};
            var encounters = {};

            var z = 0;
            _(tileLayers).each(function() {
                if (tileLayers[z] !== mask) {
                    _.each2d(data.width, data.height, function(x, y) {
                        tilemap.setAt(x, y, z, tileLayers[z].data[x + y * data.width]);
                    });
                    ++z;
                }
            });

            _(objectLayers).each(function(objectLayer) {
                var objects = _(objectLayer.objects).groupBy("type");

                _(objects["Entrance"]).each(function(object) {
                    entrances[object.name] = {
                        x: (object.x / TILE_SIZE) | 0,
                        y: (object.y / TILE_SIZE) | 0,
                        direction: object.properties.direction
                    };
                });

                _(objects["Exit"]).each(function(object) {
                    exits[object.name] = {
                        x: (object.x / TILE_SIZE) | 0,
                        y: (object.y / TILE_SIZE) | 0,
                        width: (object.width / TILE_SIZE) | 0,
                        height: (object.height / TILE_SIZE) | 0,
                        entrance: object.properties.entrance,
                        map: object.properties.map
                    };
                });

                _(objects["NPC"]).each(function(object) {
                    npcs[object.name] = new Npc(object.properties);
                    npcs[object.name].warpTo((object.x / TILE_SIZE) | 0, (object.y / TILE_SIZE) | 0);
                });

                _(objects["Encounters"]).each(function(object) {
                    var frequency = object.properties.frequency.split("-");
                    var encounter = {
                        x: (object.x / TILE_SIZE) | 0,
                        y: (object.y / TILE_SIZE) | 0,
                        width: (object.width / TILE_SIZE) | 0,
                        height: (object.height / TILE_SIZE) | 0,
                        minFrequency: parseInt(frequency[0] || 30),
                        maxFrequency: parseInt(frequency[1] || frequency[0] || 40),
                        parties: JSON.parse(object.properties.parties),
                        triggered: 0
                    };
                    encounter.until = Math.floor(
                        Math.random() * (encounter.maxFrequency - encounter.minFrequency) + encounter.minFrequency
                    );
                    encounters[object.name] = encounter;
                });
            });

            return new Map(tilemap, mask.data, {
                name: mapName,
                tilesets: tilesets,
                entrances: entrances,
                exits: exits,
                properties: data.properties,
                npcs: npcs,
                encounters: encounters
            });
        };
    }

    var goToMap = function(mapName, entrance) {
        var mapLoader = new MapLoader();

        $.publish("/map/loading");
        mapLoader.load(mapName).done(function(map) {
            $.publish("/map/loaded", [map, entrance]);
        });
    }

    return {
        goToMap: goToMap
    };
});