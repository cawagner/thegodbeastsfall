function Tilemap(width, height) {
    var tiles = new Array(width * height);

    var indexFor = function(x, y) {
        return x + y * width;
    };

    this.isInBounds = function(x, y) {
        return !(x < 0 || x >= width || y <0 || y >= height);
    };

    this.getAt = function(x, y) {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return undefined;
        }
        return tiles[indexFor(x, y)];
    };

    this.setAt = function(x, y, tile) {
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return false;
        }
        tiles[indexFor(x, y)] = tile;
        return true;
    };

    this.rect = function(x, y, width, height, tile) {
        _.each2d(width, height, function(ix, iy) {
            this.setAt(x + ix, y + iy, tile);
        }, this);
    };

    this.width = function() {
        return width;
    };

    this.height = function() {
        return height;
    };
}

function TilemapView(tilemap, tileSize, graphics) {
    // TODO: don't hardcode these sizes
    var screenWidthInTiles = 640 / tileSize;
    var screenHeightInTiles = 480 / tileSize;

    this.draw = function(scrollX, scrollY) {
        var tile, x, y,
            originTileX = (scrollX / tileSize)|0,
            originTileY = (scrollY / tileSize)|0;

        graphics.setOrigin(-scrollX, -scrollY);
        
        for (x = originTileX - 1; x < originTileX + screenWidthInTiles + 1; ++x) {
            for (y = originTileY - 1; y < originTileY + screenHeightInTiles + 1; ++y) {
                if (tile = tilemap.getAt(x, y)) {
                    graphics.setFillColorRGB(255, 255, 255);
                    graphics.drawFilledRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    };
}
