var dependencies = [
    'jquery',
    'underscore',
    // Classes
    'game',
    'graphics',
    'menu',
    'states/field-menu-state',
    'states/menu-state',
    'states/main-menu-state',
    'states/field-state',
    'states/dialogue-state',
    // Just return objects
    'keyboard-input',
    'touch-input',
    // After this point, other objects are extended
    'pubsub',
    'underscore-mixins',
    'string'
];
define(dependencies, function($, _, Game, Graphics, Menu, FieldMenuState, MenuState, MainMenuState, FieldState, DialogueState, input, touchInput) {
    "use strict";

    // TODO: we'll fix this madness ASAP...
    window.FieldMenuState = FieldMenuState;
    window.MainMenuState = MainMenuState;
    window.FieldState = FieldState;

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

        // TODO: elsewhere?
        $.subscribe("/menu/open", function(menu) {
            game.pushState(new MenuState(menu));
        });

        // TODO: doesn't go here!
        $.subscribe("/npc/talk", function(messages, npc) {
            var fakeNpc = {
                lockMovement: _.noop,
                unlockMovement: _.noop
            };

            npc = npc || fakeNpc;

            npc.lockMovement();

            game.pushState(new DialogueState(messages, function() {
                npc.unlockMovement();
            }));
        });

        $.subscribe("/hero/menu", function() {
            game.pushState(new FieldMenuState());
        });
    };

    return {
        init: init
    };
});