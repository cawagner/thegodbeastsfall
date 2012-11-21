define(["underscore", "dice", "json!skills.json"], function(_, Dice, Skills) {
    "use strict";

    var d20 = Dice.parse("1d20"), d100 = Dice.parse("1d100");

    var standardDamage = function(user, target, skill, dice) {
        var fullDamage = Math.round(user.attack() / 2) + dice.roll();
        var damage = Math.max(0, (fullDamage * (100-target.damageAbsorption())/100) - target.damageReduction());
        var hitChance = (skill.accuracy * user.accuracy() - target.evade());
        var criticalChance = 1 + Math.max(0, user.criticalChance() * skill.criticalChance - target.luck());
        var isCritical = d100.roll() <= criticalChance;
        var hasConnected = isCritical || (d100.roll() <= hitChance);

        console.log(skill);

        if (isCritical) {
            damage = (damage + target.damageReduction()) * skill.criticalMultiplier * user.criticalMultiplier();
        }

        return {
            type: "damage",
            missed: !hasConnected,
            critical: isCritical,
            amount: hasConnected ? Math.round(damage) : 0,
            target: target
        }
    };

    // TODO: assess skill costs, etc.
    return {
        "damage/melee": function(skill, user, targets) {
            var skill = _.extend({}, Skills["default"], skill);
            var dice = Dice.parse(skill.power);

            var results = _(targets).map(function(target) {
                var result = standardDamage(user, target, skill, dice);
                return result;
            });

            return {
                priority: user.priority() + skill.priorityBoost,
                effects: results,
                success: true
            };
        },
        "heal/normal": function(skill, user, targets) {
            return {
                success: false,
                effects: []
            };
        }
    }
});