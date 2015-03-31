define(['jquery', 'knockout', 'knocksnap/models/position.model', 'knocksnap/models/layout.model'], function ($, ko, Position, Layout) {
    return function LayoutGridStrategy(gridToLayout, componentsToLayout) {
        var self = this;
        var grid = new Layout(gridToLayout.width, gridToLayout.height);
        var components = componentsToLayout;

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
    }


});
