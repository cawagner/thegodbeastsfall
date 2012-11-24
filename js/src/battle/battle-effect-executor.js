define(["underscore", "jquery"], function(_, $) {
    "use strict";

    var formatCondition = function(pawn) {
        var condition = "on death's door";
        var pct = pawn.hp() / pawn.maxHp();
        if (pct > 0.3)
            condition = "wounded";
        if (pct > 0.5)
            condition = "okay";
        if (pct > 0.9)
            condition = "unhurt";

        if (pawn.hpClass) {
            if (pawn.hpClass > 0.8) {
                condition += " and is strong";
            } else if (pawn.hpClass > 0.5) {
                condition += " and is average";
            } else {
                condition += " and is frail";
            }
        }
        return condition + ".";
    };

    var getDamageSound = function(targetType, isCritical) {
        if (targetType === 'enemy') {
            return isCritical ? "critical" : "hit";
        } else {
            return "playerhit";
        }
    };

    function BattleEffectExecutor() {

    }

    BattleEffectExecutor.prototype.damage = function(action, effect, state, battleState, msg) {
        var targetWasAlive = effect.target.isAlive();
        var sound = getDamageSound(effect.target.type, effect.critical);

        if (!targetWasAlive) {
            if (!effect.target.isHidden) {
                msg(effect.target.name + " was already gone!");
            }
            return;
        }

        state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.takeDamage(effect.amount);
            }
        });

        if (effect.missed) {
            state.enqueueFunc(battleState.displayMiss(effect.target));
            msg("...missed " + effect.target.name + "!", "miss");
        } else {
            if (effect.critical) {
                msg("A mighty blow!");
            }
            state.enqueueFunc(function() {
                $.publish("/sound/play", [sound]);
            })
            state.enqueueState(battleState.displayDamage(effect.target, "-"+effect.amount, effect.critical));
        }

        state.enqueueFunc(function() {
            if (targetWasAlive && !effect.target.isAlive()) {
                msg(effect.target.name + " falls!", 'endie');
                effect.target.isHidden = true;

                if (action.user.isDying) {
                    action.user.isDying = false;
                    action.user.restoreHp(action.user.luck());
                    msg("Talk about a comeback, " + action.user.name + "!");
                }
            }
        });
    }

    BattleEffectExecutor.prototype.heal = function(action, effect, state, battleState, msg) {
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            msg("It was too late for " + effect.target.name + "...");
            return;
        }

        state.enqueueFunc(function() {
            $.publish("/sound/play", ["heal"]);
        })

        state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.restoreHp(effect.amount);
            }
        });
        state.enqueueState(battleState.displayDamage(effect.target, "+"+effect.amount, effect.critical));
    };

    BattleEffectExecutor.prototype.buff = function(action, effect, state, battleState, msg) {
        var targetWasAlive = effect.target.isAlive();

        if (!targetWasAlive) {
            msg("It was too late for " + effect.target.name + "...");
            return;
        }

        state.enqueueFunc(function() {
            $.publish("/sound/play", ["heal"]);
        });

        state.enqueueFunc(function() {
            if (effect.amount > 0 && !isNaN(effect.amount)) {
                effect.target.addBuff(effect.stat, effect.amount, effect.duration);
            }
        });
        state.enqueueState(battleState.displayDamage(effect.target, "+" + effect.amount + "/" + effect.duration + " " + effect.stat));
    };

    return BattleEffectExecutor;
})