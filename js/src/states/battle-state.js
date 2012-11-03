define([
    "underscore",
    "game-state",
    "pawns/pawns"
], function(
    _,
    gameState,
    pawns
) {
    function BattleState() {
        // var playerPawns = _(gameState.party).map(function(character) {
        //     return new pawns.CharacterPawn(character);
        // });

        this.update = function() {

        };

        this.draw = function() {
            Game.instance.graphics.setFillColorRGB(0, 0, 0);
            Game.instance.graphics.drawFilledRect(0, 0, 320, 240);
        };
    }

    return BattleState;
});