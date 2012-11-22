define([], function() {
    "use strict";

    function BattleCompositeState() {
        this.queuedStates = [];
        this.currentState = {};
    };

    BattleCompositeState.prototype.enqueueState = function(state) {
        this.queuedStates.push(state);
    };

    BattleCompositeState.prototype.enqueueFunc = function(fn) {
        this.queuedStates.push({
            start: fn,
            update: _.give(true),
            draw: _.noop
        });
    };

    BattleCompositeState.prototype.start = function(args) {
        this.advanceState(args);
    };

    BattleCompositeState.prototype.update = function() {
        var result;
        if (result = this.currentState.update()) {
            this.advanceState(result);
        }
    };

    BattleCompositeState.prototype.draw = function() {
        this.currentState.draw();
    };

    BattleCompositeState.prototype.advanceState = function(result) {
        if (!this.queuedStates.length) {
            throw "Tried to advance state, but there is no next state!";
        }
        var newState = this.queuedStates.shift();
        console.log("Switching from " + this.currentState.constructor.name + " to " + newState.constructor.name);
        this.currentState = newState;
        this.currentState.start(result);
    };

    return BattleCompositeState;
});