function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
}

// TODO: move somewhere...
function CharacterRenderer(graphics) {
    var walkFrames = [1,0,1,2];

    var srcRect = { x: 0, y: 0, width: 16, height: 18 };
    var destRect = { x: 0, y: 0, width: 16*2, height: 18*2 };

    this.drawCharacter = function(character, image, frame) {
        srcRect.y = 18 * character.direction;
        srcRect.x = 16 * walkFrames[Math.floor(frame)];

        destRect.x = character.x * TILE_SIZE;
        destRect.y = character.y * TILE_SIZE;

        graphics.drawImageRect(image, srcRect, destRect);
    };
}

function FieldState(graphics, tilemap, tilesets) {
    var tilemapView = new TilemapView(tilemap, tilesets, graphics)
        input = new KeyboardInput().setup(),
        hero = new Hero(tilemap, input),
        scrollX,
        scrollY,
        heroImage = new Image(),
        frame = 0,
        characterRenderer = new CharacterRenderer(graphics);

    // TODO: don't load here...
    heroImage.src = 'assets/img/hero.png';

    hero.warpTo(2, 2);

    this.updateScroll = function() {
        scrollX = _(hero.x * TILE_SIZE - graphics.width() / 2).boundWithin(0, tilemap.width() * TILE_SIZE - graphics.width());
        scrollY = _(hero.y * TILE_SIZE - graphics.height() / 2).boundWithin(0, tilemap.height() * TILE_SIZE - graphics.height());
    };

    this.update = function(timeScale, previousState) {
        hero.update();

        frame = (frame + 0.05 + hero.isMoving() * 0.1) % 4;

        this.updateScroll();
    };

    this.draw = function(timeScale, previousState) {
        tilemapView.draw(scrollX, scrollY);

        characterRenderer.drawCharacter(hero, heroImage, frame);
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
        mapLoader.load('DesertPath').done(function(data) {
            var fieldState = new FieldState(graphics, data.tilemap, data.tilesets);
            game.pushState(fieldState);
        }); 
    })();
}