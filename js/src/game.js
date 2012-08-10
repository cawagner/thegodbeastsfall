function Hero() {

}

function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
    this.shouldDrawParent = _.give(true);
}

function FieldState(graphics, tilemap, tilesets) {
    var tilemapView = new TilemapView(tilemap, tilesets, 32, graphics)
        theHero = new Hero(),
        input = new KeyboardInput().setup(),
        scrollX,
        scrollY,
        speed = 6;

    theHero.x = 320;
    theHero.y = 200;

    this.update = function(timeScale) {
        theHero.x += speed * input.dirX() * timeScale;
        theHero.y += speed * input.dirY() * timeScale;

        scrollX = Math.max(0, theHero.x - 320);
        scrollY = Math.max(0, theHero.y - 240);
    };

    this.draw = function(timeScale) {
        tilemapView.draw(scrollX, scrollY);

        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x, theHero.y, 32, 32);
    };

    this.shouldDrawParent = _.give(false);
}

function Game(graphics) {
    var gameStates = [ new NoopState() ];
    var drawState = function(index, timeScale) {
        var state = gameStates[index], undefined;
        if (state !== undefined) {
            if (state.shouldDrawParent()) {
                drawState(index - 1, timeScale);
            }
            state.draw(timeScale);
        }
    }

    this.update = function(timeScale) {
        var i;
        for (i = gameStates.length - 1; i > 0; --i) {
            if (gameStates[i].update(timeScale) === false) {
                break;
            }
        }
    };

    this.draw = function(timeScale) {
        graphics.setOrigin(0, 0);
        graphics.cls();

        drawState(gameStates.length - 1, timeScale);

        graphics.swapBuffers();
    };

    (function(){
        var mapLoader = new MapLoader();
        mapLoader.load('DesertPath').done(function(data){
            var fieldState = new FieldState(graphics, data.tilemap, data.tilesets);
            gameStates.push(fieldState);
        });
    })();
}