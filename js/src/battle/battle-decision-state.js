define([
    "battle/battle-message-state",
    "battle/battle-menu-state"
], function(
    BattleMessageState,
    BattleMenuState
) {
    "use strict";

    return function BattleDecisionState(battleState) {
        this.start = function(commands) {
            console.log(commands);
            battleState.enqueueState(new BattleMessageState([
                "Held chants the spell of " + (commands[0].param || "") + "!"
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