define(["underscore"], function(_) {
    function PawnBase(entity) {
        this.entity = entity;
        this.name = "<NULL>";
        if (entity !== undefined) {
            this.name = this.entity.name;
        }
        this.cooldowns = {};
        this.buffs = {};
        this.waits = [];
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
            return this.entity.strength + (this.buffs["strength"]||0);
        },
        agility: function() {
            return this.entity.agility + (this.buffs["agility"]||0);
        },
        intelligence: function() {
            return this.entity.intelligence;
        },
        luck: function() {
            return this.entity.luck;
        },
        attack: function() {
            // TODO: factor in weapon / buffs!
            return this.strength();
        },
        damageAbsorption: function() {
            // TODO: factor in armor / buffs!
            return Math.min(100, this.strength());
        },
        damageReduction: function() {
            return Math.floor(Math.max(0, this.strength() - 10));
        },
        priority: function() {
            return this.agility();
        },
        accuracy: function() {
            return Math.floor((this.strength() + this.agility() + this.luck()/2) + 50);
        },
        evade: function() {
            return Math.floor((3 * this.agility() + this.luck()) / 4);
        },
        force: function() {
            return Math.floor((2 * this.intelligence() + this.agility()) / 3);
        },
        support: function() {
            return Math.floor((2 * this.intelligence() + this.luck()) / 3);
        },
        resist: function() {
            return Math.floor((this.intelligence() + this.strength()) / 2);
        },
        criticalChance: function() {
            return this.luck();
        },
        criticalMultiplier: function() {
            return 2;
        },
        isAlive: function() {
            return this.hp() > 0;
        },
        refresh: function() {
            var wait, i, key;
            for (key in this.cooldowns) {
                this.cooldowns[key] = Math.max(0, this.cooldowns[key] - 1);
            }
            for (i = 0; i < this.waits.length; ++i) {
                wait = this.waits[i];
                if (wait.done) {
                    continue;
                }
                wait.wait--;
                if (wait.wait <= 0) {
                    if (wait.remove) {
                        wait.remove();
                    }
                    wait.done = true;
                }
            }
        },
        canUseSkill: function(skill) {
            var usable = true;
            if (skill.cooldown) {
                usable = usable && ((this.cooldowns[skill.name] || 0) === 0);
            }
            if (skill.mp) {
                usable = usable && (this.mp() >= skill.mp);
            }
            return usable;
        },
        useSkill: function(skill) {
            if (skill.cooldown) {
                this.cooldowns[skill.name] = skill.cooldown;
            }
            if (skill.mp) {
                this.consumeMp(skill.mp);
            }
        },
        addBuff: function(stat, amount, duration) {
            var self = this;
            this.buffs[stat] = (this.buffs[stat] || 0) + amount;
            if (duration) {
                this.waits.push({ wait: duration, remove: function() {
                    self.addBuff(stat, -amount);
                }});
            }
        }
    });

    return PawnBase;
});