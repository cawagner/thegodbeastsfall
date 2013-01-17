define(["pubsub"], function(pubsub) {
    "use strict";

    function MainMenuState() {
        this.draw = function() {

        };

        this.update = _.once(function() {
            pubsub.publish("/game/new");
        });
    }

    return MainMenuState;
});