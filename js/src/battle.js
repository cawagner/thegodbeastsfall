"use strict";

function Hero() {

}

function Graphics(width, height) {
    var bufferElements = [document.getElementById("buffer0"), document.getElementById("buffer1")],
        bufferContexts = [bufferElements[0].getContext("2d"), bufferElements[1].getContext("2d")],
        drawingBuffer = 1,
        graphicsInfo = { width: width, height: height };

    this.context = function() {
        return bufferContexts[drawingBuffer];
    };

    this.swapBuffers = function() {
        bufferElements[1-drawingBuffer].style.visibility = 'hidden';
        bufferElements[drawingBuffer].style.visibility = 'visible';

        drawingBuffer = 1 - drawingBuffer;
    };

    this.cls = function() {
        this.setFillColorRGB(0, 0, 0);
        this.drawFilledRect(0, 0, width, height);
    };

    this.setFillColorRGB = function(r, g, b) {
        this.context().fillStyle = ["rgb(", r, ",", g, ",", b, ")"].join("");
    };

    this.drawFilledRect = function(x, y, width, height) {
        this.context().fillRect(x, y, width, height);
    };

    this.width = function() { return width; };
    this.height = function() { return height; };
}

function KeyboardInput() {
    var keys = {
        left: false,
        right: false,
        up: false,
        down: false
    };

    var keyCodesToKeys = {
        37: "left",
        39: "right",
        38: "up",
        40: "down"
    };

    var setKeyTo = function(state) {
        return function(e) {
            var key;
            if (e.keyCode in keyCodesToKeys) {
                key = keyCodesToKeys[e.keyCode];
                keys[key] = state;
            }
        };
    }

    this.onKeyDown = setKeyTo(true);
    this.onKeyUp = setKeyTo(false);

    this.setup = function() {
        document.onkeydown = this.onKeyDown;
        document.onkeyup = this.onKeyUp;
        return this;
    };

    this.isLeftDown = function() {
        return keys.left;
    };

    this.isRightDown = function() {
        return keys.right;
    };

    this.isUpDown = function() {
        return keys.up;
    };

    this.isDownDown = function() {
        return keys.down;
    };

    this.dirX = function() {
        return this.isRightDown() - this.isLeftDown();
    };

    this.dirY = function() {
        return this.isDownDown() - this.isUpDown();
    };
}

function Game(graphics) {
    var theHero = new Hero();
    var input = new KeyboardInput().setup();

    theHero.x = 0;
    theHero.y = 200;

    this.update = function(timeScale) {
        theHero.x += 4 * input.dirX() * timeScale;
        theHero.y += 4 * input.dirY() * timeScale;
    };

    this.draw = function(timeScale) {
        graphics.cls();
        graphics.setFillColorRGB(255, 0, 0);
        graphics.drawFilledRect(theHero.x, theHero.y, 32, 32);
        graphics.swapBuffers();
    };
}

function addOnRequestAnimationFrame(callback) {
    var fun = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    fun(callback);
};

(function() {
    var game = new Game(new Graphics(640, 480)),
        startFrame,
        endFrame = Date.now(),
        timeScale = 1;

    addOnRequestAnimationFrame(function mainLoop() {
        startFrame = endFrame;
        game.update(timeScale);
        game.draw(timeScale);
        endFrame = Date.now();
        timeScale = Math.min(3, (timeScale + (endFrame - startFrame) / 30) * 0.5);
        addOnRequestAnimationFrame(mainLoop);
    });
}).call(this);