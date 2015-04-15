define(['jquery', 'knockout', 'knocksnap/models/cell.model', 'knocksnap/models/position.model'], function ($, ko, Cell, Position, FindNextPositionStrategy) {
    return function Grid(element, components, options) {
        var self = this;

        var parentElement = element;
        self.width = 0;
        self.height = 0;
        self.layout = undefined;
        var cellWidth = 0;
        var cellWidthPercent = 0;
        var cellHeight = 0;
        var spacing = 0;
        var spacingPercent = 0;

        var gridOptions = options;
        var GridLayoutStrategy;
        self.layout = undefined;
        self.components = [];
        $.each(components, function(index, item) {
            self.components.push(item);
        });

        /*** Public members ***/

        self.initialise = function (LayoutStrategy) {
            GridLayoutStrategy = LayoutStrategy;
            setUpGrid();
            initialiseDom();
        }

        self.handleResize = function () {
            // Check whether we need to adjust the number of cells
            var currentWidth = calculateNumberOfCells();
            if (currentWidth != self.width) {
                setUpGrid();
                updateDom();
            }
        }

        /*** Private members ***/

        function setUpGrid() {
            calculateGridParameters();
            eraseComponentPositions(self.components);
            var layoutStrategy = new GridLayoutStrategy({width: self.width, height: self.height}, self.components );
            self.layout = layoutStrategy.execute();
        }

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

        function eraseComponentPositions(components) {
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                component.deletePosition();
            }
        }

        function initialiseDom() {
            $(parentElement).empty();
            //gridLayoutStrategy.execute();
            $.each(self.components, function(index, item) {
                createComponentInDom(item);
                /*placeComponent(item);*/
                //addComponentToGrid(gridComponent);

                updateComponentInDom(item);
            });

            highlightEmptyCells();
        }

        function updateDom () {
            $('.ks-grid-cell').remove();
            //initialiseGrid();
            //gridLayoutStrategy.execute();

            $.each(self.components, function(index, item) {
                //placeComponent(item);
                //addComponentToGrid(gridComponent);
                updateComponentInDom(item);
            });
            highlightEmptyCells();
        }

        function highlightEmptyCells () {
            // Create empty divs
            // Make sure parent is position relative
            var gridElement = $(parentElement);

            gridElement.css('position', 'relative');
            for (var x=0; x<self.layout.cellRows(); x++) {
                for (var y=0; y<self.layout.cellCols(); y++) {
                    if (self.layout.cellAt(x, y).isEmpty()) {
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
                    var position = getElementPositionRelative(gridComponent.position());
                    positionElement(gridComponent, position);
                }
            }
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
