define([
    "underscore",
    "radio",
    "states/composite-state",
    "battle/battle-message-state",
    "battle/battle-effect-executor",
    "battle/battle-text-provider",
    "skill-effects",
    "item-effects"
], function(
    _,
    radio,
    CompositeState,
    BattleMessageState,
    BattleEffectExecutor,
    textProvider,
    skillEffects,
    itemEffects
) {
    "use strict";

    var getDamageSound = function(targetType, isCritical) {
        if (targetType === 'enemy') {
            return isCritical ? "critical" : "hit";
        } else {
            return "playerhit";
        }
    };

    return {
        skill: function(action, battleState) {
            var state = new CompositeState();
            var battleEffectExecutor = new BattleEffectExecutor(action, state, battleState.displayDamage);

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
                        action.targets = [_(battleState.enemyPawns).find(function(pawn) { return pawn.isAlive(); })];
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
                var effects = skillEffects[action.skill.effect](action.skill, action.user, action.targets);

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
        item: function(action) {
            var state = new CompositeState();
            state.enqueueState(new BattleMessageState([
                // TODO: message is not sufficient...
                action.user.name + " used " + action.item.name + "!"
            ]));
            return state;
        },
        flee: function(action) {
            var state = new CompositeState();
            state.enqueueState(new BattleMessageState([textProvider.getMessage("ranAway", { user: action.user.name })]));
            state.enqueueFunc(function() {
                radio("/battle/end").broadcast({ ran: true });
            });
            return state;
        },
        inspect: function(action, battleState) {
            var state = new CompositeState();
            var messages = [textProvider.getMessage("inspecting", { user: action.user.name })];

            _(battleState.enemyPawns).each(function(enemy) {
                state.enqueueFunc(function() {
                    if (enemy.isAlive()) {
                        // TODO: shouldn't know about entity...
                        messages.push(enemy.family.name + "/" + enemy.name);
                        messages.push.apply(messages, enemy.entity.desc.split('|'));
                        messages.push("Health: " + Math.round(enemy.hp() / enemy.maxHp() * 100) + "%");
                    }
                });
            });

            state.enqueueState(new BattleMessageState(messages));

            return state;
        },
        refresh: function(action, battleState) {
            var state = new CompositeState();
            var battleEffectExecutor = new BattleEffectExecutor(action, state, battleState.displayDamage);

            state.enqueueFunc(function() {
                _(action.effects).each(function(effect) {
                    battleEffectExecutor[effect.type](effect);
                });
            });
            return state;
        }
    };
});