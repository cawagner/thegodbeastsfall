define(['underscore', 'jquery'], function(_, $) {
    "use strict";

    return function Battle(enemies, options) {
        var endSubscription;
        var delegate = function(flags) {
            $.unsubscribe(endSubscription);
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

        endSubscription = $.subscribe("/battle/end", _.bind(delegate, this));

        this.start = _.once(function() {
            $.publish("/battle/start", [enemies, options]);
        });
    };
});