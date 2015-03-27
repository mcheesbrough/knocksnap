define(['jquery', 'knockout', 'knocksnap/models/cell.model'], function ($, ko, Cell) {
    return function Grid(element, options) {
        var self = this;


        var gridDivWidth = $(element).width();

        self.element = element;
        self.width = Math.floor((gridDivWidth + options.spacing)/(options.minCellWidth + options.spacing));
        self.height = options.minRows;
        self.cellWidth = Math.floor((gridDivWidth - options.spacing * (self.width - 1)) / self.width);
        self.cellHeight = options.cellHeight;
        self.spacing = options.spacing;

        self.cells = [];
        setUpCells();

        self.highlightEmptyCells = function () {
            // Create empty divs
            // Make sure parent is position relative
            var gridElement = $(self.element);

            gridElement.css('position', 'relative');
            for (var x=0; x<self.cells.length; x++) {
                for (var y=0; y<self.cells[x].length; y++) {
                    if (self.cells[x][y].isEmpty()) {
                        var top = y * self.cellHeight + y * self.spacing;
                        var left = x * self.cellWidth + x * self.spacing;
                        $(self.element).append('<div class="ks-grid-cell" style="position:absolute; width: ' + self.cellWidth + 'px; height: ' + self.cellHeight + 'px; top: ' + top + 'px; left: ' + left + 'px;"></div>');
                    }
                }
            }
        }

        self.drawComponent = function (gridComponent) {
            var isRegistered = ko.components.isRegistered(gridComponent.component);
            if (isRegistered) {
                var top = gridComponent.position.top * self.cellHeight + gridComponent.position.top * self.spacing;
                var left = gridComponent.position.left * self.cellWidth + gridComponent.position.left * self.spacing;
                var width = gridComponent.position.width * self.cellWidth + (gridComponent.position.width -1 ) * self.spacing;
                var height = gridComponent.position.height * self.cellHeight + (gridComponent.position.height - 1) * self.spacing;
                $(self.element).append('<div style="position:absolute; width: ' + width + 'px; height: ' + height + 'px; top: ' + top + 'px; left: ' + left + 'px;" data-bind="component: \'' + gridComponent.component + '\'"></div>');
            }
        }

        self.addComponent = function(component) {
            var positionToUse = component.position;
            if (positionToUse.top == undefined || positionToUse.left == undefined) {
                positionToUse = findNextPosition(component.preferredDimensions);
            }

            if (positionToUse.left + positionToUse.width > self.cells.length) throw "Tried to add a component that goes outside right boundary";
            if (positionToUse.top + positionToUse.height > self.cells[0].length) throw "Tried to add a component that goes outside bottom boundary";

            for (var x=positionToUse.left; x<positionToUse.left + positionToUse.width; x++) {
                for (var y=positionToUse.top; y<positionToUse.top + positionToUse.height; y++) {
                    if (!self.cells[x][y].isEmpty()) throw "Tried to put a component in an occupied cell";
                    self.cells[x][y].content = component.component;
                }
            }

        }

        function setUpCells(gridSpec) {

            // Set up the grid
            self.cells = [];
            for (var x = 0; x < self.width; x++) {
                self.cells.push([]);
                for (var y = 0; y < self.height; y++) {
                    self.cells[x].push(new Cell());
                }
            }
        }

        function findNextPosition(preferredDimensions) {
            throw "findNextPosition not implemented"
        }

    }

});
