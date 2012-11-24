define(["underscore", "jquery", "battle/battle-composite-state", "battle/battle-message-state", "battle/battle-effect-executor"], function(_, $, BattleCompositeState, BattleMessageState, BattleEffectExecutor) {


    return {
        skill: function(action, battleState) {
            var state = new BattleCompositeState();
            var msg = function(m, s) {
                state.enqueueState(new BattleMessageState([m], s));
            };
            var battleEffectExecutor = new BattleEffectExecutor();

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
                    battleEffectExecutor[effect.type](action, effect, state, battleState, msg);
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