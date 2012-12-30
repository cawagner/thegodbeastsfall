define(["underscore", "skill-text-functions", "json!battle-messages.json"], function(_, skillTextFunctions, battleMessages) {
    "use strict";

    return {
        getSkillText: function(action, effects) {
            var text = battleMessages.defaultSkillUse, target = '<null>';
            if (action.skillId in skillTextFunctions) {
                text = skillTextFunctions[action.skillId](action, effects);
            } else if (action.skill.text) {
                text = action.skill.text; /*.template({
                    user: action.user.name,
                    target: effects.length && effects[0].target.name
                }));*/
            }
            if (effects.length && effects[0].target) {
                target = effects[0].target.name;
            }
            return _(text).template({
                user: action.user.name,
                target: target,
                skill: action.skill.name
            });
        },
        getFallMessage: function(pawn) {
            var text = battleMessages.defaultFall;
            return _(text).template({user: pawn.name});
        },
        getMessage: function(message, params) {
            var text = battleMessages[message];
            return _(text).template(params || {});
        },
        getAggressionText: function(pawns) {
            var names = _(pawns).chain().pluck("name").formatList().value();
            return [_("Aggressed by {{names}}!").template({names: names})];
        }
    }
});