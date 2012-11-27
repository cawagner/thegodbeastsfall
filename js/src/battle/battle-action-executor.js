define([
    "underscore",
    "jquery",
    "battle/battle-composite-state",
    "battle/battle-message-state",
    "battle/battle-effect-executor",
    "battle/battle-text-provider"
], function(
    _,
    $,
    BattleCompositeState,
    BattleMessageState,
    BattleEffectExecutor,
    textProvider
) {
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

        return condition + ".";
    };

    return {
        skill: function(action, battleState) {
            var state = new BattleCompositeState();
            var battleEffectExecutor = new BattleEffectExecutor(action, battleState, state);

            // exit the state if the user is dead, otherwise assess costs/cooldown
            state.enqueueFunc(function() {
                if (!action.user.isAlive()) {
                    state.done();
                }
            });

            state.enqueueFunc(function() {
                // retarget if enemy died
                if (action.user.type === 'player' && action.skill.target === 'enemy') {
                    if (!action.targets[0].isAlive()) {
                        action.targets = [_(battleState.enemyPawns).filter(function(pawn) { return pawn.isAlive(); })[0]];
                        if (!action.targets[0]) {
                            action.targets = [];
                        }
                    }
                }

                if (!action.targets.length) {
                    return state.done();
                }
            });

            state.enqueueFunc(function() {
                var effects = action.skillEffect(action.skill, action.user, action.targets);

                if (action.user.type !== 'player') {
                    state.enqueueFunc(battleState.displayAttack(action.user));
                }

                battleEffectExecutor.msg(textProvider.getSkillText(action, effects));

                _(effects).each(function(effect) {
                    state.enqueueFunc(function() {
                        battleEffectExecutor[effect.type](effect);
                    });
                });

                state.enqueueFunc(function() {
                    action.user.useSkill(action.skill);
                });
            })

            return state;
        },
        flee: function(action) {
            var state = new BattleCompositeState();
            state.enqueueState(new BattleMessageState([textProvider.getMessage("ranAway", { user: action.user.name })]));
            state.enqueueFunc(function() {
                $.publish("/battle/end");
            });
            return state;
        },
        inspect: function(action, battleState) {
            var state = new BattleCompositeState();
            var messages = [textProvider.getMessage("inspecting", { user: action.user.name })];

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

            state.enqueueState(new BattleMessageState([
                textProvider.getMessage("defending", { user: action.user.name })
            ]));
            return state;
        },
        refresh: function(action, battleState) {
            var state = new BattleCompositeState();
            var battleEffectExecutor = new BattleEffectExecutor(action, battleState, state);

            state.enqueueFunc(function() {
                _(action.effects).each(function(effect) {
                    battleEffectExecutor[effect.type](effect);
                });
            });
            return state;
        }
    };
});