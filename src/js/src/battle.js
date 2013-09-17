define(['underscore', 'radio'], function(_, radio) {
    "use strict";

    return function Battle(enemies, options) {
        var self = this;
        var delegate = function(flags) {
            if (flags.ran && self.onRan) {
                self.onRan();
            } else if (flags.won && self.onWon) {
                self.onWon();
            } else if (self.onLost) {
                self.onLost()
            }
            if (self.onDone) {
                self.onDone();
            }
            radio("/battle/end").unsubscribe(delegate);
        };

        radio("/battle/end").subscribe(delegate);

        this.start = _.once(function() {
            radio("/battle/start").broadcast(enemies, options);
        });
    };
});