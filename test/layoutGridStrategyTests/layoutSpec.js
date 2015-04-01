define(['knocksnap/models/layout.model', 'knocksnap/models/gridComponent.model'], function(Layout, GridComponent) {
    describe("A layout", function () {
        var componentId;

        beforeEach(function() {
            componentId = 0;
        });

        describe("when looking for the first occupied column to the left", function () {
            it("will return -1 if we start looking at column 0", function () {
               // var components = [getAComponent(0, 0, 1, 1), getAComponent(0, 2, 1, 1)];
                var layout = createLayoutWithComponents(10, 5);
                var result = layout.firstOccupiedColumnLeft(0,0,1);
                expect(result).toEqual(-1);
            });

            it("will return -1 if we start looking at column 2 and there are no components", function () {
                var layout = createLayoutWithComponents(10, 5);
                var result = layout.firstOccupiedColumnLeft(0,2,1);
                expect(result).toEqual(-1);
            });
            it("will return 1 if we start looking at column 4 and there is a component in col 1", function () {
                var components = [getAComponent(0, 1, 1, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.firstOccupiedColumnLeft(0,4,1);
                expect(result).toEqual(1);
            });
            it("will return 1 if we start looking at column 4, this is a three row component and there is a component in col 1, row 2", function () {
                var components = [getAComponent(2, 1, 1, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.firstOccupiedColumnLeft(0,4,3);
                expect(result).toEqual(1);
            });
            it("will return -1 if we start looking at column 4, this is a two row component and there is a component in col 1, row 2", function () {
                var components = [getAComponent(2, 1, 1, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.firstOccupiedColumnLeft(0,4,2);
                expect(result).toEqual(-1);
            });
            it("will return 2 if we start looking at column 8, row 1, this is a two row component and there are components in col 4, row 0 and col 2, rows 1-3", function () {
                var components = [getAComponent(1, 2, 1, 3), getAComponent(0, 4, 1, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.firstOccupiedColumnLeft(1,8,2);
                expect(result).toEqual(2);
            });
        });

        function getAComponent(top, left, width, height, minWidth, maxWidth, minHeight, maxHeight) {
            var component = new GridComponent({component: 'component' + componentId,
                position: {top: top, left: left, width: width, height: height},
                sizeLimits: {minWidth: minWidth ? minWidth : 1, maxWidth: maxWidth ? maxWidth : width, minHeight: minHeight ? minHeight : 1, maxHeight: maxHeight ? maxHeight : height}});
            componentId++;
            return component;
        }

        function createLayoutWithComponents(width, height, components) {
            var layout = new Layout(10, 5);
            if (!components) return layout;
            for (var i = 0; i < components.length; i++) {
                var component = components[i];
                component.setPosition(component.preferredPosition, layout);
            }
            return layout;
        }
    });
});