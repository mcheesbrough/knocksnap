define(['jquery'], function ($) {
    return function Cell(content) {
        var self = this;

        self.content = content;

        self.isEmpty = function() {
            return self.content == undefined;
        }
    }
});
