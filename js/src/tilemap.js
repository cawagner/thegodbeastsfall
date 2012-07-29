function Tilemap(width, height) {
    var tiles = new Array(width * height);

    var indexFor = function(x, y) {
        return x + y * width;
    };

    this.isInBounds = function(x, y) {
        return !(x < 0 || x >= width || y <0 || y >= height);
    };

    this.getAt = function(x, y) {
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
        // TODO: use scrollX / scrollY
        _.each2d(screenWidthInTiles, screenHeightInTiles, function(x, y) {
            var tile = tilemap.getAt(x, y);

            if (tile) {
                graphics.setFillColorRGB(255, 255, 255);
            } else {
                graphics.setFillColorRGB(128, 128, 128);
            }
            graphics.drawFilledRect(x * tileSize, y * tileSize, tileSize, tileSize);
        });
    };
}
