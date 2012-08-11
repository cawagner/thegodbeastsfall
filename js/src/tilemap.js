function Tilemap(width, height, layers) {
    var tiles;

    var indexFor = function(x, y) {
        return x + y * width;
    };

    this.isWalkable = function(x, y) {
        // TODO: not necessarily true!
        return this.isInBounds(x, y) && this.getAt(x, y, 1) === 0;
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

function TilemapView(tilemap, tilesets, graphics) {
    var screenWidthInTiles = graphics.width() / TILE_SIZE;
    var screenHeightInTiles = graphics.height() / TILE_SIZE;

    // TODO: support multiple tilesets!
    var ts = tilesets[0];

    var srcRect = { x: 0, y: 0, width: ts.tileWidth, height: ts.tileHeight };
    var destRect = { x : 0, y: 0, width: TILE_SIZE, height: TILE_SIZE };

    var drawTile = function(x, y, tile) {
        tile -= 1;
        var tx = tile % ts.width;
        var ty = Math.floor(tile / ts.width);
        srcRect.x = tx * ts.tileWidth;
        srcRect.y = ty * ts.tileHeight;

        destRect.x = x * TILE_SIZE;
        destRect.y = y * TILE_SIZE;

        graphics.drawImageRect(tilesets[0].image, srcRect, destRect);
    };

    this.scrollX = 0;
    this.scrollY = 0;

    this.draw = function() {
        var scrollX = this.scrollX,
            scrollY = this.scrollY,
            originTileX = (scrollX / TILE_SIZE)|0,
            originTileY = (scrollY / TILE_SIZE)|0;

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

    this.focusOn = function(x, y) {
        this.scrollX = _(x * TILE_SIZE - graphics.width() / 2).boundWithin(0, tilemap.width() * TILE_SIZE - graphics.width());
        this.scrollY = _(y * TILE_SIZE - graphics.height() / 2).boundWithin(0, tilemap.height() * TILE_SIZE - graphics.height());
    };
}
