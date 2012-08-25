function NoopState() {
    this.update = _.noop;
    this.draw = _.noop;
}

// TODO: move somewhere...
function ActorRenderer(graphics) {
    var walkFrames = [1,0,1,2];

    var destRect = { x: 0, y: 0, width: 16, height: 18 };

    // TODO: don't load here...
    var images = {};
    var archetypes = {
        "hero": {
            imagePath: "assets/img/hero.png"
        },
        "heroine": {
            imagePath: "assets/img/heroine.png"
        },
        "oldman": {
            imagePath: "assets/img/oldman.png"
        },
        "littlegirl": {
            imagePath: "assets/img/littlegirl.png"
        },
        "earl": {
            imagePath: "assets/img/earl.png"
        }
    };
    _(archetypes).chain().each(function(archetype, key) {
        images[key] = new Image();
        images[key].src = archetype.imagePath;
    });

    this.drawActor = function(actor, frame) {
        var image = images[actor.archetype];
        var frameToDraw = actor.direction * 3 + walkFrames[Math.floor(frame)];

        var srcRect = graphics.getRectForFrame(frameToDraw, image.width, 16, 18);

        destRect.x = actor.x * TILE_SIZE;
        destRect.y = actor.y * TILE_SIZE - 4;

        graphics.drawImageRect(image, srcRect, destRect);
    };
}

function Game(graphics) {
    if (Game.instance) {
        throw "too many games!";
    }

    var gameStates = [ new MainMenuState() ];
    var game = this;

    this.input = new KeyboardInput().setup();
    this.graphics = graphics;

    Game.instance = this;

    this.currentState = function() {
        return _(gameStates).last();
    };

    this.pushState = function(newState) {
        if (_.isFunction(newState.start)) {
            newState.start(this.currentState());
        }
        if (_.isFunction(this.currentState().suspend)) {
            this.currentState().suspend();
        }
        gameStates.push(newState);
    };

    this.popState = function() {
        var result;
        if (_.isFunction(this.currentState().end)) {
            result = this.currentState().end();
        }
        gameStates.pop();
        if (_.isFunction(this.currentState().reactivate)) {
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