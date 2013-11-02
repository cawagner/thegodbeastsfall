define([
    "underscore",
    "radio",
    "battle/battle-message-state",
    "battle/battle-text-provider",
    "battle/status-factory",
    "sound"
],
function(_, radio, BattleMessageState, textProvider, statusFactory, sound) {
    "use strict";

    function BattleEffectExecutor(action, state, displayDamage) {
        this.state = state;
        this.action = action;
        this.displayDamage = displayDamage || function() {
            return {
                start: function() {},
                update: function() { return true; },
                draw: function() {}
            };
        };
    }

    BattleEffectExecutor.prototype.enqueueEffects = function(effects) {
        var self = this;
        effects.forEach(function(effect) {
            self.state.enqueueFunc(function() {
                if (effect.sound) {
                    sound.playSound(effect.sound);
                }
                self[effect.type](effect);
            });
        });
    };

    BattleEffectExecutor.prototype.msg = function(m) {
        this.state.enqueueState(new BattleMessageState([m]));
    };

    BattleEffectExecutor.prototype.damage = function(effect) {
        var self = this;

        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            return;
        }

        self.state.enqueueFunc(function() {
            if (effect.amount > 0) {
                if (self.action.user) {
                    self.action.user.dealtDamage(Math.min(effect.amount, effect.target.hp()), effect.damageType);
                }
                effect.target.takeDamage(effect.amount);
            }
        });

        // TODO: move most of this text into the text provider...
        if (effect.missed) {
            self.state.enqueueFunc(function() {
                radio("/display/miss").broadcast(effect.target);
            });
            self.msg(textProvider.getMessage("missed", { target: effect.target.name }), "miss");
        } else {
            if (effect.critical) {
                self.msg(textProvider.getMessage("criticalHit"));
            }
            self.state.enqueueState(self.displayDamage(effect.target, "-"+effect.amount, effect.critical));
        }

        self.state.enqueueFunc(function() {
            if (targetWasAlive && !effect.target.isAlive() && !effect.target.hasFallen) {
                // hack :()
                effect.target.hasFallen = true;
                self.state.enqueueFunc(function() {
                    radio("/kill").broadcast(effect.target);
                });
                self.msg(textProvider.getFallMessage(effect.target), 'endie');

                if (self.action.user.isDying) {
                    self.action.user.isDying = false;
                    self.action.user.restoreHp(self.action.user.luck());
                    self.msg(textProvider.getMessage("secondWind", { user: self.action.user.name }));
                }
            }
        });
    };

    BattleEffectExecutor.prototype.heal = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        self.state.enqueueFunc(function() {
            if (effect.amount > 0) {
                effect.target.restoreHp(effect.amount);
            }
        });
        self.state.enqueueState(self.displayDamage(effect.target, "+"+effect.amount, effect.critical));
    };

    BattleEffectExecutor.prototype.poison = function(effect) {
        this.msg(textProvider.getMessage("wasPoisoned", {
            target: effect.target.name
        }));

        this.state.enqueueFunc(function() {
            effect.target.addStatus(statusFactory.createPoison(effect));
        });
    };

    BattleEffectExecutor.prototype.removeStatus = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        self.state.enqueueFunc(function() {
            var result = effect.target.removeStatus(effect.status);
            _(result).each(function(e) {
                self[e.type](e);
            });
        });
    };

    BattleEffectExecutor.prototype.buff = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        self.state.enqueueFunc(function() {
            if (effect.amount !== 0) {
                effect.target.addBuff(effect.stat, effect.amount, effect.duration);
            }

            if (!effect.skill.suppressDefaultText) {
                self.msg(textProvider.getBuffText({
                    target: effect.target.name,
                    stat: effect.stat,
                    buffDir: effect.amount < 0 ? "down" : "up",
                    amount: Math.abs(effect.amount),
                    duration: effect.duration
                }));
            }
        });
    };

    BattleEffectExecutor.prototype.message = function(effect) {
        this.msg(effect.text);
    };

    return BattleEffectExecutor;
});