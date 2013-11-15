define([
    "skill-effects",
    "battle/battle-text-provider"
], function(
    skillEffects,
    textProvider
) {
    return {
        useSkill: function(effectExecutor, beforeMessage) {
            var state = effectExecutor.state;
            var action = effectExecutor.action;

            state.enqueueFunc(function() {
                var skillResult = skillEffects[action.skill.effect](action.skill, action.user, action.targets);

                if (beforeMessage) beforeMessage();

                effectExecutor.msg(textProvider.getSkillText(action, skillResult.effects));

                state.enqueueFunc(function() {
                    effectExecutor.enqueueEffects(skillResult.effects);
                });

                state.enqueueFunc(function() {
                    action.user.useSkill(action.skill);
                });
            });
        }
    }
});