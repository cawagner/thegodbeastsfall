define([], function() {
    "use strict";

    function MainMenuState() {
        this.draw = function() {

        };

        this.update = _.once(function() {
            $.publish("/game/new");
        });
    }

    return MainMenuState;
});