define(['jquery', 'underscore', 'pubsub', 'underscore-mixins', 'string'], function($, _) {
    "use strict";

    var requirements = [
        'util',
        'sound',
        'graphics',
        'gui',
        'tilemap',
        'keyboard-input',
        'touch-input',
        'map-loader',
        'actors/actor',
        'actors/hero',
        'actors/npc',
        'character',
        'pawns/character-pawn',
        'game-state',
        'states/transitions/scroll-transition-state',
        'states/field-state',
        'states/dialogue-state',
        'states/menu-state',
        'states/field-menu-state',
        'states/main-menu-state',
        'states/status-state',
        'game',
        'dice',
        'skill-effects'
    ];

    var includeAll = function(scripts, done) {
        var index = 0;
        var getScript = function() {
            if (index >= scripts.length) {
                return done();
            }
            $.getScript("js/src/" + scripts[index] + ".js").done(getScript);
            ++index;
        };
        getScript();
    };

    var allIncluded = function() {
        $.getJSON("assets/data/skills.json").done(function (data) {
            window.Skills = data;
            console.log(window.Skills);
        });

        var graphics = new Graphics("gameCanvas", 320, 240, 2),
            game = new Game(graphics),
            startFrame,
            endFrame = Date.now(),
            delta,
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

        requestAnimationFrame(function mainLoop() {
            startFrame = endFrame;

            while (collected >= 8) {
                game.update(timeScale);
                collected -= 8;
            }
            game.draw(timeScale);
            endFrame = Date.now();
            delta = endFrame - startFrame;
            collected += Math.min(16 * 3, delta);

            requestAnimationFrame(mainLoop);
        }, document.getElementById("gameCanvas"));

        $("[data-scale]").on("click", function() {
            var scale = parseInt($(this).data("scale"), 10);
            graphics.setScale(scale);
            $("#container").width(320 * scale).height(240 * scale);
        });

        initTouchInput();

        // TODO: elsewhere?
        $.subscribe("/menu/open", function(menu) {
            game.pushState(new MenuState(menu));
        });

        document.body.ontouchmove = function(e) {
            e.preventDefault();
        };
    };

    return {
        init: function() {
            includeAll(requirements, allIncluded);
        }
    }
});