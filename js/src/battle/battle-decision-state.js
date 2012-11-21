define([
    "battle/battle-message-state",
    "battle/battle-menu-state",
    "skill-effects"
], function(
    BattleMessageState,
    BattleMenuState,
    skillEffects
) {
    "use strict";

    return function BattleDecisionState(battleState) {
        this.start = function(commands) {
            console.log(commands);

            // TODO: alternative

            battleState.enqueueState(new BattleMessageState([
                "Held uses " + (commands[0].param || "") + "!"
            ]));
            battleState.enqueueState(new BattleMenuState(battleState));
            battleState.enqueueState(new BattleDecisionState(battleState));
        }
        this.update = function() {
            return true;
        };
        this.draw = function() {

        };
    };
});