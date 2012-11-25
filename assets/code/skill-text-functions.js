define([], function() {
    "use strict";
    return {
        drink: function(action, effects) {
            return action.user.name + " took a hearty swig of moonshine!";
        }
    }
});