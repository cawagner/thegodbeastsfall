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
    'json!campaign.json',
    // After this point, other objects are extended
    'pubsub',
    'underscore-mixins',
    'string'
];
define(dependencies, function($, Game, Graphics, stateEvents, input, touchInput, util, constants, campaign) {
    "use strict";

    var graphics;
    var game;

    var collected = 0;
    var flippy = false;
    var startFrame;
    var endFrame = Date.now();
    var timeScale = 1;
    var canvas;

    var requestAnimationFrame = util.getRequestAnimationFrame();

    var mainLoop = function() {
        flippy = !flippy;
        startFrame = endFrame;

        while (collected >= 16.6) {
            game.update(timeScale);
            collected -= 16.6;
        }
        if (flippy) {
            game.draw(timeScale);
        }
        endFrame = Date.now();
        collected += Math.min(16 * 3, endFrame - startFrame);

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

        window.document.title = campaign.title;

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