define([], function() {
    "use strict";
    
    return function NoopState() {
        this.update = _.noop;
        this.draw = _.noop;
    }
});