define([], function() {
    "use strict";

    function BattleCompositeState() {
        this.queuedStates = [];
        this.currentState = {};
        this.isDone = false;
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

    BattleCompositeState.prototype.enqueueDone = function() {
        var self = this;
        this.enqueueFunc(function() {
            self.done();
        });
    };

    BattleCompositeState.prototype.start = function(args) {
        this.advanceState(args);
    };

    BattleCompositeState.prototype.update = function() {
        if (this.isDone)
            return true;

        var result;
        if (result = this.currentState.update()) {
            this.advanceState(result);
        }
    };

    BattleCompositeState.prototype.done = function() {
        this.isDone = true;
    };

    BattleCompositeState.prototype.draw = function() {
        this.currentState.draw();
    };

    BattleCompositeState.prototype.advanceState = function(result) {
        var newState = this.queuedStates.shift();
        if (newState === undefined) {
            this.done();
        } else {
            console.log("Switching from " + this.currentState.constructor.name + " to " + newState.constructor.name);
            this.currentState = newState;
            this.currentState.start(result);
        }
    };

    return BattleCompositeState;
});