define(["dice"], function(Dice) {
    "use strict";

    return {
        "heal/normal": function(user, target, item) {
            return {
                type: "heal",
                target: "target",
                amount: Dice.parse(item.power).roll()
            };
        }
    };
});