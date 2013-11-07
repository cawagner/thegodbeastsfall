define([], function() {
    "use strict";

    function CompositeState() {
        this.queuedStates = [];
        this.currentState = {};
        this.isDone = false;
    };

    CompositeState.prototype.enqueueState = function(state) {
        this.queuedStates.push(state);
    };

    CompositeState.prototype.enqueueFunc = function(fn, args, context) {
        args = args || [];
        this.queuedStates.push({
            start: function() {
                return fn.apply(context, args);
            },
            update: _.give(true),
            draw: _.noop
        });
    };

    CompositeState.prototype.enqueueDone = function() {
        var self = this;
        this.enqueueFunc(self.done, self);
    };

    CompositeState.prototype.start = function(args) {
        this.advanceState(args);
    };

    CompositeState.prototype.update = function() {
        if (this.isDone)
            return true;

        var result;
        if (result = this.currentState.update()) {
            this.advanceState(result);
        }
    };

    CompositeState.prototype.done = function() {
        this.isDone = true;
    };

    CompositeState.prototype.draw = function() {
        this.currentState.draw();
    };

    CompositeState.prototype.advanceState = function(result) {
        var newState = this.queuedStates.shift();
        if (newState === undefined) {
            this.done();
        } else {
            this.currentState = newState;
            this.currentState.start(result);
        }
    };

    CompositeState.prototype.runAll = function() {
        this.start();
        while (!this.isDone) {
            this.update();
        }
    };

    return CompositeState;
});