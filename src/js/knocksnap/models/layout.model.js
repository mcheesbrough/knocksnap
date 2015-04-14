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
            if (!pointIsInGrid(positionToTry.left, positionToTry.top)) return false;
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
            if (!self.canPlaceAt(position)) throw "Cannot place the component at this position"

            for (var x=positionToUse.left; x<positionToUse.left + positionToUse.width; x++) {
                for (var y=positionToUse.top; y<positionToUse.top + positionToUse.height; y++) {
                    if (!self.gridCells[x][y].isEmpty()) throw "Tried to put a component in an occupied cell";
                    self.gridCells[x][y].content = component;
                }
            }
        }

        self.removeComponent = function (component) {

            for (var x=0; x<width; x++) {
                for (var y=0; y<height; y++) {
                    if (self.gridCells[x][y].content === component) {
                        self.gridCells[x][y].content = undefined;
                    }
                }
            }
        }

        self.moveComponent = function (component, position) {
            var oldPosition = component.getPosition();
            self.removeComponent(component);
            try {
                self.addComponent(component, position);
            } catch (ex) {
                self.addComponent(component, oldPosition);
                throw "Could not move position";
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

            var positionToUse = !component.hasPosition() ? component.preferredPosition : component.getPosition();
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
            var startX = left > self.gridCells.length ? self.gridCells.length - 1 : left - 1;
            for (var x = startX; x >= 0 && !foundOccupiedCol; x--) {
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

        self.gapToLeftOfPosition = function (top, left, height) {
            var firstOccupiedColumnLeft = self.firstOccupiedColumnLeft(top, left, height);
            if (firstOccupiedColumnLeft == -1) return left;
            return left - firstOccupiedColumnLeft - 1;
        }

        self.firstComponentToLeft = function (top, left, height) {
            if (left == 0) return [];
            var foundOccupiedCol = false;
            var results = [];
            var startX = left > self.gridCells.length ? self.gridCells.length - 1 : left - 1;
            for (var x = startX; x >= 0 && !foundOccupiedCol; x--) {
                for (var y = top; y < top + height; y++) {
                    if (!self.gridCells[x][y].isEmpty()) {
                        foundOccupiedCol = true;
                        if (results.indexOf(self.gridCells[x][y].content) == -1) {
                            results.push(self.gridCells[x][y].content);
                        }
                    }
                }
                if (foundOccupiedCol) break;
            }
            return results;
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
