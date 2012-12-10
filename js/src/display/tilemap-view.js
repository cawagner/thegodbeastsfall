// I think there may be a race condition based on when this loads relative to when other things load...
define(["constants", "graphics"], function(constants, graphics) {
    "use strict";

    var TILE_SIZE = constants.TILE_SIZE;

    var damnedBigCanvas = document.createElement("canvas");
    var context = damnedBigCanvas.getContext("2d");

    var fullSourceRect = {
        x: 0,
        y: 0,
        width: constants.GAME_WIDTH,
        height: constants.GAME_HEIGHT
    };

    var fullDestRect = {
        x: 0,
        y: 0,
        width: constants.GAME_WIDTH,
        height: constants.GAME_HEIGHT
    };

    var TilemapView = function(tilemap, tilesets) {
        // TODO: support multiple tilesets!
        var ts = tilesets[0];

        var srcRect = {
            x: 0,
            y: 0,
            width: ts.tileWidth,
            height: ts.tileHeight
        };
        var destRect = {
            x : 0,
            y: 0,
            width: TILE_SIZE,
            height: TILE_SIZE
        };

        var maxScrollX = tilemap.width * TILE_SIZE - constants.GAME_WIDTH;
        var maxScrollY = tilemap.height * TILE_SIZE - constants.GAME_HEIGHT;

        damnedBigCanvas.width = tilemap.width * TILE_SIZE;
        damnedBigCanvas.height = tilemap.height * TILE_SIZE;

        var lastTile = -1, tileset;
        _(tilemap.layers).times(function(z) {
            _.each2d(tilemap.width, tilemap.height, function(x, y) {
                var tile = tilemap.getAt(x, y, z);
                var tx, ty;
                if (tile > 0) {
                    if (tile !== lastTile) {
                        lastTile = tile;
                        tileset = _(tilesets).find(function(ts) {
                            return tile >= ts.firstTile && tile < ts.firstTile + ts.length;
                        });
                    }
                    tile -= tileset.firstTile;
                    tx = tile % tileset.width;
                    ty = Math.floor(tile / tileset.width);
                    context.drawImage(tileset.image,
                        tx * TILE_SIZE, ty * TILE_SIZE,
                        TILE_SIZE, TILE_SIZE,
                        x * TILE_SIZE, y * TILE_SIZE,
                        TILE_SIZE, TILE_SIZE
                    );
                }
            }, this);
        });

        this.scrollX = 0;
        this.scrollY = 0;

        this.draw = function() {
            graphics.setOrigin(0, 0);
            fullSourceRect.x = this.scrollX | 0;
            fullSourceRect.y = this.scrollY | 0;
            graphics.drawImageRect(damnedBigCanvas, fullSourceRect, fullDestRect);
            graphics.setOrigin(-this.scrollX|0, -this.scrollY|0);
        };

        this.focusOn = function(x, y) {
            var scrollX = x * TILE_SIZE - constants.GAME_WIDTH / 2;
            var scrollY = y * TILE_SIZE - constants.GAME_HEIGHT / 2;
            this.scrollX = _(scrollX).boundWithin(0, maxScrollX);
            this.scrollY = _(scrollY).boundWithin(0, maxScrollY);
        };
    };

    return TilemapView;
});