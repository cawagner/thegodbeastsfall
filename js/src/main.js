define([
    'jquery',
    'underscore',
    'game',
    'graphics',
    'state-events',
    'keyboard-input',
    'touch-input',
    'constants'
], function(
    $,
    _,
    game,
    graphics,
    stateEvents,
    input,
    touchInput,
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

        $("[data-scale]").on("click", function() {
            var scale = parseInt($(this).data("scale"), 10);
            graphics.setGlobalScale(scale);
            $("#container").width(constants.GAME_WIDTH * scale).height(constants.GAME_HEIGHT * scale);
        });

        input.init();
        touchInput.init(input);

        stateEvents.init();

        requestAnimationFrame(mainLoop, graphics.canvas);
    };

    return { init: init };
});