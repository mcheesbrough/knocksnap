define(['jquery'], function ($) {
    return function ComponentSizeLimits(minWidth, maxWidth, minHeight, maxHeight) {
        var self= this;
        self.minWidth = minWidth;
        self.maxWidth = maxWidth;
        self.minHeight = minHeight;
        self.maxHeight = maxHeight;

    }
});
