define(['jquery', 'knockout', 'text!components/componentTwo.html'], function ($, ko, htmlString) {

    function componentTwoViewModel(params) {

        return params;


    }

    // Return component definition
    return { viewModel: componentTwoViewModel, template: htmlString };
});