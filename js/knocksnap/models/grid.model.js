define(['jquery', 'knockout', 'knocksnap/models/cell.model', 'knocksnap/models/position.model'], function ($, ko, Cell, Position) {
    return function Grid(element, components, options) {
        var self = this;

        self.options = options;
        self.components = [];
        $.each(components, function(index, item) {
            self.components.push(item);
        });


        self.element = element;
        self.width = 0;
        self.height = 0;
        self.cellWidth = 0;
        self.cellWidthPercent = 0;
        self.cellHeight = 0;
        self.spacing = 0;
        self.spacingPercent = 0;
        calculateGridParameters();

        self.cells = [];
        setUpCells();



        self.draw = function() {
            $(element).empty();
            setUpCells();
            $.each(self.components, function(index, item) {
                self.drawComponent(item);
            });
            self.highlightEmptyCells();
        }

        self.highlightEmptyCells = function () {
            // Create empty divs
            // Make sure parent is position relative
            var gridElement = $(self.element);

            gridElement.css('position', 'relative');
            for (var x=0; x<self.cells.length; x++) {
                for (var y=0; y<self.cells[x].length; y++) {
                    if (self.cells[x][y].isEmpty()) {
                        var newElement = renderElementRelative(new Position(y, x, 1, 1));
                        newElement.addClass('ks-grid-cell');

                    }
                }
            }
        }

        self.drawComponent = function (gridComponent) {
            var isRegistered = ko.components.isRegistered(gridComponent.component);
            if (isRegistered) {
                var newElement = renderElementRelative(gridComponent.position);
                newElement.attr('data-bind', 'component: \'' + gridComponent.component + '\'');
            }
        }

        self.handleResize = function () {
            // Check whether we need to adjust the number of cells
            var currentWidth = calculateNumberOfCells();
            if (currentWidth != self.width) {
                calculateGridParameters();
                self.draw();
            }

        }

        function calculateGridParameters () {
            var gridDivWidth = $(element).width();
            self.width = calculateNumberOfCells();
            self.height = self.options.minRows;
            self.cellWidth = Math.floor((gridDivWidth - self.options.spacing * (self.width - 1)) / self.width);
            self.cellWidthPercent = (self.cellWidth / gridDivWidth).toFixed(4) * 100;
            self.cellHeight = self.options.cellHeight;
            self.spacing = self.options.spacing;
            self.spacingPercent = (self.options.spacing / gridDivWidth).toFixed(4) * 100;
        }

        function calculateNumberOfCells() {
            var gridDivWidth = $(element).width();
            return Math.floor((gridDivWidth + self.options.spacing)/(self.options.minCellWidth + self.options.spacing));
        }

        function renderElementAbsolute(position) {
            var top = position.top * self.cellHeight + position.top * self.spacing;
            var left = position.left * self.cellWidth + position.left * self.spacing;
            var width = position.width * self.cellWidth + (position.width -1 ) * self.spacing;
            var height = position.height * self.cellHeight + (position.height - 1) * self.spacing;

            return renderElement(top + 'px', left + 'px', width + 'px', height + 'px');
        }

        function renderElementRelative(position) {
            var top = position.top * self.cellHeight + position.top * self.spacing;
            var left = position.left * self.cellWidthPercent + position.left * self.spacingPercent;
            var width = position.width * self.cellWidthPercent + (position.width -1 ) * self.spacingPercent;
            var height = position.height * self.cellHeight + (position.height - 1) * self.spacing;

            return renderElement(top + 'px', left + '%', width + '%', height + 'px');

        }

        function renderElement(topString, leftString, widthString, heightString) {

            var elementToAppend = $('<div style="position:absolute; width: ' + widthString + '; height: ' + heightString + '; top: ' + topString + '; left: ' + leftString + ';"></div>');
            $(self.element).append(elementToAppend);
            return elementToAppend;

        }

        self.addComponent = function (component) {
            addComponent(component);
        }

        function addComponent (component) {


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


        function setUpCells() {

            // Set up the grid
            self.cells = [];
            for (var x = 0; x < self.width; x++) {
                self.cells.push([]);
                for (var y = 0; y < self.height; y++) {
                    self.cells[x].push(new Cell());
                }
            }

            $.each(self.components, function(index, item) {
                addComponent(item);
            });
        }

        function findNextPosition(preferredDimensions) {
            throw "findNextPosition not implemented"
        }

    }

});