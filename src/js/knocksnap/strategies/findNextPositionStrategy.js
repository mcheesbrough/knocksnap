define(['jquery', 'knockout', 'knocksnap/models/position.model', 'knocksnap/models/layout.model'], function ($, ko, Position, Layout) {
    return function LayoutGridStrategy(gridToLayout, componentsToLayout) {
        var self = this;
        var grid = new Layout(gridToLayout.width, gridToLayout.height);
        var components = componentsToLayout
        components.sort(function (a, b) {
            var ap = a.preferredPosition;
            var bp = b.preferredPosition;
            return ap.top > bp.top ? 1 : (ap.top < bp.top ? -1 : ap.left - bp.left);
        });

        // Execute is called to lay the grid out as closely as possible to the preferred positions of all the components currently added to the grid
        // Will set the position property of each component to the new position to be used by the grid
        // The grid is then expected to update the dom and it's own array
        self.execute = function () {

            // First pass, see if each component can go into its preferred slot...
            if (tryPlacePreferred()) return;
            // Didn't work, so let's try finding the next possible position for any that didn't fit, but don't move any existing components
            if (tryFitUnplaced()) return;

            throw "Layout strategy not implemented";
        }

        function tryPlacePreferred() {
            var allComponentsPlaced = true;
            $.each(components, function (index, item) {
                if (grid.canPlaceAt(item.preferredPosition)) {
                    item.setPosition(item.preferredPosition, grid);
                } else {
                    allComponentsPlaced = false;
                }
            });
            return allComponentsPlaced;
        }

        // Look for opportunities to remove white space between components
        function shuffleUp() {
            var allComponentsPlaced = true;

            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (!component.hasPosition()) {
                    // How much space do we need?

                    // How much possible space is there based on positions of placed components and preferred widths of non-placed components

                    // Get components in same row(s) either because they are placed in row or because they are not placed but prefer to be in row
                    var componentsInRow = getComponentsInSameRow(component);
                    // Now iterate over components in row and shuffle if possible

                }

            }
            return allComponentsPlaced;
        }

        function tryFitUnplaced() {
            var allComponentsPlaced = true;
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (!component.hasPosition()) {
                    var newPosition = searchForNextPossiblePosition(component);
                    if (newPosition) {
                        component.setPosition(newPosition, grid);
                    } else {
                        allComponentsPlaced = false
                    }
                }
            }
            return allComponentsPlaced;
        }

        function searchForNextPossiblePosition(component) {
            var maxX = grid.width - component.sizeLimits.minWidth;
            var maxY = grid.height + 1;
            var startX = component.preferredPosition && component.preferredPosition.left ? component.preferredPosition.left : 0;
            var startY = component.preferredPosition && component.preferredPosition.top ? component.preferredPosition.top : 0;
            for (var y=startY; y<=maxY; y++) {
                for (var x=startX; x<=maxX; x++) {
                    var successfulPosition = tryPosition(component, y, x);
                    if (successfulPosition != null) {
                        return successfulPosition;
                    }
                }
                startX = 0;
            }
            return false;
        }

        function tryPosition(component, top, left) {

            for (var widthToTry=component.preferredPosition.width; widthToTry >= component.sizeLimits.minWidth; widthToTry--) {
                for (var heightToTry=component.preferredPosition.height; heightToTry >= component.sizeLimits.minHeight; heightToTry--) {
                    var positionToTry = new Position(top, left, widthToTry, heightToTry);
                    if (grid.canPlaceAt(positionToTry)) {
                        return positionToTry;
                    }
                }
            }
            return null;
        }

        function getComponentsInSameRow(component) {
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

        function positionLiesInRowRange(firstRow, lastRow, position) {
            return position.top <= lastRow && (position.top + position.height) >= firstRow;
        }

        function extraSpaceNeededForPosition(position) {

            var startColIndex = grid.firstOccupiedColumnLeft(position.top, position.left, position.height);
            var endColIndex = grid.firstOccupiedColumnRight(position.top, colIndex, position.height);

            availableWidth = endColIndex - startColIndex - 1;

        }
    }


});
