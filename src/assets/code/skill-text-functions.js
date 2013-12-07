define([], function() {
    "use strict";

    var randomUpperishHumanBodyPart = function() {
        return _(["knee", "scalp", "nose", "wrist", "arm", "fingers", "cheeks", "neck"]).sample();
    };

    return {
        heal1: function(action, effects) {
            if (action.user === effects[0].target) {
                return action.user.name + " closes his eyes and breathes deeply.";
            }
            return action.user.name + " gently places his palms on " + effects[0].target.name + "'s shoulders.";
        },
        peck: function(action, effects) {
            return action.user.name + " pecks at " + effects[0].target.name + "'s " + randomUpperishHumanBodyPart() + "!";
        }
    }
});