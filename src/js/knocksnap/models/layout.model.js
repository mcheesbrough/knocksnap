define(['jquery', 'knockout', 'knocksnap/models/cell.model', 'knocksnap/models/position.model'], function ($, ko, Cell, Position) {
    return function Layout(width, height) {
        var self = this;


        self.width = width;
        self.height = height;
        self.gridCells = [];
        initialiseGrid();
        /*** Public members ***/

        self.cellAt = function (x, y) {
            return self.gridCells[x][y];
        }
        self.cellRows = function () {
            return self.gridCells.length;
        }
        self.cellCols = function () {
            return self.gridCells[0].length;
        }

        self.canPlaceAt = function(positionToTry) {
            if (positionToTry.left + positionToTry.width > self.gridCells.length) return false;
            if (positionToTry.top + positionToTry.height > self.gridCells[0].length) return false;

            for (var x = positionToTry.left; x < positionToTry.left + positionToTry.width; x++) {
                for (var y = positionToTry.top; y < positionToTry.top + positionToTry.height; y++) {
                    if (!self.gridCells[x][y].isEmpty()) {
                        return false;
                    }
                }
            }
            return true;
        }


        self.addComponent = function (component, position) {
            var positionToUse = position;
            if (positionToUse.left + positionToUse.width > self.width) throw 'Tried to place component outside right boundary';
            if (positionToUse.top + positionToUse.height > self.height) throw 'Tried to place component outside bottom boundary';

            for (var x=positionToUse.left; x<positionToUse.left + positionToUse.width; x++) {
                for (var y=positionToUse.top; y<positionToUse.top + positionToUse.height; y++) {
                    if (!self.gridCells[x][y].isEmpty()) throw "Tried to put a component in an occupied cell";
                    self.gridCells[x][y].content = component;
                }
            }
        }

        self.getComponentAtPoint = function (x, y) {
            if (!pointIsInGrid(x, y)) return undefined;

            return self.gridCells[x][y].content;
        }

        self.getComponentsInSameRow = function (component) {
            var firstRow = component.preferredPosition.top;
            var lastRow = component.preferredPosition.top + component.preferredPosition.height - 1;

            // Find the components that have part of them in line with the component in question
            var componentsInRow = [];
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (component.hasPosition() && positionLiesInRowRange(firstRow, lastRow, component.position)) {
                    componentsInRow.push(component);
                } else if (positionLiesInRowRange(firstRow, lastRow, component.preferredPosition)) {
                    componentsInRow.push(component);
                }
            }

            return componentsInRow;
        }


        self.leftShiftNeededToFit = function (component) {

            var positionToUse = component.position == undefined ? component.preferredPosition : component.position;
            if (self.canPlaceAt(positionToUse)) return 0;
            if (positionToUse.left + positionToUse.width > self.width) {
                return positionToUse.left + positionToUse.width - self.width;
            }
            var furthestLeft = -1;
            for (var x = positionToUse.left; x < positionToUse.left + positionToUse.width; x++) {
                for (var y = 0; y < positionToUse.top + positionToUse.height; y++) {
                    var componentAtPoint = self.getComponentAtPoint(x, y);
                    if (componentAtPoint) {
                        if (componentAtPoint.getPosition().left < furthestLeft || furthestLeft == -1) {
                            furthestLeft = componentAtPoint.getPosition().left;
                        }
                    }
                }
            }
            if (furthestLeft == -1) return 0; // Shouldn't happen given the canPlaceAt call above...

            // Note still return the shift to make even if it puts the component out of bounds
            return positionToUse.left + positionToUse.width - furthestLeft;

        }

        self.firstOccupiedColumnLeft = function (top, left, height) {
            if (left == 0) return -1;
            var foundOccupiedCol = false;
            for (var x = left - 1; x >= 0 && !foundOccupiedCol; x--) {
                for (var y = top; y < top + height && !foundOccupiedCol; y++) {
                    if (!self.gridCells[x][y].isEmpty()) {
                        foundOccupiedCol = true;
                        break;
                    }
                }
                if (foundOccupiedCol) break;
            }
            return x;
        }

        /*** Private members ***/

        function initialiseGrid() {

            // Set up the grid
            self.gridCells = [];
            for (var x = 0; x < self.width; x++) {
                self.gridCells.push([]);
                for (var y = 0; y < self.height; y++) {
                    self.gridCells[x].push(new Cell());
                }
            }

        }


        function positionLiesInRowRange(firstRow, lastRow, position) {
            return position.top <= lastRow && (position.top + position.height) >= firstRow;
        }
        function pointIsInGrid(x, y) {
            if (x < 0) return false;
            if (y < 0) return false;
            if (x > self.gridCells.length) return false;
            if (y > self.gridCells[0].length) return false;
            return true;
        }
    }

});
