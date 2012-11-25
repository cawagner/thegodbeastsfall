define(["underscore", "jquery", "battle/battle-message-state", "battle/battle-text-provider"], function(_, $, BattleMessageState, textProvider) {
    "use strict";

    var getDamageSound = function(targetType, isCritical) {
        if (targetType === 'enemy') {
            return isCritical ? "critical" : "hit";
        } else {
            return "playerhit";
        }
    };

    function BattleEffectExecutor(action, battleState, state) {
        this.state = state;
        this.action = action;
        this.battleState = battleState;
    }

    BattleEffectExecutor.prototype.msg = function(m, s) {
        this.state.enqueueState(new BattleMessageState([m], s));
    };

    BattleEffectExecutor.prototype.damage = function(effect) {
        var self = this;

        var targetWasAlive = effect.target.isAlive();
        var sound = getDamageSound(effect.target.type, effect.critical);

        if (!targetWasAlive) {
            if (!effect.target.isHidden) {
                self.msg(self.msg(textProvider.getMessage("negativeTargetGone", { target: effect.target.name })));
            }
            return;
        }

        self.state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.takeDamage(effect.amount);
            }
        });

        // TODO: move most of this text into the text provider...
        if (effect.missed) {
            self.state.enqueueFunc(self.battleState.displayMiss(effect.target));
            self.msg(textProvider.getMessage("missed", { target: effect.target.name }), "miss");
        } else {
            if (effect.critical) {
                self.msg(textProvider.getMessage("criticalHit"));
            }
            self.state.enqueueFunc(function() {
                $.publish("/sound/play", [sound]);
            })
            self.state.enqueueState(self.battleState.displayDamage(effect.target, "-"+effect.amount, effect.critical));
        }

        self.state.enqueueFunc(function() {
            if (targetWasAlive && !effect.target.isAlive()) {
                self.msg(textProvider.getFallMessage(effect.target), 'endie');
                effect.target.isHidden = true;

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
            $.publish("/sound/play", ["heal"]);
        });

        self.state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.restoreHp(effect.amount);
            }
        });
        self.state.enqueueState(self.battleState.displayDamage(effect.target, "+"+effect.amount, effect.critical));
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

        self.state.enqueueFunc(function() {
            $.publish("/sound/play", ["heal"]);
        });

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
        var buffDir = effect.amount < 0 ? "down" : "up";

        if (!targetWasAlive) {
            self.msg(textProvider.getMessage("positiveTargetGone", { target: effect.target.name }));
            return;
        }

        self.state.enqueueFunc(function() {
            $.publish("/sound/play", ["heal"]);
        });

        self.state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.addBuff(effect.stat, effect.amount, effect.duration);
            }
        });

        self.msg(effect.target.name + "'s " + effect.stat + " " + buffDir + " by " + Math.abs(effect.amount) + " for " + effect.duration + " rounds!");
    };

    BattleEffectExecutor.prototype.message = function(effect) {
        this.msg(effect.text);
    };

    return BattleEffectExecutor;
})