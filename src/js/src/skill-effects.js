define(["underscore", "dice", "data/skills"], function(_, Dice, skills) {
    "use strict";

    var d20 = Dice.parse("1d20"),
        d100 = Dice.parse("1d100");

    var getDamageSound = function(target, isCritical, hasConnected) {
        if (!hasConnected)
            return "miss";
        if (target.type === 'enemy') {
            return isCritical ? "critical" : "hit";
        } else {
            return "playerhit";
        }
    };

    var meleeHitChance = function(user, target, skill) {
        return skill.accuracy * (user.accuracy() + 60) - target.evade();
    };

    var meleeCriticalChance = function(user, target, skill) {
        return Math.max(1, 1 + user.criticalChance() * skill.criticalChance - target.luck());
    };

    var standardDamage = function(user, target, skill) {
        var attack = user.attack();
        var da = (100-target.damageAbsorption()) / 100;
        var dr = target.damageReduction();
        var dice = Dice.parse(skill.power);
        var roll = dice.roll();

        var damage = 0;

        var hitChance = meleeHitChance(user, target, skill);
        var criticalChance = meleeCriticalChance(user, target, skill);

        var isCritical = d100.roll() <= criticalChance;
        var hasConnected = d100.roll() <= hitChance;

        if (isCritical) {
            if (hasConnected) {
                _(skill.criticalMultiplier * user.criticalMultiplier() - 1).times(function() {
                    roll += dice.roll();
                });
                dr = Math.floor(dr / 4);
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
            damageType: "melee",
            sound: skill.sound || getDamageSound(target, isCritical, hasConnected)
        }
    };

    var vampire = function(user, target, skill) {
        var damageEffect = standardDamage(user, target, skill);
        var suckEffect = {
            type: "heal",
            amount: Math.ceil(damageEffect.amount / 2),
            target: user
        };

        return [
            damageEffect,
            suckEffect
        ];
    }

    var magicDamage = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        var damage = Math.ceil((user.force() / target.resist()) * dice.roll());
        var isWeak = skill.element && _(target.weaknesses()).contains(skill.element);

        if (isWeak) {
            damage = Math.floor(damage * 1.5);
        }

        return {
            type: "damage",
            missed: false,
            amount: damage,
            target: target,
            damageType: "magic",
            sound: "feu",
            critical: isWeak
        };
    };

    var magicDamageToFamily = function(user, target, skill) {
        if (target.enemy && _(skill.families).contains(target.enemy.family)) {
            return magicDamage(user, target, skill);
        } else {
            return {
                type: "message",
                text: skill.whiff,
                success: false,
                sound: "miss"
            };
        }
    };

    var standardHeal = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "heal",
            amount: Math.floor(user.support() / 2 + dice.roll()),
            target: target,
            sound: "heal"
        };
    };

    var standardBuff = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "buff",
            amount: Math.floor(user.support() / 2 + dice.roll()),
            target: target,
            stat: skill.stat,
            duration: skill.duration,
            sound: "heal"
        };
    };

    var standardDebuff = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "buff",
            amount: -Math.floor(user.force() / 2 + dice.roll()),
            target: target,
            stat: skill.stat,
            duration: skill.duration,
            sound: "feu"
        };
    };

    var poison = function(user, target, skill) {
        var dice = Dice.parse(skill.power);
        return {
            type: "poison",
            target: target,
            duration: dice.roll(),
            sound: "soft"
        };
    };

    var removeStatus = function(user, target, skill) {
        return {
            type: "removeStatus",
            status: skill.status,
            target: target,
            sound: "heal"
        };
    };

    var giantess = function(skill, user) {
        user.height = user.height || (5 * 12 + 7);

        var dice =  Dice.parse("3d4");
        var addInches = Math.round((user.support() / 12.0) * dice.roll());
        var feet, inches;

        user.height += addInches;

        feet = Math.floor(user.height / 12);
        inches = user.height % 12;
        return {
            effects: [
                {
                    type: "message",
                    text: user.name + " grew " + addInches + " inches to " + feet + "'" + inches + '"',
                    skill: skill
                },
                {
                    type: "buff", target: user, stat: "strength", amount: addInches, duration: 15, skill: skill
                },
                {
                    type: "buff", target: user, stat: "maxHp", amount: addInches * 3, duration: 15, skill: skill
                },
                {
                    type: "heal", amount: addInches, target: user, skill: skill
                }
            ],
            skill: skill
        };
    };

    var standardSkillEffect = function(effectors) {
        var fns = arguments;
        effectors = [].concat(effectors);
        return function(skill, user, targets) {
            var skill = _.extend({}, skills["default"], skill);

            var effects = [];
            effectors.forEach(function(effector) {
                targets.forEach(function(target) {
                    var result = effector(user, target, skill);
                    result.skill = skill;
                    effects = effects.concat(result);
                });
            });
            return {
                skill: skill,
                effects: effects
            };
        };
    };

    // TODO: assess skill costs, etc.
    return {
        "damage/melee": standardSkillEffect(standardDamage),
        "damage/melee/vampire": standardSkillEffect(vampire),
        "damage/melee/2": standardSkillEffect([standardDamage, standardDamage]),
        "damage/magic": standardSkillEffect(magicDamage),
        "damage/magic/family": standardSkillEffect(magicDamageToFamily),
        "heal/normal": standardSkillEffect(standardHeal),
        "buff": standardSkillEffect(standardBuff),
        "debuff": standardSkillEffect(standardDebuff),
        "poison": standardSkillEffect(poison),
        "removeStatus": standardSkillEffect(removeStatus),
        "giantess": giantess,
        "navelgaze": function(skill, user, targets) {
            return {
                effects: [ { type: "message", text: skill.message, sound: "goofy" } ],
            };
        }
    }
});