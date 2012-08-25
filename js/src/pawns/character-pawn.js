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