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

    character.mp = Math.max(0, character.intelligence - 5);
    character.maxMp = character.mp;

    character.xp = 0;
    character.xpNext = 100;

    return character;
}

Character.prototype.gainLevel = function(statToBoost) {
    var d6 = Dice.parse("d6");
    var hpGain = d6.roll() + Math.floor(Math.max(4, this.strength - 10) / 4);
    var mpGain = Math.ceil(Math.max(4, this.intelligence - 6) / 4);

    this.maxHp += hpGain;
    this.maxMp += mpGain;

    this.hp = this.maxHp;
    this.mp = this.maxMp;

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
console.log (GameState.instance);