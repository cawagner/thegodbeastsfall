define(["underscore"], function(_) {
    "use strict";

    function PawnBase(entity) {
        this.entity = entity;
        this.name = "<NULL>";
        if (entity !== undefined) {
            this.name = this.entity.name;
        }
        this.cooldowns = {};
        this.buffs = {};
        this.statuses = [];
        this.scratch = {};
        this.display = {
            effects: []
        };
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
            return Math.floor((this.strength() + this.agility() + this.luck()/2) + 50 + (this.buffs["accuracy"]||0));
        },
        evade: function() {
            return Math.floor((2 * this.agility() + this.luck()) / 4 + (this.buffs["evade"]||0));
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
            return Math.floor(this.luck() / 2) + 1;
        },
        criticalMultiplier: function() {
            return 2;
        },
        isAlive: function() {
            return this.hp() > 0;
        },
        refresh: function() {
            var statuses, status, i, key, effects = [];
            this.scratch = {};
            for (key in this.cooldowns) {
                this.cooldowns[key] = Math.max(0, this.cooldowns[key] - 1);
            }
            for (i = 0; i < this.statuses.length; ++i) {
                status = this.statuses[i];
                if (status.done) {
                    continue;
                }
                status.wait--;
                effects.push.apply(effects, status.round() || []);
                if (status.wait <= 0) {
                    effects.push.apply(effects, this.removeStatus(status) || []);
                }
            }
            return effects;
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
                this.addStatus({ wait: duration, remove: function() {
                    self.addBuff(stat, -amount);
                }});
            }
        },
        addStatus: function(status) {
            _(status).defaults({
                remove: _.give([]),
                round: _.give([])
            });
            this.statuses.push(status);
        },
        removeStatus: function(statusToRemove) {
            var self = this, result = [], statuses;
            if (typeof statusToRemove === "string") {
                _(this.statuses).each(function(status) {
                    if (status.key === statusToRemove) {
                        result.push.apply(result, self.removeStatus(status) || []);
                    }
                });
            } else {
                if (!statusToRemove.done) {
                    statusToRemove.done = true;
                    return statusToRemove.remove();
                }
            }
            return result;
        },
        dealtDamage: function(amount) {

        }
    });

    return PawnBase;
});