var TILE_SIZE = 32;

function Hero(tilemap, input) {
    var SPEED = 0.1;
    var destX = 0, destY = 0,
        moveX = 0, moveY = 0;
    var moveRemaining = 0;
    var self = this;

    var moveTowardNewSquare = function() {
        if (self.canMove()) {
            return;
        }

        self.x += SPEED * moveX;
        self.y += SPEED * moveY;

        moveRemaining -= SPEED;
        if (moveRemaining < 0) {
            moveRemaining = 0;
            self.x = destX;
            self.y = destY;
            moveX = 0;
            moveY = 0;
        }
    };

    var takeWalkInput = function() {
        if (self.canMove()) {
            self.moveBy(input.dirX(), input.dirY());
        }
    };

    this.x = 0;
    this.y = 0;

    this.update = function(timeScale) {
        moveTowardNewSquare();
        takeWalkInput();
    };

    this.warpTo = function(newX, newY) {
        this.x = newX;
        this.y = newY;
    };

    this.canMove = function() {
        return moveRemaining === 0;
    };

    this.moveBy = function(dx, dy) {
        if ((dx || dy) && tilemap.isWalkable(this.x + dx, this.y + dy)) {
            moveX = dx;
            moveY = dy;
            moveRemaining = 1;
            destX = this.x + moveX;
            destY = this.y + moveY;
            moveTowardNewSquare();
            return true;
        }
        return false;
    };
}

function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
    this.shouldDrawParent = _.give(true);
}

function FieldState(graphics, tilemap, tilesets) {
    var tilemapView = new TilemapView(tilemap, tilesets, TILE_SIZE, graphics)
        input = new KeyboardInput().setup();
        theHero = new Hero(tilemap, input),
        scrollX,
        scrollY,
        speed = 0.1;

    theHero.warpTo(0, 0);

    this.update = function(timeScale) {
        theHero.update();

        scrollX = _(theHero.x * TILE_SIZE - graphics.width() / 2).boundWithin(0, tilemap.width() * TILE_SIZE - graphics.width());
        scrollY = _(theHero.y * TILE_SIZE - graphics.height() / 2).boundWithin(0, tilemap.height() * TILE_SIZE - graphics.height());
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