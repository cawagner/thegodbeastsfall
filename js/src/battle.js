define(['underscore', 'pubsub'], function(_, pubsub) {
    "use strict";

    return function Battle(enemies, options) {
        var delegate = function(flags) {
            if (flags.ran && this.onRan) {
                this.onRan();
            } else if (flags.won && this.onWon) {
                this.onWon();
            } else if (this.onLost) {
                this.onLost()
            }
            if (this.onDone) {
                this.onDone();
            }
        };

        pubsub.subscribeOnce("/battle/end", _.bind(delegate, this));

        this.start = _.once(function() {
            pubsub.publish("/battle/start", [enemies, options]);
        });
    };
});