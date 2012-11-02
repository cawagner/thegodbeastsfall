define(['actors/actor', 'actors/npc-behaviors'], function(Actor, npcBehaviors) {
    function Npc(properties) {
        _.defaults(properties, {
            "archetype": "oldman",
            "behavior": "wanderlust"
        });

        Actor.call(this, properties.archetype);

        this.wander = npcBehaviors[properties.behavior](this);

        if ("direction" in properties) {
            this.direction = direction.fromName(properties.direction);
        }

        this.onUpdate = function(timeScale) {
            this.wander();
        };
    };

    Npc.prototype = new Actor();

    return Npc;
});