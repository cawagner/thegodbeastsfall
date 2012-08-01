function MapLoader() {
    var isDone = false, doneHandlers = [], self = this;

    this.load = function(mapName) {
        $.getJSON("assets/maps/" + mapName + ".json", function(data) {
            var map = self.createMap(data);
            isDone = true;

            _(doneHandlers).each(function(doneHandler) {
                doneHandler(map);
            });
        });
        return this;
    };

    this.createMap = function(data) {
        var tileLayers = _(data.layers).filter(function(layer) { return layer.type === "tilelayer"; });
        var objectLayers = _(data.layers).filter(function(layer) { return layer.type === "objectgroup"; })
        var tilemap = new Tilemap(data.width, data.height, tileLayers.length);
        
        _(tileLayers.length).times(function(z) {
            _.each2d(data.width, data.height, function(x, y) {
                tilemap.setAt(x, y, z, tileLayers[z].data[x + y * data.width]);
            });
        });

        return {
            tilemap: tilemap
        };
    };

    this.done = function(callback) {
        if (isDone) {
            throw "to implement";
        } else {
            doneHandlers.push(callback);
        }
    };
}
