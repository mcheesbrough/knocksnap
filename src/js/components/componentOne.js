define(['jquery', 'knockout', 'text!components/componentOne.html'], function ($, ko, htmlString) {

    function componentOneViewModel(params) {
        var self = this;

        return params;
    }

    // Return component definition
    return { viewModel: componentOneViewModel, template: htmlString };
});