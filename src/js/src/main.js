define([
    'underscore',
    'game',
    'graphics',
    'state-events',
    'keyboard-input',
    'constants'
], function(
    _,
    game,
    graphics,
    stateEvents,
    input,
    constants
) {
    "use strict";

    var game;

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

    var init = function() {
        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

        input.init();

        stateEvents.init();

        requestAnimationFrame(mainLoop, graphics.canvas);
    };

    return { init: init };
});