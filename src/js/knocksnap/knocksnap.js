/**
 * Created by martin on 24/03/15.
 */
define(['jquery', 'knockout', 'knocksnap/models/options.model', 'knocksnap/models/gridComponent.model', 'knocksnap/models/grid.model', 'layoutGridStrategy'], function ($, ko, Options, GridComponent, Grid, LayoutGridStrategy) {



    // custom ko binding handlers
    function saveGridComponents(parameters, gridComponents) {
        if (!parameters.components || parameters.components.constructor !== Array) throw 'No array of components provided for the grid';
        var components = ko.unwrap(parameters.components);

        for (var i = 0; i < components.length; i++) {
            gridComponents.push(new GridComponent(components[i]));
        }
    }

    ko.bindingHandlers.snapgrid = {
        init: function (element, valueAccessor) {


            var gridComponents = [];
            var parameters = ko.unwrap(valueAccessor());
            saveGridComponents(parameters, gridComponents);

            var gridOptions = new Options(parameters.options);

            var grid = new Grid(element, gridComponents, gridOptions);
            grid.initialise(LayoutGridStrategy);
            $(window).resize( function () {
                grid.handleResize();
            });

            //grid.initialiseDom();

            ko.utils.domData.set(element, 'gridComponents', gridComponents);
            ko.utils.domData.set(element, 'gridOptions', gridOptions);

        },
        update: function (element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var parameters = valueAccessor();

        }
    };

});