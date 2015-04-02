define(['jquery', 'knockout', 'knocksnap/models/cell.model', 'knocksnap/models/position.model'], function ($, ko, Cell, Position) {
    return function Layout(width, height) {
        var self = this;


        self.width = width;
        self.height = height;
        var gridCells = [];
        initialiseGrid();
        /*** Public members ***/

        self.cellAt = function (x, y) {
            return gridCells[x][y];
        }
        self.cellRows = function () {
            return gridCells.length;
        }
        self.cellCols = function () {
            return gridCells[0].length;
        }

        self.canPlaceAt = function(positionToTry) {
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

        self.addComponent = function (component, position) {
            var positionToUse = position;
            if (positionToUse.left + positionToUse.width > self.width) throw 'Tried to place component outside right boundary';
            if (positionToUse.top + positionToUse.height > self.height) throw 'Tried to place component outside bottom boundary';

            for (var x=positionToUse.left; x<positionToUse.left + positionToUse.width; x++) {
                for (var y=positionToUse.top; y<positionToUse.top + positionToUse.height; y++) {
                    if (!gridCells[x][y].isEmpty()) throw "Tried to put a component in an occupied cell";
                    gridCells[x][y].content = component;
                }
            }
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


        self.spaceNeededToFit = function (component) {
            var positionToUse = component.position == undefined ? component.preferredPosition : component.position;
            if (positionToUse.left + positionToUse.width > self.width) {
                return positionToUse.left + positionToUse.width - self.width;
            }

            throw "Not yet implemented";

        }

        self.firstOccupiedColumnLeft = function (top, left, height) {
            if (left == 0) return -1;
            var foundOccupiedCol = false;
            for (var x = left - 1; x >= 0 && !foundOccupiedCol; x--) {
                for (var y = top; y < top + height && !foundOccupiedCol; y++) {
                    if (!gridCells[x][y].isEmpty()) {
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
            gridCells = [];
            for (var x = 0; x < self.width; x++) {
                gridCells.push([]);
                for (var y = 0; y < self.height; y++) {
                    gridCells[x].push(new Cell());
                }
            }

        }


        function positionLiesInRowRange(firstRow, lastRow, position) {
            return position.top <= lastRow && (position.top + position.height) >= firstRow;
        }

    }

});
