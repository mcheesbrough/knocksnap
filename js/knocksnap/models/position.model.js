define(['jquery'], function ($) {
    return function position(top, left, width, height) {
        var self = this;
        self.top = top;
        self.left = left;
        self.width = width;
        self.height = height;
    }
});
