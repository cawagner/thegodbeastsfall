define([], function() {
    "use strict";
    return {
        heal1: function(action, effects) {
            if (action.user === effects[0].target) {
                return action.user.name + " closes his eyes and breathes deeply.";
            }
            return action.user.name + " gently places his palms on " + effects[0].target.name + "'s shoulders.";
        }
    }
});