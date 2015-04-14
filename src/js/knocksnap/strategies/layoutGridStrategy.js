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
            // Now try shrinking and shuffling

            // Didn't work, so let's try finding the next possible position for any that didn't fit, but don't move any existing components
            if (tryFitUnplaced()) return;
            return;
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
                    };
                    var positionToTry = component.preferredPosition;
                    var spaceToLeft = layout.gapToLeftOfPosition(positionToTry.top, positionToTry.left, positionToTry.height);
                    if (leftShiftNeeded <= spaceToLeft) {
                        component.setPosition(new Position(positionToTry.top, positionToTry.left - leftShiftNeeded, positionToTry.width, positionToTry.height), layout);
                        continue;
                    }
                    // Move as much as we can and try and move component to left, recursively
                    var spaceNeeded = leftShiftNeeded - spaceToLeft;
                    var possibleContraction = positionToTry.width - component.sizeLimits.minWidth;
                    var allComponentsToLeftShifted = true;
                    while (spaceToLeft < leftShiftNeeded && allComponentsToLeftShifted) {
                        var componentsToLeft = layout.firstComponentToLeft(positionToTry.top, positionToTry.left, positionToTry.height);

                        allComponentsToLeftShifted = true;
                        for (var j = 0; j < componentsToLeft.length; j++) {
                            if (!shuffleComponentToLeft(componentsToLeft[j], spaceNeeded, possibleContraction)) {
                                allComponentsToLeftShifted = false;
                            }
                        }
                        spaceToLeft = layout.gapToLeftOfPosition(positionToTry.top, positionToTry.left, positionToTry.height);
                        spaceNeeded = leftShiftNeeded - spaceToLeft;
                    }

                    if (leftShiftNeeded <= spaceToLeft) {
                        component.setPosition(new Position(positionToTry.top, positionToTry.left - leftShiftNeeded, positionToTry.width, positionToTry.height), layout);
                    } else {
                        // Now we can try to squeeze this component
                        if (leftShiftNeeded <= spaceToLeft + possibleContraction) {
                            component.setPosition(new Position(positionToTry.top, positionToTry.left - spaceToLeft, positionToTry.width - leftShiftNeeded + spaceToLeft, positionToTry.height), layout);

                        } else { // Try to squeeze to left
                            for (var j = 0; j < componentsToLeft.length; j++) {
                                squeezeComponentToLeft(componentsToLeft[j], leftShiftNeeded - spaceToLeft - possibleContraction);
                            }
                            spaceToLeft = layout.gapToLeftOfPosition(positionToTry.top, positionToTry.left, positionToTry.height);
                            var spaceNeeded = leftShiftNeeded - spaceToLeft;

                            if (leftShiftNeeded <= spaceToLeft) {
                                component.setPosition(new Position(positionToTry.top, positionToTry.left - leftShiftNeeded, positionToTry.width, positionToTry.height), layout);
                            } else {
                                // And finally lets shuffle again
                                for (var j = 0; j < componentsToLeft.length; j++) {
                                    if (!shuffleComponentToLeft(componentsToLeft[j], spaceNeeded, leftShiftNeeded - spaceToLeft)) {
                                        allComponentsToLeftShifted = false;
                                    }
                                }
                                spaceToLeft = layout.gapToLeftOfPosition(positionToTry.top, positionToTry.left, positionToTry.height);

                                if (leftShiftNeeded <= spaceToLeft) {
                                    component.setPosition(new Position(positionToTry.top, positionToTry.left - leftShiftNeeded, positionToTry.width, positionToTry.height), layout);
                                } else if (leftShiftNeeded <= spaceToLeft + possibleContraction) {
                                    component.setPosition(new Position(positionToTry.top, positionToTry.left - spaceToLeft, positionToTry.width - leftShiftNeeded + spaceToLeft, positionToTry.height), layout);

                                } else {
                                    allComponentsPlaced = false;
                                }
                            }
                        }
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


        function shuffleComponentToLeft(component, shiftNeeded, possibleContractionOfPreviousComponents) {
            if (shiftNeeded <= 0) return 0;
            // Get next component
            var currentPosition = component.getPosition();
            var possibleContraction = possibleContractionOfPreviousComponents + (currentPosition.width - component.sizeLimits.minWidth);
            var spaceAvailable = layout.gapToLeftOfPosition(currentPosition.top, currentPosition.left, currentPosition.height);
            var allComponentsToLeftShifted = true;
            while (spaceAvailable < shiftNeeded && allComponentsToLeftShifted) {
                // Not enough space so find more components to left and recurse
                var componentsToLeft = layout.firstComponentToLeft(currentPosition.top, currentPosition.left, currentPosition.height);
                if (!componentsToLeft || componentsToLeft.length == 0) break; // No more components to shuffle

                var additionalSpaceNeeded = shiftNeeded - spaceAvailable;
                allComponentsToLeftShifted = true;

                for (var i = 0; i < componentsToLeft.length; i++) {
                    if (!shuffleComponentToLeft(componentsToLeft[i], additionalSpaceNeeded, possibleContraction)) {
                        allComponentsToLeftShifted = false;
                    }
                }
                // Recalculate space available and iterate again if necessary
                var spaceAvailable = layout.gapToLeftOfPosition(currentPosition.top, currentPosition.left, currentPosition.height);
            }

            // Do we have space or not
            if (spaceAvailable >= shiftNeeded) {
                component.move(shiftNeeded * -1, 0, layout);
                return true;
            }
            if (spaceAvailable + possibleContraction >= shiftNeeded) {
                if (spaceAvailable > 0) {
                    component.move(spaceAvailable * -1, 0, layout);
                    return true;
                }

            }
            return false;
        }

        function squeezeComponentToLeft(component, squeezeNeeded) {
            if (squeezeNeeded <= 0) return 0;
            // Get next component
            var currentPosition = component.getPosition();
            var possibleContraction = currentPosition.width - component.sizeLimits.minWidth;
            var smallestSqueeze = 0;
            if (possibleContraction < squeezeNeeded) {
                // Not enough squeezability so find more components to left and recurse
                var componentsToLeft = layout.firstComponentToLeft(currentPosition.top, currentPosition.left, currentPosition.height);
                if (componentsToLeft && componentsToLeft.length > 0) {
                    var additionalSqueezeNeeded = squeezeNeeded - possibleContraction;
                    for (var i = 0; i < componentsToLeft.length; i++) {
                        var squeeze = squeezeComponentToLeft(componentsToLeft[i], additionalSqueezeNeeded);
                        if ((squeeze > 0 && squeeze < smallestSqueeze) || smallestSqueeze == 0) {
                            smallestSqueeze = squeeze;
                        }
                    }
                }
            }
            // Do we have enough contraction or not
            if (possibleContraction + smallestSqueeze >= squeezeNeeded) {
                component.resize((squeezeNeeded - smallestSqueeze) * -1, 0, layout);
                return squeezeNeeded;
            }
            return false;
        }
    }


});
