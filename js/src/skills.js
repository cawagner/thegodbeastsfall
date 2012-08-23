function CharacterPawn(character) {
    this.character = character;
}

CharacterPawn.prototype.attack = function() {
    // TODO: factor in weapon / buffs!
    return this.character.level + this.character.strength;
};

CharacterPawn.prototype.defense = function() {
    // TODO: factor in armor / buffs!
    return this.character.level + this.character.strength;
};

CharacterPawn.prototype.takeDamage = function() {

};

SkillEffects = {
    "damage/melee": function(skill, user, targets) {
        var results = [];

        _(targets).each(function(target) {
            // TODO: random element... weapon?
            var damage = Math.floor((target.defense() / user.attack()) * skill.power);
        });
    }
};

Skills = {
    "slash": {
        "name": "Slash",
        "target": "enemy", // enemy, enemies, ally, allies
        "effect": "damage/melee",
        "power": 10
    },
    "hard": {
        "name": "Hard",
        "target": "enemy",
        "effect": "damage/melee",
        "power": 20,
        "cooldown": 1
    }
};