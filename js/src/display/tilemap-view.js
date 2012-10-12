define([], function() {
    var TilemapView = function(tilemap, tilesets, graphics) {
        var screenWidthInTiles = graphics.width() / TILE_SIZE;
        var screenHeightInTiles = graphics.height() / TILE_SIZE;

        // TODO: support multiple tilesets!
        var ts = tilesets[0];

        var srcRect = { x: 0, y: 0, width: ts.tileWidth, height: ts.tileHeight };
        var destRect = { x : 0, y: 0, width: TILE_SIZE, height: TILE_SIZE };

        var maxScrollX = tilemap.width() * TILE_SIZE - graphics.width();
        var maxScrollY = tilemap.height() * TILE_SIZE - graphics.height();

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
                originTileX = (scrollX / TILE_SIZE) | 0,
                originTileY = (scrollY / TILE_SIZE) | 0;

            graphics.setOrigin(-scrollX, -scrollY);

            _(tilemap.layers()).times(function(z) {
                _.each2d(screenWidthInTiles + 1, screenHeightInTiles + 1, function(ix, iy) {
                    var x = originTileX + ix,
                        y = originTileY + iy,
                        tile;

                    if (tile = tilemap.getAt(x, y, z)) {
                        drawTile(x, y, tile);
                    }
                }, this);
            });
        };

        this.focusOn = function(x, y) {
            var scrollX = x * TILE_SIZE - graphics.width() / 2;
            var scrollY = y * TILE_SIZE - graphics.height() / 2;
            this.scrollX = _(scrollX).boundWithin(0, maxScrollX);
            this.scrollY = _(scrollY).boundWithin(0, maxScrollY);
        };
    };

    return TilemapView;
});