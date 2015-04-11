define(['jquery', 'knockout', 'knocksnap/models/position.model', 'knocksnap/models/layout.model', 'knocksnap/models/gridComponent.model'], function ($, ko, Position, Layout, GridComponent) {
    return function LayoutGridStrategy(gridToLayout, componentsToLayout) {
        var self = this;
        var layout = new Layout(gridToLayout.width, gridToLayout.height);
        var components = componentsToLayout
        components.sort(GridComponent.sortByPreferredPositionYFirst);

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
                    }; // Would go out of bounds
                    var positionToTry = component.preferredPosition;
                    var spaceToLeft = layout.gapToLeftOfPosition(positionToTry.top, positionToTry.left, positionToTry.height);
                    if (leftShiftNeeded <= spaceToLeft) {
                        component.setPosition(new Position(positionToTry.top, positionToTry.left - leftShiftNeeded, positionToTry.width, positionToTry.height), layout);
                        continue;
                    }
                    // Move as much as we can and try and move component to left, recursively
                    var componentsToLeft = layout.firstComponentToLeft(positionToTry.top, positionToTry.left, positionToTry.height);
                    var spaceNeeded = leftShiftNeeded - spaceToLeft
                    var allComponentsToLeftShifted = true;
                    for (var j = 0; j < componentsToLeft.length; j++) {
                        if (!shuffleComponentToLeft(componentsToLeft[j], spaceNeeded)) {
                            allComponentsToLeftShifted = false;
                        }
                    }
                    if (allComponentsToLeftShifted) {
                        component.setPosition(new Position(positionToTry.top, positionToTry.left - leftShiftNeeded, positionToTry.width, positionToTry.height), layout);
                    } else {
                        allComponentsPlaced = false;
                    }
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

        function shuffleComponentToLeft(component, shiftNeeded) {
            if (shiftNeeded <= 0) return;
            // Get next component
            var currentPosition = component.getPosition();
            // TODO Fix this MART!!
            var spaceAvailable = layout.gapToLeftOfPosition(currentPosition.top, currentPosition.left, currentPosition.height);
            if (spaceAvailable >= shiftNeeded) {
                component.move(shiftNeeded * -1, 0, layout);
                return true;
            }
            // Not enough space so find more components to left and recurse
            var componentsToLeft = layout.firstComponentToLeft(currentPosition.top, currentPosition.left, currentPosition.height);
            if (!componentsToLeft || componentsToLeft.length == 0) return false; // No more components to shuffle

            var additionalSpaceNeeded = shiftNeeded - spaceAvailable;
            var allComponentsToLeftShifted = true;
            for (var i = 0; i < componentsToLeft.length; i++) {
                if (!shuffleComponentToLeft(componentsToLeft[i], additionalSpaceNeeded)) {
                    allComponentsToLeftShifted = false;
                }
            }
            if (allComponentsToLeftShifted) {
                component.move(shiftNeeded * -1, 0, layout);
                return true;
            }
            return false;
        }
    }


});
