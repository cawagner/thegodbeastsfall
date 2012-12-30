define(["underscore", "dice", "json!skills.json"], function(_, Dice, Skills) {
    "use strict";

    var d20 = Dice.parse("1d20"),
        d100 = Dice.parse("1d100");

    var standardDamage = function(user, target, skill) {
        var attack = user.attack();
        var da = (100-target.damageAbsorption()) / 100;
        var dr = target.damageReduction();
        var dice = Dice.parse(skill.power);
        var roll = dice.roll();

        var damage = 0;

        var hitChance = skill.accuracy * (user.accuracy() + 60) - target.evade();
        var criticalChance = Math.max(1, 1 + user.criticalChance() * skill.criticalChance - target.luck());

        var isCritical = user.isDying || d100.roll() <= criticalChance;
        var hasConnected = d100.roll() <= hitChance;

        if (isCritical) {
            if (hasConnected) {
                attack = attack * user.criticalMultiplier();
                roll = roll * skill.criticalMultiplier * user.criticalMultiplier();
                dr = 0;
            } else {
                isCritical = false;
                hasConnected = true;
            }
        }

        if (hasConnected) {
            damage = (attack + roll) * da - dr;
        }

        return {
            type: "damage",
            missed: !hasConnected,
            critical: isCritical,
            amount: hasConnected ? Math.round(Math.max(1, damage)) : 0,
            target: target,
            damageType: "melee"
        }
    };

    var magicDamage = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        var damage = Math.ceil((user.force() / target.resist()) * dice.roll());

        // TODO: apply weakness / resistance, etc.

        return {
            type: "damage",
            missed: false,
            amount: damage,
            target: target,
            damageType: "magic"
        };
    };

    var magicDamageToFamily = function(user, target, skill) {
        if (target.enemy && _(skill.families).contains(target.enemy.family)) {
            return magicDamage(user, target, skill);
        } else {
            return {
                type: "message",
                text: skill.whiff,
                success: false
            };
        }
    };

    var standardHeal = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "heal",
            amount: Math.floor(user.support() / 2 + dice.roll()),
            target: target
        };
    };

    var standardBuff = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "buff",
            amount: Math.floor(user.support() / 2 + dice.roll()),
            target: target,
            stat: skill.stat,
            duration: skill.duration
        };
    };

    var standardDebuff = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "buff",
            amount: -Math.floor(user.force() / 2 + dice.roll()),
            target: target,
            stat: skill.stat,
            duration: skill.duration
        };
    };

    var poison = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "poison",
            target: target,
            duration: dice.roll()
        };
    };

    var removeStatus = function(user, target, skill) {
        return {
            type: "removeStatus",
            status: skill.status,
            target: target
        };
    };

    var standardSkillEffect = function() {
        var fns = arguments;
        return function(skill, user, targets) {
            var skill = _.extend({}, Skills["default"], skill);

            var results = [];
            _(fns).each(function(fn) {
                _(targets).each(function(target) {
                    var result = fn(user, target, skill);
                    result.skill = skill;
                    results.push(result);
                });
            });
            return results;
        };
    };

    // TODO: assess skill costs, etc.
    return {
        "damage/melee": standardSkillEffect(standardDamage),
        "damage/melee/2": standardSkillEffect(standardDamage, standardDamage),
        "damage/magic": standardSkillEffect(magicDamage),
        "damage/magic/family": standardSkillEffect(magicDamageToFamily),
        "heal/normal": standardSkillEffect(standardHeal),
        "buff": standardSkillEffect(standardBuff),
        "debuff": standardSkillEffect(standardDebuff),
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