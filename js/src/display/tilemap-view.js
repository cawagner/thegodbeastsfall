// I think there may be a race condition based on when this loads relative to when other things load...
define(["constants"], function(constants) {
    "use strict";

    var TILE_SIZE = constants.TILE_SIZE;
    var SCREEN_WIDTH_IN_TILES = constants.GAME_WIDTH / TILE_SIZE;
    var SCREEN_HEIGHT_IN_TILES = constants.GAME_HEIGHT / TILE_SIZE;

    var TilemapView = function(tilemap, tilesets, graphics) {
        // TODO: support multiple tilesets!
        var ts = tilesets[0];

        var srcRect = { x: 0, y: 0, width: ts.tileWidth, height: ts.tileHeight };
        var destRect = { x : 0, y: 0, width: TILE_SIZE, height: TILE_SIZE };

        var maxScrollX = tilemap.width * TILE_SIZE - graphics.width;
        var maxScrollY = tilemap.height * TILE_SIZE - graphics.height;

        var drawTile = function(x, y, tile) {
            tile -= 1;
            var tx = tile % ts.width;
            var ty = Math.floor(tile / ts.width);
            srcRect.x = tx * TILE_SIZE;
            srcRect.y = ty * TILE_SIZE;

            destRect.x = x * TILE_SIZE;
            destRect.y = y * TILE_SIZE;

            graphics.drawImageRect(tilesets[0].image, srcRect, destRect);
        };

        this.scrollX = 0;
        this.scrollY = 0;

        this.draw = function() {
            var originTileX = (this.scrollX / TILE_SIZE) | 0,
                originTileY = (this.scrollY / TILE_SIZE) | 0;

            graphics.setOrigin(-this.scrollX, -this.scrollY);

            _(tilemap.layers).times(function(z) {
                _.each2d(SCREEN_WIDTH_IN_TILES + 1, SCREEN_HEIGHT_IN_TILES + 1, function(ix, iy) {
                    var x = originTileX + ix,
                        y = originTileY + iy,
                        tile = tilemap.getAt(x, y, z);

                    if (tile) {
                        drawTile(x, y, tile);
                    }
                }, this);
            });
        };

        this.focusOn = function(x, y) {
            var scrollX = x * TILE_SIZE - graphics.width / 2;
            var scrollY = y * TILE_SIZE - graphics.height / 2;
            this.scrollX = _(scrollX).boundWithin(0, maxScrollX);
            this.scrollY = _(scrollY).boundWithin(0, maxScrollY);
        };
    };

    return TilemapView;
});