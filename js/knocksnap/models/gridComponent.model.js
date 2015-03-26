/**
 * Created by martinc on 26/03/2015.
 */
define(['jquery'], function ($) {
    return function GridComponent(component, position) {
        var self = this;

        self.component = component;
        self.position = position;
    }
});