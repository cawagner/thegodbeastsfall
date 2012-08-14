function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
}

// TODO: move somewhere...
function ActorRenderer(graphics) {
    var walkFrames = [1,0,1,2];

    var srcRect = { x: 0, y: 0, width: 16, height: 18 };
    var destRect = { x: 0, y: 0, width: 16, height: 18 };

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

    var drawWindowRect = function(x, y, width, height) {
        // game.graphics.setFillColor("#000");
        // game.graphics.drawFilledRect(x - 8, y - 8, width + 16, height + 16);
        // game.graphics.setFillColor("#fff");
        // game.graphics.drawFilledRect(x - 6, y - 6, width + 12, height + 12);
        // game.graphics.setFillColor("#000");
        // game.graphics.drawFilledRect(x - 4, y - 4, width + 8, height + 8);
    };

    this.start = function(previousState) {
        this.previousState = previousState;
    }

    this.draw = function(timeScale) {
        this.previousState.draw(timeScale);

        // game.graphics.setOrigin(0, 0);
        // drawWindowRect(10, 20, 280, 60);
        // game.graphics.drawText(10, 50, message.text);
    };

    this.update = function(timeScale) {
        if (game.input.wasConfirmPressed()) {
            game.popState();
        }
    };
}

// TODO: make some function to open the state instead of having such a horrible constructor
function FieldState(game, map, entrance) {
    var tilemapView = new TilemapView(map.tilemap, map.tilesets, game.graphics),
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

        if (game.input.wasConfirmPressed()) {
            game.pushState(new DialogueState(game, [
                {
                    speaker: "Held",
                    text: "Hi, mom!"
                }]));
        }
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

    this.currentState = function() {
        return _(gameStates).last();
    };

    this.pushState = function(newState) {
        if ("start" in newState) {
            newState.start(this.currentState());
        }
        gameStates.push(newState);
    };

    this.popState = function() {
        var result;
        if ("end" in this.currentState()) {
            result = this.currentState().end();
        }
        gameStates.pop();
        if ("reactivate" in this.currentState()) {
            this.currentState().reactivate(result);
        }
    };

    this.update = function(timeScale) {
        this.currentState().update(timeScale);
    };

    this.draw = function(timeScale) {
        graphics.setOrigin(0, 0);
        graphics.cls();

        this.currentState().draw(timeScale);

        graphics.swapBuffers();
    };
}
