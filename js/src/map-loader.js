// This is awful. I was actually drunk when I wrote it, unfortunately.
define([
    "jquery",
    "underscore",
    "tilemap",
    "actors/npc",
    "constants",
    "pubsub"
], function(
    $,
    _,
    tilemap,
    Npc,
    constants
) {
    // TODO: HACK
    var Tilemap = tilemap.Tilemap;
    var Map = tilemap.Map;

    var TILE_SIZE = constants.TILE_SIZE;

    var createTileSet = function(tilesetData) {
        var path = 'assets/' + tilesetData.image.replace("\/", "/").replace(/..\//, '');
        var image = new Image();
        var tileset = {
            image: image,
            name: tilesetData.name,
            width: tilesetData.imagewidth / TILE_SIZE,
            height: tilesetData.imageheight / TILE_SIZE,
            tileWidth: tilesetData.tilewidth,
            tileHeight: tilesetData.tileheight,
            length: (tilesetData.imagewidth / TILE_SIZE) * (tilesetData.imageheight / TILE_SIZE)
        };
        image.src = path;
        return tileset;
    };

    function MapLoader() {
        var self = this;

        this.load = function(mapName) {
            var deferred = $.Deferred();
            $.ajax({
                url: "assets/maps/" + mapName + ".json",
                dataType: "json",
                cache: false
            }).success(function(data) {
                var map = self.createMap(data);
                window.setupMap = function(fn) {
                    fn(map, window.GameState.instance);
                };
                $.getScript("assets/maps/" + mapName + ".js", function() {
                    deferred.resolve(map);
                });
            })
            return deferred.promise();
        };

        this.createMap = function(data) {
            var tileLayers = _(data.layers).filter(function(layer) { return layer.type === "tilelayer"; });
            var objectLayers = _(data.layers).filter(function(layer) { return layer.type === "objectgroup"; })

            var mask = _(tileLayers).filter(function(layer) { return layer.name === "Mask"; })[0];
            var layerCount = tileLayers.length - (mask !== undefined);

            // TODO: don't use mask data directly?
            var tilemap = new Tilemap(data.width, data.height, layerCount, mask ? mask.data : []);

            var tilesets = _(data.tilesets).map(createTileSet);
            var entrances = {};
            var exits = {};
            var npcs = {};

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
            });

            return new Map(tilemap, mask.data, {
                tilesets: tilesets,
                entrances: entrances,
                exits: exits,
                properties: data.properties,
                npcs: npcs
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