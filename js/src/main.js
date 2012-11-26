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

    var init = function() {
        var graphics = new Graphics("gameCanvas", constants.GAME_WIDTH, constants.GAME_HEIGHT, 1),
            game = new Game(graphics, input),
            startFrame,
            endFrame = Date.now(),
            collected = 0,
            timeScale = 1;

        _.templateSettings = {
            interpolate : /\{\{(.+?)\}\}/g
        };

        var requestAnimationFrame = util.getRequestAnimationFrame();

        // HACK: no :(
        window.Game = { instance: game };

        window.document.title = campaign.title;

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
            $("#container").width(constants.GAME_WIDTH * scale).height(constants.GAME_HEIGHT * scale);
        });

        input.init();
        touchInput.init(input);

        stateEvents.init(game);
    };

    return { init: init };
});