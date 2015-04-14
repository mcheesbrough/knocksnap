/**
 * Created by martinc on 26/03/2015.
 */
define(['jquery', 'knocksnap/models/position.model', 'knocksnap/models/ComponentSizeLimits.model'], function ($, Position, SizeLimits) {

    function GridComponent(component) {
        var self = this;

        self.component = component.component;
        self.preferredPosition = new Position(component.position.top, component.position.left, component.position.width, component.position.height);
        var position = undefined;
        self.position = function() { return position; };
        self.sizeLimits = new SizeLimits(component.sizeLimits.minWidth, component.sizeLimits.maxWidth, component.sizeLimits.minHeight, component.sizeLimits.maxHeight);

        self.setPosition = function (positionToSet, layout) {
            try {
                layout.addComponent(self, positionToSet);

                position = new Position(positionToSet.top, positionToSet.left, positionToSet.width, positionToSet.height);
            } catch(ex) {

            }
        }
        self.getPosition = function () {
            return position;
        }
        self.hasPosition = function () {
            return position != undefined;
        }

        self.move = function (xOffset, yOffset, layout) {
            if (position == undefined) return; // Can't move a component that has not been positioned
            try {
                var newPosition = new Position(position.top + yOffset, position.left + xOffset, position.width, position.height);
                layout.moveComponent(self, newPosition);
                position = newPosition;
            } catch (ex) {
                return;
            }
        }

        self.resize = function (xChange, yChange, layout) {
            if (position == undefined) return; // Can't move a component that has not been positioned
            if (position.width + xChange > self.sizeLimits.maxWidth) return;
            if (position.width + xChange < self.sizeLimits.minWidth) return;
            if (position.height + yChange > self.sizeLimits.maxHeight) return;
            if (position.height + yChange < self.sizeLimits.minHeight) return;
            try {
                var newPosition = new Position(position.top, position.left, position.width + xChange, position.height + yChange);
                layout.moveComponent(self, newPosition);
                position = newPosition;
            } catch (ex) {
                return;
            }
        }
    }
    GridComponent.sortByPreferredPositionXFirst = function (a, b) {
        var ap = a.preferredPosition;
        var bp = b.preferredPosition;
        return ap.top > bp.top ? 1 : (ap.top < bp.top ? -1 : ap.left - bp.left);
    }
    GridComponent.sortByPreferredPositionYFirst = function (a, b) {
        var ap = a.preferredPosition;
        var bp = b.preferredPosition;
        return ap.left > bp.left ? 1 : (ap.left < bp.left ? -1 : ap.top - bp.top);
    }
    return GridComponent;

});