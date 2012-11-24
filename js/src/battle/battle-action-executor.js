define(["underscore", "jquery", "battle/battle-composite-state", "battle/battle-message-state"], function(_, $, BattleCompositeState, BattleMessageState) {
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

    var doDamage = function(action, effect, state, battleState, msg) {
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
    };

    var doHeal = function(action, effect, state, battleState, msg) {
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

    var doBuff = function(action, effect, state, battleState, msg) {
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

    return {
        skill: function(action, battleState) {
            var state = new BattleCompositeState();
            var msg = function(m, s) {
                state.enqueueState(new BattleMessageState([m], s));
            };

            // exit the state if the user is dead, otherwise assess costs/cooldown
            state.enqueueFunc(function() {
                if (!action.user.isAlive()) {
                    state.done();
                }
            });

            msg(action.user.name + " used " + action.skill.name + "!");

            _(action.effects).each(function(effect) {
                state.enqueueFunc(function() {
                    effect = effect();
                    if (effect.type === "damage") {
                        doDamage(action, effect, state, battleState, msg);
                    }
                    if (effect.type === "heal") {
                        doHeal(action, effect, state, battleState, msg);
                    }
                    if (effect.type === "buff") {
                        doBuff(action, effect, state, battleState, msg);
                    }
                });
            });

            state.enqueueFunc(function() {
                action.user.useSkill(action.skill);
            });

            return state;
        },
        flee: function(action) {
            var state = new BattleCompositeState();
            state.enqueueState(new BattleMessageState(["Run away!!!"]));
            state.enqueueFunc(function() {
                $.publish("/battle/end");
            });
            return state;
        },
        inspect: function(action, battleState) {
            var state = new BattleCompositeState();
            var messages = [action.user.name + " is sizing up the situation..."];

            _(battleState.enemyPawns).each(function(enemy) {
                if (enemy.isAlive()) {
                    // TODO: shouldn't know about entity...
                    messages.push(enemy.entity.family + "/" + enemy.name);
                    _(enemy.entity.desc.split('|')).each(function(splat) {
                        messages.push(splat);
                    });
                    messages.push("It looks " + formatCondition(enemy));
                }
            });

            state.enqueueState(new BattleMessageState(messages));

            return state;
        },
        defend: function(action) {
            var state = new BattleCompositeState();

            state.enqueueFunc(function() {
                action.user.addBuff("strength", 10000, 1);
            });

            state.enqueueState(new BattleMessageState([action.user.name + " is defending."]));
            return state;
        }
    }

});