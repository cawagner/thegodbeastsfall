define(['underscore', 'radio', 'ee'], function(_, radio, EventEmitter) {
    "use strict";

    function Battle(enemies, options) {
        var self = this;
        var delegate = function(flags) {
            self.trigger(flags.result);
            self.trigger('done');
            radio("/battle/end").unsubscribe(delegate);
        };

        radio("/battle/end").subscribe(delegate);

        this.start = _.once(function() {
            radio("/battle/start").broadcast(enemies, options);
        });
    };
    Battle.prototype = Object.create(EventEmitter.prototype);

    return Battle;
});