define(["underscore", "jquery", "battle/battle-message-state"], function(_, $, BattleMessageState) {
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

        console.log(this, effect);

        var targetWasAlive = effect.target.isAlive();
        var sound = getDamageSound(effect.target.type, effect.critical);

        if (!targetWasAlive) {
            if (!effect.target.isHidden) {
                self.msg(effect.target.name + " was already gone!");
            }
            return;
        }

        self.state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.takeDamage(effect.amount);
            }
        });

        if (effect.missed) {
            self.state.enqueueFunc(self.battleState.displayMiss(effect.target));
            self.msg("...missed " + effect.target.name + "!", "miss");
        } else {
            if (effect.critical) {
                self.msg("A mighty blow!");
            }
            self.state.enqueueFunc(function() {
                $.publish("/sound/play", [sound]);
            })
            self.state.enqueueState(self.battleState.displayDamage(effect.target, "-"+effect.amount, effect.critical));
        }

        self.state.enqueueFunc(function() {
            if (targetWasAlive && !effect.target.isAlive()) {
                self.msg(effect.target.name + " falls!", 'endie');
                effect.target.isHidden = true;

                if (self.action.user.isDying) {
                    self.action.user.isDying = false;
                    self.action.user.restoreHp(action.user.luck());
                    self.msg("Talk about a comeback, " + self.action.user.name + "!");
                }
            }
        });
    }

    BattleEffectExecutor.prototype.heal = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg("It was too late for " + effect.target.name + "...");
            return;
        }

        self.state.enqueueFunc(function() {
            $.publish("/sound/play", ["heal"]);
        })

        self.state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.restoreHp(effect.amount);
            }
        });
        self.state.enqueueState(self.battleState.displayDamage(effect.target, "+"+effect.amount, effect.critical));
    };

    BattleEffectExecutor.prototype.buff = function(effect) {
        var self = this;
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            self.msg("It was too late for " + effect.target.name + "...");
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
        self.state.enqueueState(self.battleState.displayDamage(effect.target, "+" + effect.amount + "/" + effect.duration + " " + effect.stat));
    };

    return BattleEffectExecutor;
})