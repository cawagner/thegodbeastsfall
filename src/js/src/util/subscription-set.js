define(["radio"], function(radio) {
    'use strict';
    return function() {
        var subscriptions = [];
        return {
            subscribe: function(channel, fn) {
                subscriptions.push([channel, fn]);
                radio(channel).subscribe(fn);
            },
            unsubscribe: function() {
                subscriptions.forEach(function(sub) {
                    radio(sub[0]).unsubscribe(sub[1]);
                });
            }
        };
    };
});