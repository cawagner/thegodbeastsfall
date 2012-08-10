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

    this.width = function() { return width; };
    this.height = function() { return height; };
    this.layers = function() { return layers; };

    layers = layers || 1;
    tiles = [];
    _(layers).times(function() {
        tiles.push(new Array(width * height));
    }); 
}

function TilemapView(tilemap, tilesets, tileSize, graphics) {
    // TODO: don't hardcode these sizes
    var screenWidthInTiles = 640 / tileSize;
    var screenHeightInTiles = 480 / tileSize;

    // TODO: support multiple tilesets!
    var ts = tilesets[0];

    var srcRect = { x: 0, y: 0, width: ts.tileWidth, height: ts.tileHeight };
    var destRect = { x : 0, y: 0, width: tileSize, height: tileSize };

    var drawTile = function(x, y, tile) {
        tile -= 1;
        var tx = tile % ts.width;
        var ty = Math.floor(tile / ts.width);
        srcRect.x = tx * ts.tileWidth;
        srcRect.y = ty * ts.tileHeight;

        destRect.x = x * tileSize;
        destRect.y = y * tileSize;

        graphics.drawImageRect(tilesets[0].image, srcRect, destRect);
    };

    this.draw = function(scrollX, scrollY) {
        var originTileX = (scrollX / tileSize)|0,
            originTileY = (scrollY / tileSize)|0;

        graphics.setOrigin(-scrollX, -scrollY);

        _(tilemap.layers()).times(function(z) {
            _.each2d(screenWidthInTiles + 1, screenHeightInTiles + 1, function(ix, iy) {
                var x = originTileX + ix,
                    y = originTileY + iy,
                    srcRect,
                    tile;

                if (tile = tilemap.getAt(x, y, z)) {
                    drawTile(x, y, tile);
                }
            }, this);
        });
    };
}
