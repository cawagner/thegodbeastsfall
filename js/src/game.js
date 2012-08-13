function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
}

// TODO: move somewhere...
function ActorRenderer(graphics) {
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

    this.drawActor = function(actor, frame) {
        var image = images[actor.archetype];

        srcRect.y = 18 * actor.direction;
        srcRect.x = 16 * walkFrames[Math.floor(frame)];

        destRect.x = actor.x * TILE_SIZE;
        destRect.y = actor.y * TILE_SIZE - 4;

        graphics.drawImageRect(image, srcRect, destRect);
    };
}

function DialogueState(game, messages) {
    var message = _(messages).first();

    this.previousState = new NoopState();

    this.start = function(previousState) {
        this.previousState = previousState;
    }

    this.draw = function(timeScale) {
        this.previousState.draw(timeScale);
    };

    this.update = function(timeScale) {

    };

    graphics.drawFilledRect()
}

// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(game, map, entrance) {
    var tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics)
        hero = new Hero(map.tilemap, game.input),
        actors = [],
        frame = 0,
        actorRenderer = new ActorRenderer(game.graphics);

    entrance = entrance || "default";
    if (entrance in map.entrances) {
        hero.warpTo(map.entrances[entrance].x, map.entrances[entrance].y);
    }

    // followers need to be on the map before the hero, so the hero will draw on top and so update order will be right
    _(0).times(function() {
        var follower = new Actor(map.tilemap);
        follower.archetype = "heroine";
        follower.warpTo(hero.x, hero.y);

        actors.push(follower);
        hero.addFollower(follower);
    });

    actors.push(hero);

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
            actorRenderer.drawActor(actor, frame);
        });
    };
}

function Game(graphics) {
    var gameStates = [ new NoopState() ];
    var game = this;

    this.input = new KeyboardInput().setup();
    this.graphics = graphics;

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
}
