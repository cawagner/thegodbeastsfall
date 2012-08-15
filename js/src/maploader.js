function MapLoader() {
    var self = this;

    this.load = function(mapName) {
        var deferred = $.Deferred();
        $.getJSON("assets/maps/" + mapName + ".json", function(data) {
            var map = self.createMap(data);
            deferred.resolve(map);
        });
        return deferred.promise();
    };

    this.createMap = function(data) {
        var tileLayers = _(data.layers).filter(function(layer) { return layer.type === "tilelayer"; });
        var objectLayers = _(data.layers).filter(function(layer) { return layer.type === "objectgroup"; })
        var mask = _(tileLayers).filter(function(layer) { return layer.name === "Mask"; })[0];
        // TODO: don't use mask data directly?
        var tilemap = new Tilemap(data.width, data.height, tileLayers.length, mask.data);

        var tilesets = [];
        var entrances = {};
        var result;

        _(data.tilesets).each(function(tilesetData) {
            var path = 'assets/' + tilesetData.image.replace("\/", "/").replace(/..\//, '');
            var image = new Image();
            var tileset = {
                image: image,
                name: tilesetData.name,
                width: tilesetData.imagewidth / tilesetData.tilewidth,
                height: tilesetData.imageheight / tilesetData.tileheight,
                tileWidth: tilesetData.tilewidth,
                tileHeight: tilesetData.tileheight,
                length: (tilesetData.imagewidth / tilesetData.tilewidth) * (tilesetData.imageheight / tilesetData.tileheight)
            };
            image.src = path;

            tilesets.push(tileset);
        });

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
                case "Entrance":
                    entrances[object.name] = { x: (object.x / tilesets[0].tileWidth) | 0, y: (object.y / tilesets[0].tileHeight) | 0 };
                    break;
                }
            });
        });

        result = new Map(tilemap, mask.data);
        result.tilesets = tilesets;
        result.entrances = entrances;
        result.properties = data.properties;
        return result;
    };
}
