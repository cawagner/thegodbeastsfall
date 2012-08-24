function CharacterPawn(character) {
    this.character = character;
}

CharacterPawn.prototype.strength = function() {
    return this.character.strength;
};

CharacterPawn.prototype.agility = function() {
    return this.character.agility;
};

CharacterPawn.prototype.intelligence = function() {
    return this.character.intelligence;
};

CharacterPawn.prototype.luck = function() {
    return this.character.luck;
};

CharacterPawn.prototype.attack = function() {
    // TODO: factor in weapon / buffs!
    return this.character.level + this.character.strength;
};

CharacterPawn.prototype.defense = function() {
    // TODO: factor in armor / buffs!
    return this.character.level + this.character.strength;
};

CharacterPawn.prototype.priority = function() {
    return this.character.level + this.character.level;
}

CharacterPawn.prototype.accuracy = function() {
    return this.character.level + this.character.strength + (this.character.luck / 2) + 50;
};

CharacterPawn.prototype.evade = function() {
    return this.character.level + this.character.agility + (this.character.luck / 2);
}

CharacterPawn.prototype.criticalChance = function() {
    return this.character.luck;
};

CharacterPawn.prototype.criticalMultiplier = function() {
    return 2;
};

CharacterPawn.prototype.takeDamage = function() {

};

SkillEffects = {
    "damage/melee": function(skill, user, targets) {
        var results = [],
            skill = _.extend({}, Skills["default"], skill),
            dice = Dice.parse(skill.power),
            d20 = Dice.parse("1d20"),
            d100 = Dice.parse("9*d10+1d10"),
            priority = user.priority() + d20.roll() + skill.priorityBoost;

        _(targets).each(function(target) {
            var damage = (target.defense() / user.attack()) * dice.value(),
                hitChance = (skill.accuracy * user.accuracy() - target.evade()),
                criticalChance = Math.max(2, user.criticalChance() * skill.criticalChance - target.luck()),
                isCritical, hasConnected;

            isCritical = d100.roll() <= criticalChance;
            hasConnected = isCritical || (d100.roll() <= hitChance);

            if (isCritical) {
                damage = damage * skill.criticalMultipler * user.criticalMultiplier();
            }

            damage = Math.round(damage);
        });

        return results;
    }
};

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
    "default": {
        "name": "Default",
        "power": 1,
        "accuracy": 1,
        "criticalChance": 1,
        "criticalMultiplier": 1,
        "priorityBoost": 0
    }
};