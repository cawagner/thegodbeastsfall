function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
}

// TODO: move somewhere...
function CharacterRenderer(graphics) {
    var walkFrames = [1,0,1,2];

    var srcRect = { x: 0, y: 0, width: 16, height: 18 };
    var destRect = { x: 0, y: 0, width: 16*2, height: 18*2 };

    // TODO: don't load here...
    var images = {
        "hero": "assets/img/hero.png",
        "heroine": "assets/img/heroine.png"
    };
    _(images).each(function(value, key) {
        images[key] = new Image();
        images[key].src = value;
    });

    this.drawCharacter = function(character, frame) {
        var image = images[character.archetype];

        srcRect.y = 18 * character.direction;
        srcRect.x = 16 * walkFrames[Math.floor(frame)];

        destRect.x = character.x * TILE_SIZE;
        destRect.y = character.y * TILE_SIZE - 4;

        graphics.drawImageRect(image, srcRect, destRect);
    };
}

// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(graphics, map, entrance) {
    var tilesets = map.tilesets,
        tilemap = map.tilemap,
        tilemapView = new TilemapView(tilemap, tilesets, graphics)
        input = new KeyboardInput().setup(),
        hero = new Hero(tilemap, input),
        actors = [],
        frame = 0,
        characterRenderer = new CharacterRenderer(graphics);

    entrance = entrance || "default";
    if (entrance in map.entrances) {
        hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
    }

    actors.push(hero);

    /*
    var follower = new Character(tilemap);
    follower.archetype = "heroine";
    follower.warpTo(2, 2);

    actors.push(follower);
    hero.addFollower(follower);
    */

    this.update = function(timeScale, previousState) {
        _(actors).each(function(actor) {
            actor.update();
        });

        frame = (frame + 0.05 + hero.isMoving() * 0.1) % 4;

        tilemapView.focusOn(hero.x, hero.y);
    };

    this.draw = function(timeScale, previousState) {
        tilemapView.draw();

        _(actors).chain().sortBy("y").each(function(actor) {
            characterRenderer.drawCharacter(actor, frame);
        });
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
        mapLoader.load('DesertPath').done(function(map) {
            console.log(map);

            var fieldState = new FieldState(graphics, map);
            game.pushState(fieldState);

            // TODO: send message, don't directly play music...
            //SoundManager.playMusic('battle');
        });
    })();
}
