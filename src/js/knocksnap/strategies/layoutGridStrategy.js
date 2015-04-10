define(['jquery', 'knockout', 'knocksnap/models/position.model', 'knocksnap/models/layout.model', 'knocksnap/models/gridComponent.model'], function ($, ko, Position, Layout, GridComponent) {
    return function LayoutGridStrategy(gridToLayout, componentsToLayout) {
        var self = this;
        var layout = new Layout(gridToLayout.width, gridToLayout.height);
        var components = componentsToLayout
        components.sort(GridComponent.sortByPreferredPosition);

        // Execute is called to lay the grid out as closely as possible to the preferred positions of all the components currently added to the grid
        // Will set the position property of each component to the new position to be used by the grid
        // The grid is then expected to update the dom and it's own array
        self.execute = function () {

            // First pass, see if each component can go into its preferred slot...
            if (tryPlacePreferred()) return;
            // Try and shuffle components into available space without shrinking
            if (shuffleAlong()) return;
            // Didn't work, so let's try finding the next possible position for any that didn't fit, but don't move any existing components
            if (tryFitUnplaced()) return;

            throw "Layout strategy not implemented";
        }

        function tryPlacePreferred() {
            var allComponentsPlaced = true;
            $.each(components, function (index, item) {
                if (layout.canPlaceAt(item.preferredPosition)) {
                    item.setPosition(item.preferredPosition, layout);
                } else {
                    allComponentsPlaced = false;
                }
            });
            return allComponentsPlaced;
        }

        // Look for opportunities to remove white space between components
        function shuffleAlong() {
            var allComponentsPlaced = true;

            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                if (!component.hasPosition()) {
                    // How much space do we need?
                    var leftShiftNeeded = layout.leftShiftNeededToFit(component);
                    if (component.preferredPosition.left - leftShiftNeeded < 0) {
                        allComponentsPlaced = false;
                        continue;
                    }; // Not enough space
                    var positionToTry = component.preferredPosition;
                    var spaceToLeft = layout.firstOccupiedColumnLeft(positionToTry.top, positionToTry.left, positionToTry.height);
                    if (leftShiftNeeded <= spaceToLeft) {
                        component.setPosition(new Position(positionToTry.top, positionToTry.left - leftShiftNeeded, positionToTry.width, positionToTry.height), layout);
                    }
                    // How much possible space is there based on positions of placed components and preferred widths of non-placed components

                    // Get components in same row(s) either because they are placed in row or because they are not placed but prefer to be in row
                    //var componentsInRow = layout.getComponentsInSameRow(component);
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
                        component.setPosition(newPosition, layout);
                    } else {
                        allComponentsPlaced = false
                    }
                }
            }
            return allComponentsPlaced;
        }

        function searchForNextPossiblePosition(component) {
            var maxX = layout.width - component.sizeLimits.minWidth;
            var maxY = layout.height + 1;
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
                    if (layout.canPlaceAt(positionToTry)) {
                        return positionToTry;
                    }
                }
            }
            return null;
        }



        function extraSpaceNeededForPosition(position) {

            var startColIndex = layout.firstOccupiedColumnLeft(position.top, position.left, position.height);
            var endColIndex = layout.firstOccupiedColumnRight(position.top, colIndex, position.height);

            availableWidth = endColIndex - startColIndex - 1;

        }
    }


});
