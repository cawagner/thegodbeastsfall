SkillEffects = (function() {
    var d20 = Dice.parse("1d20"), d100 = Dice.parse("1d100");
    return {
        "damage/melee": function(skill, user, targets) {
            var results = [],
                skill = _.extend({}, Skills["default"], skill),
                dice = Dice.parse(skill.power);

            _(targets).each(function(target) {
                var damage = (target.defense() / user.attack()) * dice.value(),
                    hitChance = (skill.accuracy * user.accuracy() - target.evade()),
                    criticalChance = Math.max(2, user.criticalChance() * skill.criticalChance - target.luck());
                var isCritical = d100.roll() <= criticalChance;
                var hasConnected = isCritical || (d100.roll() <= hitChance);

                if (isCritical) {
                    damage = damage * skill.criticalMultipler * user.criticalMultiplier();
                }

                results.push({
                    type: "damage",
                    damage: Math.round(damage),
                    success: true,
                    missed: !hasConnected,
                    critical: isCritical,
                    damage: hasConnected ? damage : 0,
                    target: target
                });
            });

            return results;
        }
    }
}());

Skills = {
    "slash": {
        "name": "Slash",
        "target": "enemy", // enemy, enemies, ally, allies
        "effect": "damage/melee",
        "power": "2d6"
    },
    "hard": {
        "name": "Hard",
        "target": "enemy",
        "effect": "damage/melee",
        "power": "4d6k3",
        "cooldown": 1
    },
    "ooze": {
        "name": "Ooze",
        "target": "enemy",
        "effect": "damage/melee",
        "power": "2d4"
    },
    "default": {
        "name": "Default",
        "power": 1,
        "accuracy": 1,
        "criticalChance": 1,
        "criticalMultiplier": 1,
        "priorityBoost": 0
    }
};