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
    character.hp = 10 + this.strength;
    character.maxHp = this.hp;

    character.mp = this.intelligence;
    character.maxMp = this.mp;

    character.xp = 0;
    character.xpNext = 100;
}

Character.prototype.gainLevel = function(statToBoost) {
    // TODO: extract these things!
    var hpGain = this.level + Math.max(2, this.strength - 10) / 2 + Math.floor(Math.random(0, this.luck / 4));
    var mpGain = Math.ceil(Math.max(4, this.intelligence - 6) / 4);

    this.hpMax += hpGain;
    this.mpMax += mpGain;

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

        this.party.push(held);

        goToMap('DesertPath');
    };
}

GameState.instance = new GameState();
