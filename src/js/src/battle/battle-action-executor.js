define([
    "underscore",
    "radio",
    "states/composite-state",
    "battle/battle-message-state",
    "battle/effect-executor",
    "battle/battle-text-provider",
    "battle/skill-user",
    "item-effects",
    "sound"
], function(
    _,
    radio,
    CompositeState,
    BattleMessageState,
    EffectExecutor,
    textProvider,
    skillUser,
    itemEffects,
    sound
) {
    "use strict";

    var createBattleEffectExecutor = function(action, state, battleState) {
        return new EffectExecutor({
            action: action,
            state: state,
            displayDamage: battleState.displayDamage.bind(battleState),
            displayMessage: function(m) {
                return new BattleMessageState([m]);
            }
        });
    };

    var guardedState = function(action, battleState) {
        var state = new CompositeState();
        // exit the state if the user is dead, otherwise assess costs/cooldown
        state.enqueueFunc(function() {
            if (battleState.wonBattle() || !action.user.isAlive()) {
                state.done();
            } else {
                action.user.isActive = true;
            }
        });
        return state;
    };

    return {
        skill: function(action, battleState) {
            var state = guardedState(action, battleState);

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

            skillUser.useSkill(createBattleEffectExecutor(action, state, battleState), function() {
                if (action.user.type !== 'player') {
                    state.enqueueFunc(battleState.displayAttack(action.user));
                }
            });

            return state;
        },
        item: function(action, battleState) {
            var state = guardedState(action, battleState);

            state.enqueueState(new BattleMessageState([
                // TODO: message is not sufficient...
                action.user.name + " used " + action.item.name + "!"
            ]));
            return state;
        },
        flee: function(action, battleState) {
            var state = guardedState(action, battleState);
            state.enqueueState(new BattleMessageState([textProvider.getMessage("ranAway", { user: action.user.name })]));
            state.enqueueFunc(function() {
                radio("/battle/end").broadcast({ ran: true });
            });
            return state;
        },
        inspect: function(action, battleState) {
            var state = guardedState(action, battleState);
            var messages = [textProvider.getMessage("inspecting", { user: action.user.name })];

            var haveSeen = {};

            _(battleState.enemyPawns).each(function(enemy) {
                state.enqueueFunc(function() {
                    if (enemy.isAlive()) {
                        // TODO: shouldn't know about entity...
                        messages.push(enemy.family.name + "/" + enemy.name);
                        if (!haveSeen[enemy.name]) {
                            messages.push.apply(messages, enemy.entity.desc.split('|'));

                            (enemy.entity.weak || []).forEach(function(weak) {
                                messages.push(enemy.name + " fears " + weak + "!");
                            });

                            haveSeen[enemy.name] = true;
                        }
                        messages.push("Health: " + Math.round(enemy.hp() / enemy.maxHp() * 100) + "%");
                    }
                });
            });

            state.enqueueState(new BattleMessageState(messages));

            return state;
        },
        refresh: function(action, battleState) {
            var state = new CompositeState();
            var battleEffectExecutor = createBattleEffectExecutor(action, state, battleState);

            state.enqueueFunc(function() {
                battleEffectExecutor.enqueueEffects(action.effects);
            });
            return state;
        }
    };
});