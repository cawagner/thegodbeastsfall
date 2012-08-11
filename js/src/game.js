function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
}

function FieldState(graphics, tilemap, tilesets) {
    var tilemapView = new TilemapView(tilemap, tilesets, TILE_SIZE, graphics)
        input = new KeyboardInput().setup();
        theHero = new Hero(tilemap, input),
        scrollX,
        scrollY,
        speed = 0.1;

    theHero.warpTo(0, 0);

    this.update = function(timeScale, previousState) {
        theHero.update();

        scrollX = _(theHero.x * TILE_SIZE - graphics.width() / 2).boundWithin(0, tilemap.width() * TILE_SIZE - graphics.width());
        scrollY = _(theHero.y * TILE_SIZE - graphics.height() / 2).boundWithin(0, tilemap.height() * TILE_SIZE - graphics.height());
    };

    this.draw = function(timeScale, previousState) {
        tilemapView.draw(scrollX, scrollY);

        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x * TILE_SIZE, theHero.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    };
}

function Game(graphics) {
    var gameStates = [ new NoopState() ];
    var game = this;

    this.pushState = function(newState) {
        if ("start" in newState) {
            newState.start(_(gameStates).last());
        }
        gameStates.push(newState);
    };

    this.update = function(timeScale) {
        _(gameStates).last().update(timeScale);
    };

    this.draw = function(timeScale) {
        graphics.setOrigin(0, 0);
        graphics.cls();

        _(gameStates).last().draw(timeScale);

        graphics.swapBuffers();
    };

    (function(){
        var mapLoader = new MapLoader();
        mapLoader.load('DesertPath').done(function(data){
            var fieldState = new FieldState(graphics, data.tilemap, data.tilesets);
            game.pushState(fieldState);
        }); 
    })();
}