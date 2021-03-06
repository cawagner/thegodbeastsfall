// This is awful. I was actually drunk when I wrote it, unfortunately.
define([
    "reqwest",
    "rsvp",
    "underscore",
    "radio",
    "tilemap",
    "actors/npc",
    "encounter",
    "constants",
    "image-loader",
    "direction"
], function(
    reqwest,
    RSVP,
    _,
    radio,
    tilemap,
    Npc,
    Encounter,
    constants,
    imageLoader,
    direction
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
                length: (tilesetData.imagewidth / TILE_SIZE) * (tilesetData.imageheight / TILE_SIZE),
                firstTile: tilesetData.firstgid
            };

            deferreds.push(imageLoader.loadImage(path).then(function(image) {
                tileset.image = image;
            }));

            return tileset;
        };

        this.load = function(mapName) {
            return new RSVP.Promise(function(resolve, reject) {
                reqwest({
                    url: "assets/maps/" + mapName + ".json",
                    type: "json"
                }).then(function(data) {
                    var map = self.createMap(mapName, data);
                    require(['map/' + mapName], function(setupMap) {
                        setupMap(map);
                        RSVP.all(deferreds).then(function() {
                            resolve(map);
                        });
                    });
                });
            });
        };

        this.createMap = function(mapName, data) {
            var tileLayers = data.layers.filter(function(layer) { return layer.type === "tilelayer"; });
            var objectLayers = data.layers.filter(function(layer) { return layer.type === "objectgroup"; })

            var mask = tileLayers.filter(function(layer) { return layer.name === "Mask"; })[0];
            var layerCount = tileLayers.length - (mask !== undefined);

            // TODO: don't use mask data directly?
            var tilemap = new Tilemap(data.width, data.height, layerCount, mask ? mask.data : []);

            var tilesets = data.tilesets.map(this.loadTileSet);
            var entrances = {};
            var exits = {};
            var npcs = {};
            var encounters = {};

            var z = 0;
            tileLayers.forEach(function() {
                if (tileLayers[z] !== mask) {
                    _.each2d(data.width, data.height, function(x, y) {
                        tilemap.setAt(x, y, z, tileLayers[z].data[x + y * data.width]);
                    });
                    ++z;
                }
            });

            objectLayers.forEach(function(objectLayer) {
                var objects = _(objectLayer.objects).groupBy("type");

                (objects["Entrance"] || []).forEach(function(object) {
                    entrances[object.name] = {
                        x: (object.x / TILE_SIZE) | 0,
                        y: (object.y / TILE_SIZE) | 0,
                        direction: direction.fromName(object.properties.direction || "up")
                    };
                });

                (objects["Exit"] || []).forEach(function(object) {
                    exits[object.name] = {
                        x: (object.x / TILE_SIZE) | 0,
                        y: (object.y / TILE_SIZE) | 0,
                        width: (object.width / TILE_SIZE) | 0,
                        height: (object.height / TILE_SIZE) | 0,
                        entrance: object.properties.entrance,
                        map: object.properties.map
                    };
                });

                (objects["NPC"] || []).forEach(function(object) {
                    npcs[object.name] = new Npc(object.properties);
                    npcs[object.name].warpTo((object.x / TILE_SIZE) | 0, (object.y / TILE_SIZE) | 0);
                });

                (objects["Encounters"] || []).forEach(function(object) {
                    var frequency = object.properties.frequency.split("-");
                    encounters[object.name] = new Encounter({
                        x: (object.x / TILE_SIZE) | 0,
                        y: (object.y / TILE_SIZE) | 0,
                        width: (object.width / TILE_SIZE) | 0,
                        height: (object.height / TILE_SIZE) | 0,
                        minFrequency: parseInt(frequency[0] || 30),
                        maxFrequency: parseInt(frequency[1] || frequency[0] || 40),
                        parties: _(_(object.properties).valuesOfPropertiesStartingWith("party")).map(function(v) {
                            return v.split(',');
                        })
                    });
                });
            });

            tilesets = _(tilesets).sortBy("firstTile");

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

        radio("/map/loading").broadcast();
        mapLoader.load(mapName).then(function(map) {
            radio("/map/loaded").broadcast(map, entrance);
        });
    };

    return {
        goToMap: goToMap
    };
});