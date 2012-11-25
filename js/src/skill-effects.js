define(["underscore", "dice", "json!skills.json"], function(_, Dice, Skills) {
    "use strict";

    var d20 = Dice.parse("1d20"), d100 = Dice.parse("1d100");

    var standardDamage = function(user, target, skill, dice) {
        var fullDamage = user.attack() + dice.roll();
        var damage = Math.max(1, (fullDamage * (100-target.damageAbsorption())/100) - target.damageReduction());
        var hitChance = (skill.accuracy * user.accuracy() - target.evade());
        var criticalChance = 1 + Math.max(0, user.criticalChance() * skill.criticalChance - target.luck());
        var isCritical = user.isDying || d100.roll() <= criticalChance;
        var hasConnected = isCritical || (d100.roll() <= hitChance);

        if (isCritical) {
            damage = (fullDamage * (100-target.damageAbsorption())/100) * skill.criticalMultiplier * user.criticalMultiplier();
        }

        return {
            type: "damage",
            missed: !hasConnected,
            critical: isCritical,
            amount: hasConnected ? Math.round(damage) : 0,
            target: target
        }
    };

    var magicDamage = function(user, target, skill, dice) {
        var damage = Math.ceil((user.force() / target.resist()) * dice.roll());

        // TODO: apply weakness / resistance, etc.

        return {
            type: "damage",
            missed: false,
            amount: damage,
            target: target
        };
    }

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

    var poison = function(user, target, skill, dice) {
        return {
            type: "poison",
            target: target,
            duration: dice.roll()
        };
    };

    var removeStatus = function(user, target, skill, dice) {
        return {
            type: "removeStatus",
            status: skill.status,
            target: target
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
            return results;
        };
    };

    // TODO: assess skill costs, etc.
    return {
        "damage/melee": standardSkillEffect(standardDamage),
        "damage/melee/2": standardSkillEffect(standardDamage, standardDamage),
        "damage/magic": standardSkillEffect(magicDamage),
        "heal/normal": standardSkillEffect(standardHeal),
        "buff": standardSkillEffect(standardBuff),
        "poison": standardSkillEffect(poison),
        "removeStatus": standardSkillEffect(removeStatus),
        "none": _.give([]),
        "navelgaze": function(skill, user, targets) {
            return [
                { type: "message", text: skill.message }
            ]
        }
    }
});