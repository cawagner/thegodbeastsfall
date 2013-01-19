define(["underscore", "pubsub", "battle/battle-message-state", "battle/battle-text-provider"], function(_, pubsub, BattleMessageState, textProvider) {
    "use strict";

    var getDamageSound = function(targetType, isCritical) {
        if (targetType === 'enemy') {
            return isCritical ? "critical" : "hit";
        } else {
            return "playerhit";
        }
    };

    function BattleEffectExecutor(action, state, displayDamage) {
        this.state = state;
        this.action = action;
        this.displayDamage = displayDamage || function() {
            return {
                start: _.noop,
                update: function() { return true; },
                draw: _.noop
            };
        };
    }

    BattleEffectExecutor.prototype.msg = function(m, s) {
        if (s) {
            this.snd(s);
        }
        this.state.enqueueState(new BattleMessageState([m]));
    };

    BattleEffectExecutor.prototype.snd = function(sound) {
        this.state.enqueueFunc(function() {
            pubsub.publish("/sound/play", [sound]);
        });
    }

    BattleEffectExecutor.prototype.damage = function(effect) {
        var self = this;

        var targetWasAlive = effect.target.isAlive();
        var sound = getDamageSound(effect.target.type, effect.critical);

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
                pubsub.publish("/display/miss", [effect.target]);
            });
            self.msg(textProvider.getMessage("missed", { target: effect.target.name }), "miss");
        } else {
            if (effect.critical) {
                self.msg(textProvider.getMessage("criticalHit"));
            }
            self.snd(sound);
            self.state.enqueueState(self.displayDamage(effect.target, "-"+effect.amount, effect.critical));
        }

        self.state.enqueueFunc(function() {
            if (targetWasAlive && !effect.target.isAlive() && !effect.target.hasFallen) {
                // hack :()
                effect.target.hasFallen = true;
                self.state.enqueueFunc(function() {
                    pubsub.publish("/kill", [effect.target]);
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

        self.snd("heal");

        self.state.enqueueFunc(function() {
            if (effect.amount > 0) {
                effect.target.restoreHp(effect.amount);
            }
        });
        self.state.enqueueState(self.displayDamage(effect.target, "+"+effect.amount, effect.critical));
    };

    BattleEffectExecutor.prototype.poison = function(effect) {
        var self = this;

        self.msg(textProvider.getMessage("wasPoisoned", { target: effect.target.name }));
        self.state.enqueueFunc(function() {
            effect.target.addStatus({
                wait: 9999,
                round: function() {
                    var result = "hasTakenPoisonDamage" in effect.target.scratch ? [] : [{
                        type: "message",
                        text: textProvider.getMessage("poisonDamage", { target: effect.target.name })
                    }];
                    effect.target.scratch.hasTakenPoisonDamage = true;
                    result.push({
                        type: "damage",
                        amount: Math.ceil(effect.target.maxHp() / 30),
                        target: effect.target
                    });
                    return result;
                },
                remove: function() {
                    var result = "hasBeenCuredOfPoison" in effect.target.scratch ? [] : [{
                        type: "message",
                        text: textProvider.getMessage("poisonCured", { target: effect.target.name })
                    }];
                    effect.target.scratch.hasBeenCuredOfPoison = true;
                    return result;
                },
                key: "poison"
            })
        });
    };

    BattleEffectExecutor.prototype.removeStatus = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        self.snd("heal");

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

        self.snd("heal");

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