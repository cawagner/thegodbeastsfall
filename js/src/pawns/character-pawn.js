define(["pawns/pawn-base"], function(PawnBase) {
    "use strict";

    function CharacterPawn(character) {
        PawnBase.call(this, character);
        this.character = character;
    };

    CharacterPawn.prototype = new PawnBase();

    return CharacterPawn;
});