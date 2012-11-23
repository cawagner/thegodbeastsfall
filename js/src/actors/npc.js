define(['actors/actor', 'actors/npc-behaviors', 'direction'], function(Actor, npcBehaviors, direction) {
    "use strict";

    function Npc(properties) {
        var beforeTalkHandlers = [];

        _.defaults(properties, {
            "archetype": "oldman",
            "behavior": "wanderlust"
        });

        // bgobjs can only be stationary.
        if (properties.archetype === "bgobj") {
            properties.behavior = "stationary";
        }

        Actor.call(this, properties.archetype);

        this.wander = npcBehaviors[properties.behavior](this);

        if ("direction" in properties) {
            this.direction = direction.fromName(properties.direction);
        }

        this.onUpdate = function(timeScale) {
            this.wander();
        };

        this.addBeforeTalk = function(fn) {
            beforeTalkHandlers.push(fn);
        };

        this.onTalk = function() {
            var self = this;
            var text = [];

            _(beforeTalkHandlers).each(function(fn){
                if (fn.call(self) === false) {
                    return;
                }
            });

            // HACK: Don't hardcode 2/3... just take anything starting with say
            // in alphabetical order
            if (properties.say) {
                text.push(properties.say);
                if (properties.say2) {
                    text.push(properties.say2);
                }
                if (properties.say3) {
                    text.push(properties.say3);
                }
                this.say([{
                    speaker: properties.archetype,
                    text: text
                }]);
            }
        }
    };

    Npc.prototype = new Actor();

    return Npc;
});