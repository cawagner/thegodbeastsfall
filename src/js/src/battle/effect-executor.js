define([
    "underscore",
    "radio",
    "battle/battle-text-provider",
    "battle/status-factory",
    "sound"
],
function(_, radio, textProvider, statusFactory, sound) {
    "use strict";

    function EffectExecutor(options) {
        this.state = options.state;
        this.action = options.action;
        this.displayMessage = options.displayMessage;
        this.displayDamage = options.displayDamage;
    }

    EffectExecutor.prototype.enqueueEffects = function(effects) {
        var self = this;
        effects.forEach(function(effect) {
            self.state.enqueueFunc(function() {
                self[effect.type](effect);
            });
        });
    };

    EffectExecutor.prototype.msg = function(m) {
        this.state.enqueueState(this.displayMessage(m));
    };

    EffectExecutor.prototype.snd = function(snd) {
        // TODO: prevent sound when effect didn't really happen
        if (snd) {
            this.state.enqueueFunc(function() { sound.playSound(snd); });
        }
    }

    EffectExecutor.prototype.damage = function(effect) {
        var self = this;

        var targetWasAlive = effect.target.isAlive() && !effect.target.isDying;

        if (!targetWasAlive) {
            return;
        }

        self.snd(effect.sound);

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
            self.state.enqueueState(self.displayDamage(effect.target, "-"+effect.amount, effect.critical));
            if (effect.critical) {
                self.msg(textProvider.getMessage("criticalHit"));
            }
        }

        self.state.enqueueFunc(function() {
            if (targetWasAlive && effect.target.isDying) {
                self.msg(effect.target.name + " was mortally wounded!");
            }
            if (targetWasAlive && !effect.target.isAlive() && !effect.target.hasFallen) {
                // hack :()
                effect.target.hasFallen = true;
                self.state.enqueueFunc(function() {
                    radio("/kill").broadcast(effect.target);
                    sound.playSound("endie");
                });
                self.msg(textProvider.getFallMessage(effect.target));

                if (self.action.user.isDying) {
                    self.action.user.isDying = false;
                    self.action.user.restoreHp(self.action.user.luck());
                    self.msg(textProvider.getMessage("secondWind", { user: self.action.user.name }));
                }
            }
        });
    };

    EffectExecutor.prototype.heal = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        if (effect.amount > 0) {
            self.snd(effect.sound);
            self.state.enqueueFunc(function() {
                effect.target.restoreHp(effect.amount);
            });
        }
        self.state.enqueueState(self.displayDamage(effect.target, "+"+effect.amount, effect.critical));
    };

    EffectExecutor.prototype.poison = function(effect) {
        this.msg(textProvider.getMessage("wasPoisoned", {
            target: effect.target.name
        }));

        this.snd(effect.sound);
        this.state.enqueueFunc(function() {
            effect.target.addStatus(statusFactory.createPoison(effect));
        });
    };

    EffectExecutor.prototype.removeStatus = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        self.snd(effect.sound);
        self.state.enqueueFunc(function() {
            var result = effect.target.removeStatus(effect.status);
            _(result).each(function(e) {
                self[e.type](e);
            });
        });
    };

    EffectExecutor.prototype.buff = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        self.snd(effect.sound);

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

    EffectExecutor.prototype.message = function(effect) {
        this.snd(effect.sound);
        this.msg(effect.text);
    };

    return EffectExecutor;
});