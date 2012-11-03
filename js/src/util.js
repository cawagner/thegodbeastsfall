define({
    pointInRect: function(point, rect) {
        return (
            (point.x >= rect.x && point.x <= rect.x + rect.width) &&
            (point.y >= rect.y && point.y <= rect.y + rect.height)
        );
    },
    getRequestAnimationFrame: function() {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) {
                    setTimeout(callback, 16);
                };
    }
});