define(["underscore", "dice", "json!skills.json"], function(_, Dice, Skills) {
    "use strict";

    var d20 = Dice.parse("1d20"), d100 = Dice.parse("1d100");

    var standardDamage = function(user, target, skill, dice) {
        var fullDamage = user.attack() + dice.roll();
        var damage = Math.max(0, (fullDamage * (100-target.damageAbsorption())/100) - target.damageReduction());
        var hitChance = (skill.accuracy * user.accuracy() - target.evade());
        var criticalChance = 1 + Math.max(0, user.criticalChance() * skill.criticalChance - target.luck());
        var isCritical = d100.roll() <= criticalChance;
        var hasConnected = isCritical || (d100.roll() <= hitChance);

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

    var standardHeal = function(user, target, skill, dice) {
        return {
            type: "heal",
            amount: Math.floor(user.support() / 2 + dice.roll()),
            target: target
        };
    };

    var standardBuff = function(user, target, skill, dice) {
        return {
            type: "buff",
            amount: Math.floor(user.support() / 2 + dice.roll()),
            target: target,
            stat: skill.stat,
            duration: skill.duration
        };
    };

    var result = function(user, skill, results) {
        return {
            user: user,
            skill: skill,
            priority: user.priority() + skill.priorityBoost + d20.roll()/2,
            effects: results
        };
    };

    var standardSkillEffect = function(fn, fn2) {
        return function(skill, user, targets) {
            var skill = _.extend({}, Skills["default"], skill);
            var dice = Dice.parse(skill.power);

            var results = _(targets).map(function(target) {
                return fn(user, target, skill, dice);
            });
            if (fn2) {
                _(targets).each(function(target) {
                    results.push(fn2(user, target, skill, dice));
                });
            }

            return result(user, skill, results);
        };
    };

    // TODO: assess skill costs, etc.
    return {
        "damage/melee": standardSkillEffect(standardDamage),
        "damage/melee/2": standardSkillEffect(standardDamage, standardDamage),
        "heal/normal": standardSkillEffect(standardHeal),
        "buff": standardSkillEffect(standardBuff)
    }
});