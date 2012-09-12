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
    return this.character.level + this.character.agility;
};

CharacterPawn.prototype.accuracy = function() {
    return Math.floor(this.character.level + (3*(this.character.strength + this.character.agility) + this.character.luck) / 7 + 50);
};

CharacterPawn.prototype.evade = function() {
    return Math.floor(this.character.level + (3 * this.character.agility + this.character.luck) / 4);
};

CharacterPawn.prototype.force = function() {
    return Math.floor(this.character.level + (2 * this.character.intelligence + this.character.agility) / 3);
};

CharacterPawn.prototype.support = function() {
    return Math.floor(this.character.level + (2 * this.character.intelligence + this.character.luck) / 3);
};

CharacterPawn.prototype.resist = function() {
    return Math.floor(this.character.level + (this.character.intelligence + this.character.strength) / 2);
};

CharacterPawn.prototype.criticalChance = function() {
    return this.character.luck;
};

CharacterPawn.prototype.criticalMultiplier = function() {
    return 2;
};

CharacterPawn.prototype.takeDamage = function() {

};