function Character(options) {
    var defaults = {
        strength: 10,
        agility: 10,
        intelligence: 10,
        luck: 10
    };

    _(this).chain().extend(options).defaults(defaults);
}

Character.create = function(options) {
    var character = new Character(options);

    character.level = 1;
    character.hp = 10 + character.strength;
    character.maxHp = character.hp;

    character.mp = character.intelligence;
    character.maxMp = character.mp;

    character.xp = 0;
    character.xpNext = 100;

    return character;
}

Character.prototype.gainLevel = function(statToBoost) {
    // TODO: extract these things!
    var hpGain = this.level + Math.floor(Math.max(2, this.strength - 10) / 2 + Math.random(0, this.luck / 4));
    var mpGain = Math.ceil(Math.max(4, this.intelligence - 6) / 4);

    this.maxHp += hpGain;
    this.maxMp += mpGain;

    this.hp = this.hpMax;
    this.mp = this.mpMax;

    if (statToBoost !== undefined) {
        this[statToBoost] += 1;
    }

    this.xpNext = (this.level + 1) * this.level * 100;
    this.level += 1;
};

function GameState() {
    this.party = [];

    this.newGame = function() {
        var held = Character.create({
            name: "Held",
            title: "Walking Sand",
            strength: 15,
            agility: 10,
            intelligence: 10,
            luck: 10
        });

        this.party = [held];

        goToMap('DesertPath');
    };
}

GameState.instance = new GameState();
