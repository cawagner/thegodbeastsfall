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
                var targetWasAlive = effect.target.isAlive();
                var sound;
                if (effect.target.type === 'enemy') {
                    sound = effect.critical ? "critical" : "hit";
                } else {
                    sound = "playerhit";
                }

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
                    state.enqueueState(battleState.displayDamage(effect.target, effect.amount, effect.critical));
                }

                state.enqueueFunc(function() {
                    if (targetWasAlive && !effect.target.isAlive()) {
                        msg(effect.target.name + " falls!", 'endie');
                        effect.target.isHidden = true;
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
            state.enqueueState(new BattleMessageState(["Defend isn't implemented yet, " + action.user.name + "!"]));
            return state;
        }
    }

});