define([
    'underscore',
    'game',
    'graphics',
    'state-events',
    'keyboard-input',
    'touch-input',
    'constants',
    'battle/spell-animations'
], function(
    _,
    game,
    graphics,
    stateEvents,
    input,
    touchInput,
    constants,
    spellAnimations
) {
    "use strict";

    var game;

    var aspectRatio = 4.0/3.0;

    var canvas;

    var collected = 0;
    var startFrame;
    var endFrame = Date.now();
    var timeScale = 1;

    var requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    setTimeout(callback, 16);
                };

    var mainLoop = function() {
        startFrame = endFrame;

        game.update(timeScale);
        collected -= 16.6;

        while (collected > 16.7) {
            game.update(timeScale);
            collected -= 16.6;
        }
        game.draw(timeScale);

        endFrame = Date.now();
        collected += Math.min(16 * 5, endFrame - startFrame);

        requestAnimationFrame(mainLoop, graphics.canvas);
    };

    var resizeCanvas = function() {
        var newWidth = window.innerWidth;
        var newHeight = window.innerHeight;
        var newAspectRatio = newWidth / newHeight;

        if (newAspectRatio > aspectRatio) {
            newWidth = newHeight * aspectRatio;
        } else {
            newHeight = newWidth / aspectRatio;
        }

        container.style.width = newWidth + "px";
        container.style.height = newHeight + "px";
        container.style.marginTop = (-newHeight / 2) + "px";
        container.style.marginLeft = (-newWidth / 2) + "px";
    };

    var init = function() {
        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

        canvas = document.getElementById("gameCanvas");

        input.init();
        touchInput.init(canvas);
        spellAnimations.loadImages(); // hopefully, we don't get into a battle before the animations load...

        stateEvents.init();

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("orientationchange", resizeCanvas);

        setTimeout(function() {
            resizeCanvas();
        }, 10);

        requestAnimationFrame(mainLoop, graphics.canvas);
    };

    return { init: init };
});