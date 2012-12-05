var dependencies = [
    'jquery',
    // Classes
    'game',
    'graphics',
    'state-events',
    // Just return objects
    'keyboard-input',
    'touch-input',
    'util',
    'constants',
    // After this point, other objects are extended
    'pubsub',
    'underscore-mixins',
    'string'
];
define(dependencies, function($, Game, Graphics, stateEvents, input, touchInput, util, constants) {
    "use strict";

    var graphics;
    var game;

    var collected = 0;
    var startFrame;
    var endFrame = Date.now();
    var timeScale = 1;
    var canvas;

    var requestAnimationFrame = util.getRequestAnimationFrame();

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

        requestAnimationFrame(mainLoop, canvas);
    };

    var init = function() {
        canvas = document.getElementById("gameCanvas");
        graphics = new Graphics(canvas, constants.GAME_WIDTH, constants.GAME_HEIGHT, 1);
        game = new Game(graphics, input);

        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

        // HACK: no :(
        window.Game = { instance: game };

        $("[data-scale]").on("click", function() {
            var scale = parseInt($(this).data("scale"), 10);
            graphics.setGlobalScale(scale);
            $("#container").width(constants.GAME_WIDTH * scale).height(constants.GAME_HEIGHT * scale);
        });

        input.init();
        touchInput.init(input);

        stateEvents.init(game);

        requestAnimationFrame(mainLoop, canvas);
    };

    return { init: init };
});