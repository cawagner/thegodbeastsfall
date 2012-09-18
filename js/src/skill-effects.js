SkillEffects = (function() {
    var d20 = Dice.parse("1d20"), d100 = Dice.parse("1d100");

    var standardDamage = function(user, target, skill, dice) {
        var ratio = Math.max(0.1, 1 + (2*user.attack() - target.defense()) / 20);
        var damage = ratio * dice.roll();
        var hitChance = (skill.accuracy * user.accuracy() - target.evade());
        var criticalChance = Math.max(2, 1 + user.criticalChance() * skill.criticalChance - target.luck());
        var isCritical = d100.roll() <= criticalChance;
        var isGreatCritical = isCritical && (d100.roll() <= criticalChance);
        var hasConnected = isCritical || (d100.roll() <= hitChance);

        if (isGreatCritical) {
            // Great critical assumes full dice rolls, and ignores armor value that would reduce attack strength below 100%
            damage = Math.max(1, ratio) * dice.max();
        }

        if (isCritical) {
            damage = damage * skill.criticalMultipler * user.criticalMultiplier();
        }

        return {
            type: "damage",
            amount: Math.round(damage),
            missed: !hasConnected,
            critical: isCritical,
            greatCritical: isGreatCritical,
            damage: hasConnected ? damage : 0,
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
            var dice = Dice.parse(skill.power);

            var results = _(targets).each(function(target) {
                var result = {
                    type: "heal",
                    amount: dice.roll(),
                    target: target
                };
                results.push
            });
        }
    }
})();

