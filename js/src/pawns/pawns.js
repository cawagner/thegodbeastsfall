define([
    "pawns/character-pawn",
    "pawns/enemy-pawn"
], function(CharacterPawn, EnemyPawn) {
    return {
        CharacterPawn: CharacterPawn,
        EnemyPawn: EnemyPawn
    };
});