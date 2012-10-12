// This is awful. I was actually drunk when I wrote it, unfortunately.
define(["jquery", "underscore", "tilemap", "pubsub"], function($, _, tilemap) {
    function MapLoader() {
        var self = this;

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

        this.load = function(mapName) {
            var deferred = $.Deferred();
            $.ajax({
                url: "assets/maps/" + mapName + ".json",
                dataType: "json",
                cache: false
            }).success(function(data) {
                var map = self.createMap(data);
                window.setupMap = function(fn) {
                    fn(map);
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
            // TODO: don't use mask data directly?
            var tilemap = new Tilemap(data.width, data.height, tileLayers.length, mask.data);

            var tilesets = _(data.tilesets).map(createTileSet);
            var entrances = {};
            var exits = {};
            var npcs = {};
            var result;

            _(tileLayers.length - (mask !== undefined)).times(function(z) {
                if (tileLayers[z] !== mask) {
                    _.each2d(data.width, data.height, function(x, y) {
                        tilemap.setAt(x, y, z, tileLayers[z].data[x + y * data.width]);
                    });
                }
            });

            _(objectLayers).each(function(objectLayer) {
                _(objectLayer.objects).each(function(object) {
                    switch (object.type) {
                        case "Entrance": {
                            entrances[object.name] = { x: (object.x / TILE_SIZE) | 0, y: (object.y / TILE_SIZE) | 0, direction: object.properties.direction };
                            break;
                        }
                        case "Exit": {
                            exits[object.name] = {
                                x: (object.x / TILE_SIZE) | 0,
                                y: (object.y / TILE_SIZE) | 0,
                                width: (object.width / TILE_SIZE) | 0,
                                height: (object.height / TILE_SIZE) | 0,
                                entrance: object.properties.entrance,
                                map: object.properties.map
                            };
                            break;
                        }
                        case "NPC": {
                            npcs[object.name] = new Npc(object.properties);
                            npcs[object.name].warpTo((object.x / TILE_SIZE) | 0, (object.y / TILE_SIZE) | 0);
                            break;
                        }
                        default: {
                            console.log("object type" + object.type + " not recognized");
                        }
                    }
                });
            });

            result = new Map(tilemap, mask.data);
            result.tilesets = tilesets;
            result.entrances = entrances;
            result.exits = exits;
            result.properties = data.properties;
            result.npcs = npcs;

            _(npcs).each(function(npc) {
                result.addActor(npc);
            });

            return result;
        };
    }

    function goToMap(mapName, entrance) {
        var mapLoader = new MapLoader(),
            game = Game.instance;
        // TODO: really hackish...
        if (game.currentState() instanceof FieldState) {
            game.popState();
        }
        mapLoader.load(mapName).done(function(map) {
            var fieldState = new FieldState(map, entrance);
            game.pushState(fieldState);

            $.publish("/music/play", [map.properties.music]);
        });
    }

    window.goToMap = goToMap;
    return MapLoader;
});