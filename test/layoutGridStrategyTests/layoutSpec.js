define(['knocksnap/models/layout.model', 'knocksnap/models/gridComponent.model', 'knocksnap/models/position.model'], function(Layout, GridComponent, Position) {
    describe("A layout", function () {
        var componentId;

        beforeEach(function() {
            componentId = 0;
        });

        describe("when setting the position of a component", function () {
            it("the position is set and the component is added to the grid", function () {
                var components = [getAComponent(0, 1, 2, 2)];
                var layout = createLayoutWithComponents(10, 5);

                expect(layout.cellAt(0,0).content).not.toBeDefined();
                expect(layout.cellAt(1,0).content).not.toBeDefined();
                expect(layout.cellAt(2,0).content).not.toBeDefined();
                expect(layout.cellAt(3,0).content).not.toBeDefined();
                expect(layout.cellAt(0,1).content).not.toBeDefined();
                expect(layout.cellAt(1,1).content).not.toBeDefined();
                expect(layout.cellAt(2,1).content).not.toBeDefined();
                expect(layout.cellAt(3,1).content).not.toBeDefined();
                expect(layout.cellAt(2,0).content).not.toBeDefined();
                expect(layout.cellAt(2,1).content).not.toBeDefined();
                expect(layout.cellAt(2,2).content).not.toBeDefined();
                expect(layout.cellAt(2,3).content).not.toBeDefined();

                components[0].setPosition(components[0].preferredPosition, layout);

                expect(layout.cellAt(0,0).content).not.toBeDefined();
                expect(layout.cellAt(1,0).content).toBe(components[0]);
                expect(layout.cellAt(2,0).content).toBe(components[0]);
                expect(layout.cellAt(3,0).content).not.toBeDefined();
                expect(layout.cellAt(0,1).content).not.toBeDefined();
                expect(layout.cellAt(1,1).content).toBe(components[0]);
                expect(layout.cellAt(2,1).content).toBe(components[0]);
                expect(layout.cellAt(3,1).content).not.toBeDefined();
                expect(layout.cellAt(0,2).content).not.toBeDefined();
                expect(layout.cellAt(1,2).content).not.toBeDefined();
                expect(layout.cellAt(2,2).content).not.toBeDefined();
                expect(layout.cellAt(3,2).content).not.toBeDefined();
            });
        });

        describe("when moving a component", function () {
            it("the position is changed and the grid cells updated", function () {
                var components = [getAComponent(0, 1, 2, 2)];
                var layout = createLayoutWithComponents(10, 5);

                components[0].setPosition(components[0].preferredPosition, layout);

                expect(layout.cellAt(0,0).content).not.toBeDefined();
                expect(layout.cellAt(1,0).content).toBe(components[0]);
                expect(layout.cellAt(2,0).content).toBe(components[0]);
                expect(layout.cellAt(3,0).content).not.toBeDefined();
                expect(layout.cellAt(0,1).content).not.toBeDefined();
                expect(layout.cellAt(1,1).content).toBe(components[0]);
                expect(layout.cellAt(2,1).content).toBe(components[0]);
                expect(layout.cellAt(3,1).content).not.toBeDefined();
                expect(layout.cellAt(0,2).content).not.toBeDefined();
                expect(layout.cellAt(1,2).content).not.toBeDefined();
                expect(layout.cellAt(2,2).content).not.toBeDefined();
                expect(layout.cellAt(3,2).content).not.toBeDefined();


                components[0].move(-1, 1, layout);

                expect(components[0].getPosition()).toEqual(new Position(1,0,2,2));

                expect(layout.cellAt(0,0).content).not.toBeDefined();
                expect(layout.cellAt(1,0).content).not.toBeDefined();
                expect(layout.cellAt(2,0).content).not.toBeDefined();
                expect(layout.cellAt(3,0).content).not.toBeDefined();
                expect(layout.cellAt(0,1).content).toBe(components[0]);
                expect(layout.cellAt(1,1).content).toBe(components[0]);
                expect(layout.cellAt(2,1).content).not.toBeDefined();
                expect(layout.cellAt(3,1).content).not.toBeDefined();
                expect(layout.cellAt(0,2).content).toBe(components[0]);
                expect(layout.cellAt(1,2).content).toBe(components[0]);
                expect(layout.cellAt(2,2).content).not.toBeDefined();
                expect(layout.cellAt(3,2).content).not.toBeDefined();
            });

            it("if we try to move to an invalid position then the position is not changed and the grid stays the same", function () {
                var components = [getAComponent(0, 1, 2, 2)];
                var layout = createLayoutWithComponents(10, 5);

                components[0].setPosition(components[0].preferredPosition, layout);

                components[0].move(-2, 1, layout);

                expect(components[0].getPosition()).toEqual(new Position(0,1,2,2));

                expect(layout.cellAt(0,0).content).not.toBeDefined();
                expect(layout.cellAt(1,0).content).toBe(components[0]);
                expect(layout.cellAt(2,0).content).toBe(components[0]);
                expect(layout.cellAt(3,0).content).not.toBeDefined();
                expect(layout.cellAt(0,1).content).not.toBeDefined();
                expect(layout.cellAt(1,1).content).toBe(components[0]);
                expect(layout.cellAt(2,1).content).toBe(components[0]);
                expect(layout.cellAt(3,1).content).not.toBeDefined();
                expect(layout.cellAt(0,2).content).not.toBeDefined();
                expect(layout.cellAt(1,2).content).not.toBeDefined();
                expect(layout.cellAt(2,2).content).not.toBeDefined();
                expect(layout.cellAt(3,2).content).not.toBeDefined();
            });
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

        describe("when looking for the first component to the left", function () {
            it("will return empty list if there isn't one", function () {
                var layout = createLayoutWithComponents(10, 5);
                var result = layout.firstComponentToLeft(0,0,1);
                expect(result.length).toBe(0);
            });

            it("will return undefined if we start looking at column 2 and there are no components", function () {
                var layout = createLayoutWithComponents(10, 5);
                var result = layout.firstComponentToLeft(0,2,1);
                expect(result.length).toBe(0);
            });
            it("will return one component if we find one and only one", function () {
                var components = [getAComponent(0, 1, 1, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.firstComponentToLeft(0,4,1);
                expect(result.length).toBe(1);
                expect(result[0]).toBe(components[0]);
            });
            it("will return two components if we find them both at same column", function () {
                var components = [getAComponent(0, 1, 1, 1), getAComponent(2, 0, 2, 2)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.firstComponentToLeft(0,3,4);
                expect(result.length).toBe(2);
                expect(result).toEqual([components[0], components[1]]);
            });
        });

        describe("when finding out how far we need to shift left a component to make it fit in its preferred row", function () {
            it("if the component can be placed then space to move is 0", function () {

                var layout = createLayoutWithComponents(10, 5);
                var result = layout.leftShiftNeededToFit(getAComponent(0, 5, 4, 1));
                expect(result).toEqual(0);
            });
            it("if all the component falls outside the grid it will be the preferred width plus distance from right side of grid", function () {

                var layout = createLayoutWithComponents(10, 5);
                var result = layout.leftShiftNeededToFit(getAComponent(0, 11, 4, 1));
                expect(result).toEqual(5);
            });
            it("if the component is partially outside the grid then it will be the portion of width outside", function () {
                var layout = createLayoutWithComponents(10, 5);
                var result = layout.leftShiftNeededToFit(getAComponent(0, 8, 4, 1));
                expect(result).toEqual(2);
            });
            it("if the component is inside grid but another component is in the way then it will be the space needed to clear the component", function () {
                var components = [getAComponent(0, 6, 4, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.leftShiftNeededToFit(getAComponent(0,3,4,1));
                expect(result).toEqual(1);
            });
            it("if the component is inside grid but another component is in the way and there isn't room to the left of the component we still return the result", function () {
                var components = [getAComponent(0, 2, 4, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.leftShiftNeededToFit(getAComponent(0,3,4,1));
                expect(result).toEqual(5);
            });
        });

        xdescribe("when finding the gaps in a row", function () {
            it("will only return the gaps to the left of the position and identify the component on the left and right of the gap", function () {
                var components = [getAComponent(0, 5, 1, 1), getAComponent(0, 8, 1, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.findGapsToTheLeft(components[0]);
                expect(result).toEqual([{gap: 5, componentToLeft: undefined, componentToRight: components[0].id}]);
            });
            it("if there are two gaps to the left it will list them both", function () {
                var components = [getAComponent(0, 2, 2, 1), getAComponent(0, 7, 1, 1)];
                var layout = createLayoutWithComponents(10, 5, components);
                var result = layout.findGapsToTheLeft(components[1]);
                expect(result).toEqual([{gap: 2, componentToLeft: undefined, componentToRight: components[0].id}, {gap: 3, componentToLeft: components[0].id, componentToRight: components[0].id}]);
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