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
