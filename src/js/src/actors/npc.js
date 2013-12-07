define(['underscore', 'actors/actor', 'actors/npc-behaviors', 'direction'], function(_, Actor, npcBehaviors, direction) {
    "use strict";

    function EventArgs(options) {
        _(this).extend(options);
        this.defaultPrevented = false;
    }
    EventArgs.prototype.preventDefault = function() {
        this.defaultPrevented = true;
    };

    function Npc(properties) {
        _.defaults(properties, {
            "archetype": "bgobj",
            "behavior": "stationary"
        });

        Actor.call(this, properties.archetype);

        this.wander = npcBehaviors[properties.behavior](this);

        this.font = properties.font;

        if ("direction" in properties) {
            this.direction = direction.fromName(properties.direction);
        }

        this.onUpdate = function(timeScale) {
            this.wander();
        };

        this.runDialogue = function(dialogueName) {
            var self = this;
            var text = _(properties).valuesOfPropertiesStartingWith(dialogueName);

            if (text.length) {
                return this.say(text);
            } else {
                return {
                    then: function(fn) {
                        fn.call(self);
                    }
                };
            }
        };

        this.onTalk = function() {
            var actorSpokenTo = this;
            var e = new EventArgs({ sender: actorSpokenTo });

            this.trigger('beforeTalk', [e]);

            if (e.defaultPrevented)
                return;

            this.runDialogue("say").then(function() {
                var e = new EventArgs({ sender: actorSpokenTo });
                actorSpokenTo.trigger('afterTalk', [e]);
            });
        }
    };

    Npc.prototype = new Actor();

    return Npc;
});