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

    BattleCompositeState.prototype.enqueueFunc = function(fn, args, context) {
        args = args || [];
        this.queuedStates.push({
            start: function() {
                return fn.apply(context, args);
            },
            update: _.give(true),
            draw: _.noop
        });
    };

    BattleCompositeState.prototype.enqueueDone = function() {
        var self = this;
        this.enqueueFunc(self.done, self);
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
            this.currentState = newState;
            this.currentState.start(result);
        }
    };

    return BattleCompositeState;
});