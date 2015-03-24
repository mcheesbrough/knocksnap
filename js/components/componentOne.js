define(['jquery', 'knockout', 'knockstrap', 'helpers', 'text!components/componentOne.html'], function ($, ko, ks, helpers, htmlString) {

    function componentOneViewModel(params) {
        var self = this;

        return params;
    }

    // Return component definition
    return { viewModel: componentOneViewModel, template: htmlString };
});