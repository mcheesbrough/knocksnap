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

        self.addComponent = function (componentName, position) {
            var positionToUse = position;

            for (var x=positionToUse.left; x<positionToUse.left + positionToUse.width; x++) {
                for (var y=positionToUse.top; y<positionToUse.top + positionToUse.height; y++) {
                    if (!gridCells[x][y].isEmpty()) throw "Tried to put a component in an occupied cell";
                    gridCells[x][y].content = componentName;
                }
            }
        }

        self.nearestSpaceAvailableToLeft = function (position) {

            // First look left
            var startColIndex = self.firstOccupiedColumnLeft(position.top, position.left, position.height);
            var endColIndex = self.firstOccupiedColumnRight(position.top, startColIndex, position.height);

            return endColIndex - startColIndex - 1;

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



    }

});
