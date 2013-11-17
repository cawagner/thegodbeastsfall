define(["underscore", "skill-text-functions", "json!battle-messages.json"], function(_, skillTextFunctions, battleMessages) {
    "use strict";

    return {
        getSkillText: function(action, effects) {
            var text = battleMessages.defaultSkillUse, target = '<null>';
            if (action.skill.id in skillTextFunctions) {
                text = skillTextFunctions[action.skill.id](action, effects);
            } else if (action.skill.id in battleMessages) {
                return battleMessages[action.skill.id];
            } else if (action.skill.text) {
                text = action.skill.text; /*.template({
                    user: action.user.name,
                    target: effects.length && effects[0].target.name
                }));*/
            }
            if (!effects)
                debugger;
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
            var leader = Math.floor(pawns.length / 2);
            var cohort = "";
            if (pawns.length > 1) {
                cohort = pawns.length === 2 ? " and cohort" : " and cohorts";
            }

            return [_("Aggressed by {{leader}}{{cohort}}!").template({leader: pawns[leader].name, cohort: cohort})];
        },
        getBuffText: function(params) {
            return _("{{target}}'s {{stat}} {{buffDir}} by {{amount}} for {{duration}} rounds!").template(params);
        }
    }
});