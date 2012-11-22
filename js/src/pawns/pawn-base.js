define(["underscore"], function(_) {
    function PawnBase(entity) {
        this.entity = entity;
        this.name = "<NULL>";
        if (entity !== undefined) {
            this.name = this.entity.name;
        }
    };

    _(PawnBase.prototype).extend({
        hp: function() {
            return this.entity.hp;
        },
        maxHp: function() {
            return this.entity.maxHp;
        },
        mp: function() {
            return this.entity.mp;
        },
        maxMp: function() {
            return this.entity.maxMp;
        },
        strength: function() {
            return this.entity.strength;
        },
        agility: function() {
            return this.entity.agility;
        },
        intelligence: function() {
            return this.entity.intelligence;
        },
        luck: function() {
            return this.entity.luck;
        },
        attack: function() {
            // TODO: factor in weapon / buffs!
            return this.entity.strength;
        },
        damageAbsorption: function() {
            // TODO: factor in armor / buffs!
            return this.entity.strength;
        },
        damageReduction: function() {
            return Math.floor(Math.max(0, this.entity.strength - 10));
        },
        priority: function() {
            return this.entity.agility;
        },
        accuracy: function() {
            return Math.floor((3*(this.entity.strength + this.entity.agility) + this.entity.luck) / 6 + 57);
        },
        evade: function() {
            return Math.floor((3 * this.entity.agility + this.entity.luck) / 4);
        },
        force: function() {
            return Math.floor((2 * this.entity.intelligence + this.entity.agility) / 3);
        },
        support: function() {
            return Math.floor((2 * this.entity.intelligence + this.entity.luck) / 3);
        },
        resist: function() {
            return Math.floor((this.entity.intelligence + this.entity.strength) / 2);
        },
        criticalChance: function() {
            return this.entity.luck;
        },
        criticalMultiplier: function() {
            return 2;
        },
        takeDamage: function() {
        },
        isAlive: function() {
            return this.hp > 0;
        }
    });

    return PawnBase;
});