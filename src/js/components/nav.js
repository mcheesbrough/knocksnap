define(['jquery', 'knockout', 'text!components/nav.html'], function ($, ko, htmlString) {

    function navViewModel(params) {
        var self = this;

    }

    // Return component definition
    return { viewModel: navViewModel, template: htmlString };
});