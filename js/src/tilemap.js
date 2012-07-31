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

    this.width = function() {
        return width;
    };

    this.height = function() {
        return height;
    };

    this.layers = function() {
        return layers;
    };

    layers = layers || 1;
    tiles = [];
    _(layers).times(function() {
        tiles.push(new Array(width * height));
    });
}

function TilemapView(tilemap, tileSize, graphics) {
    // TODO: don't hardcode these sizes
    var screenWidthInTiles = 640 / tileSize;
    var screenHeightInTiles = 480 / tileSize;

    this.draw = function(scrollX, scrollY) {
        var tile, x, y, z,
            originTileX = (scrollX / tileSize)|0,
            originTileY = (scrollY / tileSize)|0;

        graphics.setOrigin(-scrollX, -scrollY);

        for (z = 0; z < tilemap.layers(); ++z) {
            for (x = originTileX - 1; x < originTileX + screenWidthInTiles + 1; ++x) {
                for (y = originTileY - 1; y < originTileY + screenHeightInTiles + 1; ++y) {
                    if (tile = tilemap.getAt(x, y, z)) {
                        graphics.setFillColorRGB(255, 255, 255);
                        graphics.drawFilledRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
            }
        }
    };
}
