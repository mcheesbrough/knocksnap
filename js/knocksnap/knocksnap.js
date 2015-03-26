/**
 * Created by martin on 24/03/15.
 */
define(['jquery', 'knockout', 'knocksnap/models/options.model', 'knocksnap/models/gridComponent.model', 'knocksnap/models/grid.model'], function ($, ko, Options, GridComponent, Grid) {



    // custom ko binding handlers
    function saveGridComponents(parameters, gridComponents) {
        if (!parameters.components || parameters.components.constructor !== Array) throw 'No array of components provided for the grid';
        if (parameters.components.length > 0 && (!parameters.positions || parameters.positions.constructor !== Array)) throw 'No array of positions provided for the components';
        if (parameters.components.length !== parameters.positions.length) throw 'You must supply a position for each component, number of components does not match number of positions';
        var components = ko.unwrap(parameters.components);

        if (parameters.positions) {
            var positions = ko.unwrap(parameters.positions);
        }
        for (var i = 0; i < components.length; i++) {
            gridComponents.push(new GridComponent(components[i], positions[i]));
        }
    }

    ko.bindingHandlers.snapgrid = {
        init: function (element, valueAccessor) {

            var gridComponents = [];
            var parameters = ko.unwrap(valueAccessor());
            saveGridComponents(parameters, gridComponents);

            var gridOptions = new Options(parameters.options);

            var grid = new Grid(element, gridOptions);

            $.each(gridComponents, function (index, item) {
               grid.addComponent(item);
            });

            grid.highlightEmptyCells();

            ko.utils.domData.set(element, 'gridComponents', gridComponents);
            ko.utils.domData.set(element, 'gridOptions', gridOptions);

        },
        update: function (element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var parameters = valueAccessor();

        }
    };

});