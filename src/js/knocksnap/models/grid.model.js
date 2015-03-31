define(['jquery', 'knockout', 'knocksnap/models/cell.model', 'knocksnap/models/position.model'], function ($, ko, Cell, Position, FindNextPositionStrategy) {
    return function Grid(element, components, options) {
        var self = this;

        var parentElement = element;
        self.width = 0;
        self.height = 0;
        var cellWidth = 0;
        var cellWidthPercent = 0;
        var cellHeight = 0;
        var spacing = 0;
        var spacingPercent = 0;
        var gridCells = [];

        var gridOptions = options;
        var gridLayoutStrategy;
        self.components = [];
        $.each(components, function(index, item) {
            if (!item.preferredPosition) {
                item.preferredPosition = item.position;
            }
            self.components.push(item);
        });

        /*** Public members ***/

        self.initialise = function (layoutStrategy) {
            gridLayoutStrategy = layoutStrategy;
            calculateGridParameters();
            initialiseGrid();
            initialiseDom();
        }

        self.cellAt = function (x, y) {
            return gridCells[x][y];
        }
        self.cellRows = function () {
            return gridCells.length;
        }
        self.cellCols = function () {
            return gridCells[0].length;
        }

        self.handleResize = function () {
            // Check whether we need to adjust the number of cells
            var currentWidth = calculateNumberOfCells();
            if (currentWidth != self.width) {
                calculateGridParameters();
                updateDom();
            }
        }

        self.canPlaceComponent = function(position) {
            return canPlaceComponent(position);
        }

        self.addComponent = function (component) {
            addComponentToGrid(component);
        }

        /*** Private members ***/

        function calculateGridParameters () {
            var gridDivWidth = $(parentElement).width();
            self.width = calculateNumberOfCells();
            self.height = gridOptions.minRows;
            cellWidth = Math.floor((gridDivWidth - gridOptions.spacing * (self.width - 1)) / self.width);
            cellWidthPercent = (cellWidth / gridDivWidth).toFixed(4) * 100;
            cellHeight = gridOptions.cellHeight;
            spacing = gridOptions.spacing;
            spacingPercent = (gridOptions.spacing / gridDivWidth).toFixed(4) * 100;
        }

        function calculateNumberOfCells() {
            var gridDivWidth = $(parentElement).width();
            return Math.floor((gridDivWidth + gridOptions.spacing)/(gridOptions.minCellWidth + gridOptions.spacing));
        }


        function addComponentToGrid (component) {
            var positionToUse = component.position;

            for (var x=positionToUse.left; x<positionToUse.left + positionToUse.width; x++) {
                for (var y=positionToUse.top; y<positionToUse.top + positionToUse.height; y++) {
                    if (!gridCells[x][y].isEmpty()) throw "Tried to put a component in an occupied cell";
                    gridCells[x][y].content = component.component;
                }
            }
        }

        function initialiseGrid() {

            // Set up the grid
            gridCells = [];
            for (var x = 0; x < self.width; x++) {
                gridCells.push([]);
                for (var y = 0; y < self.height; y++) {
                    gridCells[x].push(new Cell());
                }
            }

        }

        function initialiseDom() {
            $(parentElement).empty();
            gridLayoutStrategy.execute();
            $.each(self.components, function(index, item) {
                createComponentInDom(item);
                /*placeComponent(item);*/
                addComponentToGrid(gridComponent);

                updateComponentInDom(gridComponent);
            });

            highlightEmptyCells();
        }

        function updateDom () {
            $('.ks-grid-cell').remove();
            initialiseGrid();
            gridLayoutStrategy.execute();

            $.each(self.components, function(index, item) {
                //placeComponent(item);
                addComponentToGrid(gridComponent);
                updateComponentInDom(gridComponent);
            });
            highlightEmptyCells();
        }

        function highlightEmptyCells () {
            // Create empty divs
            // Make sure parent is position relative
            var gridElement = $(parentElement);

            gridElement.css('position', 'relative');
            for (var x=0; x<gridCells.length; x++) {
                for (var y=0; y<gridCells[x].length; y++) {
                    if (gridCells[x][y].isEmpty()) {
                        var position = getElementPositionRelative(new Position(y, x, 1, 1));
                        var newElement = renderElement(position);
                        newElement.addClass('ks-grid-cell');

                    }
                }
            }
        }

        function createComponentInDom (gridComponent) {
            var isRegistered = ko.components.isRegistered(gridComponent.component);
            if (isRegistered) {
                var position = getElementPositionRelative(new Position(0,0,1,1));
                var newElement = renderElement(position);
                newElement.attr('data-bind', 'component: \'' + gridComponent.component + '\'');
                gridComponent.element = newElement;
            }
        }

        function updateComponentInDom (gridComponent) {
            var isRegistered = ko.components.isRegistered(gridComponent.component);
            if (isRegistered) {
                if (gridComponent.element) {
                    var position = getElementPositionRelative(gridComponent.position);
                    positionElement(gridComponent, position);
                }
            }
        }


/*        function placeComponent (gridComponent) {
            if (!isPossibleToPlaceComponent(gridComponent)) return;

            var preferredPosition = gridComponent.preferredPosition;
            var foundPosition = true;
            if (preferredPosition.top == undefined || preferredPosition.left == undefined) {
                foundPosition = gridLayoutStrategy.execute(gridComponent);
            }
            if (!canPlaceComponent(gridComponent.preferredPosition)) {
                foundPosition = gridLayoutStrategy.execute(gridComponent);
            } else {
                gridComponent.position = gridComponent.preferredPosition;
            }


            if (foundPosition) {
                addComponentToGrid(gridComponent);

                updateComponentInDom(gridComponent);
            }
        }*/

        function isPossibleToPlaceComponent(gridComponent) {
            return gridComponent.sizeLimits.minWidth <= self.width;
        }

        function canPlaceComponent(positionToTry) {
            if (positionToTry.left + positionToTry.width > gridCells.length) return false;
            if (positionToTry.top + positionToTry.height > gridCells[0].length) return false;

            for (var x = positionToTry.left; x < positionToTry.left + positionToTry.width; x++) {
                for (var y = positionToTry.top; y < positionToTry.top + positionToTry.height; y++) {
                    if (!gridCells[x][y].isEmpty()) {
                        return false;
                    }
                }
            }
            return true;
        }



        function getElementPositionAbsolute(position) {
            var top = position.top * cellHeight + position.top * spacing;
            var left = position.left * cellWidth + position.left * spacing;
            var width = position.width * cellWidth + (position.width -1 ) * spacing;
            var height = position.height * cellHeight + (position.height - 1) * spacing;

            return new Position(top + 'px', left + 'px', width + 'px', height + 'px');
        }

        function getElementPositionRelative(position) {
            var top = position.top * cellHeight + position.top * spacing;
            var left = position.left * cellWidthPercent + position.left * spacingPercent;
            var width = position.width * cellWidthPercent + (position.width -1 ) * spacingPercent;
            var height = position.height * cellHeight + (position.height - 1) * spacing;

            return new Position(top + 'px', left + '%', width + '%', height + 'px');
        }

        function renderElement(position) {

            var elementToAppend = $('<div style="position:absolute; width: ' + position.width + '; height: ' + position.height + '; top: ' + position.top + '; left: ' + position.left + ';"></div>');
            $(parentElement).append(elementToAppend);
            return elementToAppend;
        }

        function positionElement(gridComponent, position) {
            var element = gridComponent.element;
            element.css('top', position.top);
            element.css('left', position.left);
            element.css('width', position.width);
            element.css('height', position.height);
        }




    }

});
