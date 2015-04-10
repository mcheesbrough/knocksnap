define(['layoutGridStrategy', 'knocksnap/models/options.model', 'knocksnap/models/grid.model', 'knocksnap/models/position.model', 'knocksnap/models/gridComponent.model'], function(LayoutStrategy, Options, Grid, Position, GridComponent) {
    describe("For a new grid 10 x 5 wide, the layout strategy", function () {
        var componentId;
        var gridDimensions = {width: 10, height: 5};

        beforeEach(function() {
            componentId = 0;
        });

        describe("in the simplest case when components just fit", function () {
            it("puts two components that don't overlap at their preferred positions", function () {
                var components = [getAComponent(0,0,1,1), getAComponent(0,2,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();


                expect(components[0].getPosition()).toEqual(new Position(0, 0, 1, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 2, 1, 1));

            });
        });

        describe("in the case where components are on the same row with same heights", function () {

            it("puts a second component next to the first if they overlap and there is room", function () {
                var components = [getAComponent(0,0,3,2), getAComponent(0,1,1,1)];
                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 3, 1, 1));
            });

            it("puts a second component next to the first if they overlap ordered by preferred position", function () {
                var components = [getAComponent(0,1,1,1), getAComponent(0,0,3,2)];
                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 3, 1, 1));
            });

            it("puts a second component next to the first with its preferred width if they overlap and there is room", function () {
                var components = [getAComponent(0,0,3,2), getAComponent(0,1,2,1,1,3,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 3, 2, 1));

            });

            it("puts a second component next to the first if they overlap but shrinks if it hits end of row", function () {
                var components = [getAComponent(0,0,9,2,9,9,2,2), getAComponent(0,1,2,1,1,3,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 9, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 9, 1, 1));

            });

            it("puts a second component on a new row if it overlaps the first and if it won't fit on preferred row", function () {
                var components = [getAComponent(0,0,9,2,9,9,2,2), getAComponent(0,1,2,1,2,3,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 9, 2));
                expect(components[1].getPosition()).toEqual(new Position(2, 0, 2, 1));

            });

            it("puts a second component on a new row and after a third component if it overlaps the first and the third one is in the way", function () {
                var components = [getAComponent(0,0,9,2), getAComponent(0,1,2,1,2,3,1,1), getAComponent(2,1,3,2)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 9, 2));
                expect(components[1].getPosition()).toEqual(new Position(2, 4, 2, 1));
                expect(components[2].getPosition()).toEqual(new Position(2, 1, 3, 2));
            });

            describe("in cases where components won't fit in preferred positions but space is available to shuffle them along", function () {
                it("shuffles component left to stop going over the end of the row without shrinking components providing there is enough space", function () {
                    var components = [getAComponent(0,0,2,1), getAComponent(0,9,2,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 2, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 8, 2, 1));

                });
                it("shuffles the rightmost component left because it has most space to the left", function () {
                    var components = [getAComponent(0,0,2,1), getAComponent(0,3,2,1,1,2,1,1), getAComponent(0,9,2,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 2, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 3, 2, 1));
                    expect(components[2].getPosition()).toEqual(new Position(0, 8, 2, 1));

                });
                it("shuffles the middle component and the rightmost component to the left because there is more space to the left of the middle component", function () {
                    var components = [getAComponent(0,0,2,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,9,2,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 2, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 5, 2, 1));
                    expect(components[2].getPosition()).toEqual(new Position(0, 8, 2, 1));

                });
                it("shuffles all components to the left one space because they all have equal space to the left", function () {
                    var components = [getAComponent(0,1,4,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,9,2,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 5, 2, 1));
                    expect(components[2].getPosition()).toEqual(new Position(0, 8, 2, 1));

                });

                it("shuffles leftmost component twice because it has most space and middle component once because three spaces are needed", function () {
                    var components = [getAComponent(0,2,3,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,9,4,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 3, 2, 1));
                    expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

                });

                it("shuffles to use up all available space when there is only one gap and the preferred widths fit exactly", function () {
                    var components = [getAComponent(0,0,5,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,9,5,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 5, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 5, 5, 1));


                });

                it("shuffles to use up all available space because preferred widths fit exactly", function () {
                    var components = [getAComponent(0,2,3,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,9,5,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 3, 2, 1));
                    expect(components[2].getPosition()).toEqual(new Position(0, 5, 5, 1));

                });

                it("wraps rightmost component to new line because there isn't enough space and does no shuffle other components", function () {
                    var components = [getAComponent(0,2,3,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,9,6,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 2, 3, 1));
                    expect(components[1].getPosition()).toEqual(new Position(0, 6, 2, 1));
                    expect(components[2].getPosition()).toEqual(new Position(1, 0, 6, 1));

                });
            });

            xdescribe("in cases where components won't fit in preferred positions and there is no space to shuffle but components can be shrunk", function () {

                it("puts a second component next to first if they overlap and shrinks the first if it won't fit otherwise", function () {
                    var components = [getAComponent(0,0,9,2,7,9,2,2), getAComponent(0,1,2,1,2,3,1,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 8, 2));
                    expect(components[1].getPosition()).toEqual(new Position(0, 8, 2, 1));

                });

                it("fits three components onto a row by reducing their widths within their limits", function () {
                    var components = [getAComponent(0,0,5,2,3,7,2,2), getAComponent(0,4,4,1,2,5,1,1), getAComponent(0,8,5,1,3,6,1,1)];

                    var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                    layoutStrategy.execute();

                    expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 2));
                    expect(components[1].getPosition()).toEqual(new Position(0, 3, 3, 1));
                    expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

                });
            });

        });
        describe("in cases where the components are different heights but are in the same conceptual row", function () {
            it("fits two components onto a row but cannot fit the third so wraps to second row but alongside first component because it has depth 2", function () {
                var components = [getAComponent(0,0,5,2,4,7,2,2), getAComponent(0,5,4,1,4,5,1,1), getAComponent(0,9,5,1,3,6,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 5, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 5, 4, 1));
                expect(components[2].getPosition()).toEqual(new Position(1, 5, 5, 1));

            });
        });

        function getAComponent(top, left, width, height, minWidth, maxWidth, minHeight, maxHeight) {
            var component = new GridComponent({component: 'component' + componentId,
                position: {top: top, left: left, width: width, height: height},
                sizeLimits: {minWidth: minWidth ? minWidth : 1, maxWidth: maxWidth ? maxWidth : width, minHeight: minHeight ? minHeight : 1, maxHeight: maxHeight ? maxHeight : height}});
            componentId++;
            return component;
        }
    });
});