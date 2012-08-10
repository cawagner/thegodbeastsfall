var TILE_SIZE = 32;

function Hero() {

}

function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
    this.shouldDrawParent = _.give(true);
}

function FieldState(graphics, tilemap, tilesets) {
    var tilemapView = new TilemapView(tilemap, tilesets, TILE_SIZE, graphics)
        theHero = new Hero(),
        input = new KeyboardInput().setup(),
        scrollX,
        scrollY,
        speed = 0.1;

    var newX = 0, newY = 0;

    theHero.x = 0;
    theHero.y = 0;

    var moveRemaining = 0;
    var moveX = 0, moveY = 0, amountToMove;

    function moveTowardNewSquare() {
        if (moveRemaining > 0) {
            theHero.x += speed * moveX;
            theHero.y += speed * moveY;
            moveRemaining -= speed;
            if (moveRemaining < 0) {
                moveRemaining = 0;
                theHero.x = newX;
                theHero.y = newY;
                moveX = 0;
                moveY = 0;
            }
        }
    }

    this.update = function(timeScale) {
        moveTowardNewSquare();

        if (moveRemaining === 0) {
            if (input.dirX() || input.dirY()) {
                moveRemaining = 1;
                moveX = input.dirX();
                moveY = input.dirY();
                newX += moveX;
                newY += moveY;
                moveTowardNewSquare();
            }
        }

        scrollX = Math.max(0, theHero.x*TILE_SIZE - 320);
        scrollY = Math.max(0, theHero.y*TILE_SIZE - 240);
    };

    this.draw = function(timeScale) {
        tilemapView.draw(scrollX, scrollY);

        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x * TILE_SIZE, theHero.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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