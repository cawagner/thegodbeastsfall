define(["battle/battle-text-provider"], function(textProvider) {
    "use strict";

    var poison = function(effect) {
        return {
            wait: 9999,
            round: function() {
                var result = "hasTakenPoisonDamage" in effect.target.scratch ? [] : [{
                    type: "message",
                    text: textProvider.getMessage("poisonDamage", { target: effect.target.name })
                }];
                effect.target.scratch.hasTakenPoisonDamage = true;
                result.push({
                    type: "damage",
                    amount: Math.ceil(effect.target.maxHp() / 30),
                    target: effect.target
                });
                return result;
            },
            remove: function() {
                var result = "hasBeenCuredOfPoison" in effect.target.scratch ? [] : [{
                    type: "message",
                    text: textProvider.getMessage("poisonCured", { target: effect.target.name })
                }];
                effect.target.scratch.hasBeenCuredOfPoison = true;
                return result;
            },
            key: "poison"
        };
    };

    return {
        createPoison: poison
    };
});