/**
 * Created by martin on 24/03/15.
 */
define(['jquery', 'knockout'], function ($, ko) {


    // custom ko binding handlers
    ko.bindingHandlers.transitionVisible = {
        init: function (element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var valueObject = valueAccessor();
            var visible = ko.unwrap(valueObject.visible);
            $(element).toggle(visible); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function (element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var valueObject = valueAccessor();
            var visible = ko.unwrap(valueObject.visible);
            var transition = ko.unwrap(valueObject.transition);

            switch (transition) {
                case 'fade':
                    visible ? $(element).fadeIn() : $(element).fadeOut();
                    break;
                case 'slide':
                    visible ? $(element).slideDown() : $(element).slideUp();
                    break;
                default:
                    visible ? $(element).fadeIn() : $(element).fadeOut();
                    break;
            }
        }


    };



});