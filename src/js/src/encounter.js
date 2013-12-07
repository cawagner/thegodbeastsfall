define(["underscore", "battle"], function(_, Battle) {
    "use strict";

    function Encounter(opts) {
        this.x = opts.x;
        this.y = opts.y;
        this.width = opts.width;
        this.height = opts.height;
        this.parties = opts.parties;
        this.minFrequency = opts.minFrequency;
        this.maxFrequency = opts.maxFrequency;
        this.stepsUntilNext = 0;
        this.timesTriggered = 0;
        this.reset();
    };

    Encounter.prototype.step = function() {
        this.stepsUntilNext--;

        if (this.stepsUntilNext <= 0) {
            this.trigger();
        }
    };

    Encounter.prototype.trigger = function() {
        this.timesTriggered++;

        new Battle(_(this.parties).sample()).start();

        this.reset();
    };

    Encounter.prototype.reset = function() {
        this.stepsUntilNext = 2 * this.timesTriggered + _.random(this.minFrequency, this.maxFrequency);
    };

    return Encounter;
});