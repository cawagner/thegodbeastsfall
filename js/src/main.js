var dependencies = [
    'jquery',
    'underscore',
    // Classes
    'game',
    'graphics',
    'menu',
    'state-events',
    // Just return objects
    'keyboard-input',
    'sound',
    'touch-input',
    // After this point, other objects are extended
    'pubsub',
    'underscore-mixins',
    'string'
];
define(dependencies, function($, _, Game, Graphics, Menu, stateEvents, input, sound, touchInput) {
    "use strict";

    var init = function() {
        var graphics = new Graphics("gameCanvas", 320, 240, 2),
            game = new Game(graphics, input),
            startFrame,
            endFrame = Date.now(),
            collected = 0,
            timeScale = 1;

        var requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    setTimeout(callback, 16);
                };

        // HACK: no :(
        window.Game = {
            instance: game
        };

        requestAnimationFrame(function mainLoop() {
            startFrame = endFrame;

            while (collected >= 8) {
                game.update(timeScale);
                collected -= 8;
            }
            game.draw(timeScale);
            endFrame = Date.now();
            collected += Math.min(16 * 3, endFrame - startFrame);

            requestAnimationFrame(mainLoop);
        }, document.getElementById("gameCanvas"));

        $("[data-scale]").on("click", function() {
            var scale = parseInt($(this).data("scale"), 10);
            graphics.setScale(scale);
            $("#container").width(320 * scale).height(240 * scale);
        });

        input.init();
        touchInput.init(input);

        stateEvents.init(game);
    };

    return {
        init: init
    };
});