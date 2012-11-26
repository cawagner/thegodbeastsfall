define([
    "pawns/character-pawn",
    "pawns/enemy-pawn"
], function(CharacterPawn, EnemyPawn) {
    "use strict";
    return {
        CharacterPawn: CharacterPawn,
        EnemyPawn: EnemyPawn
    };
});