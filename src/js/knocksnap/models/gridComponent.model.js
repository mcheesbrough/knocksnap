/**
 * Created by martinc on 26/03/2015.
 */
define(['jquery', 'knocksnap/models/position.model', 'knocksnap/models/ComponentSizeLimits.model'], function ($, Position, SizeLimits) {

    function GridComponent(component) {
        var self = this;

        self.component = component.component;
        self.preferredPosition = new Position(component.position.top, component.position.left, component.position.width, component.position.height);
        var position = undefined;
        self.sizeLimits = new SizeLimits(component.sizeLimits.minWidth, component.sizeLimits.maxWidth, component.sizeLimits.minHeight, component.sizeLimits.maxHeight);

        self.setPosition = function (positionToSet, layout) {
            position = new Position(positionToSet.top, positionToSet.left, positionToSet.width, positionToSet.height);
            layout.addComponent(self, position);
        }
        self.getPosition = function () {
            return position;
        }
        self.hasPosition = function () {
            return position != undefined;
        }
    }
    GridComponent.sortByPreferredPosition = function (a, b) {
        var ap = a.preferredPosition;
        var bp = b.preferredPosition;
        return ap.top > bp.top ? 1 : (ap.top < bp.top ? -1 : ap.left - bp.left);
    }

    return GridComponent;

});