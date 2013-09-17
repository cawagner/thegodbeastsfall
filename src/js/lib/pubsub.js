/*

    jQuery pub/sub plugin by Peter Higgins (dante@dojotoolkit.org)

    Loosely based on Dojo publish/subscribe API, limited in scope. Rewritten blindly.

    Modified by Chris Wagner to remove jQuery use and to be a requirejs module.

    Original is (c) Dojo Foundation 2004-2010. Released under either AFL or new BSD, see:
    http://dojofoundation.org/license for more information.

*/

define(function() {
    "use strict";

    // the topic/subscription hash
    var cache = {};

    var d = {};

    d.publish = function(/* String */topic, /* Array? */args){
        // summary:
        //      Publish some data on a named topic.
        // topic: String
        //      The channel to publish on
        // args: Array?
        //      The data to publish. Each array item is converted into an ordered
        //      arguments on the subscribed functions.
        //
        // example:
        //      Publish stuff on '/some/topic'. Anything subscribed will be called
        //      with a function signature like: function(a,b,c){ ... }
        //
        //  |       pubsub.publish("/some/topic", ["a","b","c"]);
        var entry = cache[topic], count = entry && entry.length, i;
        for (i = 0; i < count; ++i) {
            entry[i].apply(null, args || []);
        }
    };

    d.set = function() {
        var subscriptions = [];
        return {
            subscribe: function(topic, callback) {
                subscriptions.push(d.subscribe(topic, callback));
            },
            unsubscribe: function() {
                _(subscriptions).each(function(subscription) {
                    d.unsubscribe(subscription);
                })
            }
        };
    };

    d.subscribe = function(/* String */topic, /* Function */callback){
        // summary:
        //      Register a callback on a named topic.
        // topic: String
        //      The channel to subscribe to
        // callback: Function
        //      The handler event. Anytime something is .publish'ed on a
        //      subscribed channel, the callback will be called with the
        //      published array as ordered arguments.
        //
        // returns: Array
        //      A handle which can be used to unsubscribe this particular subscription.
        //
        // example:
        //  |   pubsub.subscribe("/some/topic", function(a, b, c){ /* handle data */ });
        //
        cache[topic] = cache[topic] || [];
        cache[topic].push(callback);
        return [topic, callback]; // Array
    };

    d.unsubscribe = function(/* Array */handle){
        // summary:
        //      Disconnect a subscribed function for a topic.
        // handle: Array
        //      The return value from a .subscribe call.
        // example:
        //  |   var handle = pubsub.subscribe("/something", function(){});
        //  |   pubsub.unsubscribe(handle);

        var topic = handle[0],
            entry = cache[topic],
            count = entry && entry.length,
            i;
        for (i = 0; i < count; ++i) {
            if (entry[i] === handle[1]) {
                entry.splice(i, 1);
            }
        }
    };

    d.subscribeOnce = function(topic, callback) {
        var token;
        var wrappedCallback = function() {
            callback.call(null, arguments);
            d.unsubscribe(token);
        };
        token = d.subscribe(topic, wrappedCallback);
    };

    return d;
});