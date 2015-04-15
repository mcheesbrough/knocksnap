define(['layoutGridStrategy', 'knocksnap/models/options.model', 'knocksnap/models/grid.model', 'knocksnap/models/position.model', 'knocksnap/models/gridComponent.model'], function(LayoutStrategy, Options, Grid, Position, GridComponent) {
    describe("For a new grid 10 x 10 wide, the layout strategy", function () {
        var componentId;
        var gridDimensions = {width: 10, height: 10};

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
                var components = [getAComponent(0, 0, 3, 2), getAComponent(0, 1, 1, 1)];
                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 1, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 1, 1, 1));
            });

            it("puts a second component next to the first if they overlap ordered by preferred position", function () {
                var components = [getAComponent(0, 1, 1, 1), getAComponent(0, 0, 3, 2)];
                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 1, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 1, 1, 1));
            });

            it("puts a second component next to the first with its preferred width if they overlap and there is room", function () {
                var components = [getAComponent(0, 0, 3, 2), getAComponent(0, 1, 2, 1, 1, 3, 1, 1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 1, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 1, 2, 1));

            });

            it("puts a second component next to the first if they overlap but shrinks if it hits end of row", function () {
                var components = [getAComponent(0, 0, 9, 2, 9, 9, 2, 2), getAComponent(0, 1, 2, 1, 1, 3, 1, 1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 9, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 9, 1, 1));

            });


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
            it("shuffles the middle component and the rightmost component to the left because there is no room to just move rightmost one", function () {
                var components = [getAComponent(0,0,2,1), getAComponent(0,6,3,1,1,2,1,1), getAComponent(0,9,2,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 2, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 5, 3, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 8, 2, 1));

            });
            it("shuffles all components to the left one space because they all need to move", function () {
                var components = [getAComponent(0,1,4,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,9,4,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 4, 2, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

            });

            it("shuffles rightmost component twice and other two once to make space", function () {
                var components = [getAComponent(0,1,4,1), getAComponent(0,6,2,1,1,2,1,1), getAComponent(0,10,4,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 4, 2, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

            });

            it("shuffles middle component twice and does not move leftmost one if there is enough room round middle one", function () {
                var components = [getAComponent(0,1,4,1), getAComponent(0,7,1,1,1,2,1,1), getAComponent(0,9,4,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 1, 4, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 5, 1, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

            });

            it("when there are two components to move in the middle they are both moved", function () {
                var components = [getAComponent(0,1,4,2), getAComponent(0,6,2,1,1,2,1,1), getAComponent(1,7,1,1), getAComponent(0,9,4,2)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 4, 2, 1));
                expect(components[2].getPosition()).toEqual(new Position(1, 5, 1, 1));
                expect(components[3].getPosition()).toEqual(new Position(0, 6, 4, 2));


            });

            it("when there are knock-on effects on components in different rows they are moved too", function() {
                var components = [getAComponent(0,1,4,2), getAComponent(0,6,2,1,1,2,1,1),
                    getAComponent(1,7,1,2), getAComponent(2,3,4,2), getAComponent(0,9,4,2)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 2));
                expect(components[1].getPosition()).toEqual(new Position(2, 1, 4, 2));
                expect(components[2].getPosition()).toEqual(new Position(0, 4, 2, 1));
                expect(components[3].getPosition()).toEqual(new Position(1, 5, 1, 2));
                expect(components[4].getPosition()).toEqual(new Position(0, 6, 4, 2));


            });

            it("when there are knock-on effects on components above and below they are moved too", function() {
                var components = [getAComponent(2,1,4,2), getAComponent(2,7,1,1,1,2,1,1),
                    getAComponent(3,7,1,2), getAComponent(0,3,3,2), getAComponent(1,6,1,2),
                    getAComponent(4,3,4,2), getAComponent(2,9,4,2)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(2, 0, 4, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 1, 3, 2));
                expect(components[2].getPosition()).toEqual(new Position(4, 1, 4, 2));
                expect(components[3].getPosition()).toEqual(new Position(1, 4, 1, 2));
                expect(components[4].getPosition()).toEqual(new Position(2, 5, 1, 1));
                expect(components[5].getPosition()).toEqual(new Position(3, 5, 1, 2));
                expect(components[6].getPosition()).toEqual(new Position(2, 6, 4, 2));

            });
        });

        describe("in cases where components won't fit in preferred positions and there is no space to shuffle but components can be shrunk", function () {

            it("puts a second component next to first by squeezing the second to fit", function () {
                var components = [getAComponent(0,0,9,2), getAComponent(0,9,2,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 9, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 9, 1, 1));

            });

            it("puts a second component next to first by squeezing the first when second cannot be squeezed", function () {
                var components = [getAComponent(0,0,9,2), getAComponent(0,9,2,1,2,2,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 8, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 8, 2, 1));

            });

            it("puts a second component next to first by squeezing both if can't squeeze second enough", function () {
                var components = [getAComponent(0,0,9,2), getAComponent(0,9,3,1,2,3,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 8, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 8, 2, 1));

            });

            it("puts three components in line, squeezing them from right to left", function () {
                var components = [getAComponent(0,0,4,1), getAComponent(0,4,4,1,2,4,1,1),
                    getAComponent(0,8,6,1,4,6,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 4, 2, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

            });

            it("puts three components in line, even when only one fits initially", function () {
                var components = [getAComponent(0,0,4,1), getAComponent(0,4,7,1,2,5,1,1),
                    getAComponent(0,11,6,1,4,6,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 4, 2, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

            });


            it("puts three components in line and squeezes them all if needed", function () {
                var components = [getAComponent(0,0,4,1), getAComponent(0,4,5,1,3,5,1,1),
                    getAComponent(0,9,6,1,4,6,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 3, 3, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

            });

            it("puts three components in line and squeezes left one if others cannot be squeezed", function () {
                var components = [getAComponent(0,0,4,1), getAComponent(0,4,5,1,5,5,1,1),
                    getAComponent(0,9,4,1,4,6,1,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 1, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 1, 5, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 6, 4, 1));

            });
        });

        describe("in cases where components won't fit in preferred positions and is space to shuffle and room to squeeze", function () {

            it("puts a second component next to first by moving first then squeezing", function () {
                var components = [getAComponent(0, 3, 5, 1), getAComponent(0, 9, 10, 1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 5, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 5, 5, 1));

            });

            it("puts a three components in a row by moving then squeezing", function () {
                var components = [getAComponent(0, 2, 4, 1), getAComponent(0, 7, 6, 1), getAComponent(0, 14, 5, 1, 2, 5, 1, 1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 1));
                expect(components[1].getPosition()).toEqual(new Position(0, 4, 4, 1));
                expect(components[2].getPosition()).toEqual(new Position(0, 8, 2, 1));

            });

            it("when there are knock-on effects on components above and below they are moved and squeezed too", function() {
                var components = [getAComponent(2,1,4,2), getAComponent(2,7,1,1,1,2,1,1),
                    getAComponent(3,7,3,2), getAComponent(0,3,3,2), getAComponent(1,6,1,2),
                    getAComponent(4,3,4,2), getAComponent(2,9,4,2,4,4,2,2)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(2, 0, 4, 2));
                expect(components[1].getPosition()).toEqual(new Position(0, 1, 3, 2));
                expect(components[2].getPosition()).toEqual(new Position(4, 0, 4, 2));
                expect(components[3].getPosition()).toEqual(new Position(1, 4, 1, 2));
                expect(components[4].getPosition()).toEqual(new Position(2, 5, 1, 1));
                expect(components[5].getPosition()).toEqual(new Position(3, 4, 2, 2));
                expect(components[6].getPosition()).toEqual(new Position(2, 6, 4, 2));

            });

            it("when there is a combination of shuffling and squeezing to do all works out just fine", function() {
                var components = [getAComponent(0,2,4,2), getAComponent(1,6,2,1),
                    getAComponent(2,3,6,1),
                    getAComponent(3,6,2,1), getAComponent(3,2,4,2),
                    getAComponent(0,9,5,4,5,5,4,4)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 4, 2));
                expect(components[1].getPosition()).toEqual(new Position(3, 0, 4, 2));
                expect(components[2].getPosition()).toEqual(new Position(2, 0, 5, 1));
                expect(components[3].getPosition()).toEqual(new Position(1, 4, 1, 1));
                expect(components[4].getPosition()).toEqual(new Position(3, 4, 1, 1));
                expect(components[5].getPosition()).toEqual(new Position(0, 5, 5, 4));
            });

            it("when there are two rows to fit", function() {
                var components = [getAComponent(0,0,4,2), getAComponent(1,4,2,1),
                    getAComponent(2,2,2,3),
                    getAComponent(3,5,1,1)];

                var layoutStrategy = new LayoutStrategy({width: 4, height: 5}, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 2));
                expect(components[1].getPosition()).toEqual(new Position(2, 1, 2, 3));
                expect(components[2].getPosition()).toEqual(new Position(1, 3, 1, 1));
                expect(components[3].getPosition()).toEqual(new Position(3, 3, 1, 1));
            });
        });

        describe("in cases where the components do not fit on the row however much we shuffle and squeeze", function () {

            it("puts a second component on a new row if it overlaps the first and if it won't fit on preferred row", function () {
                var components = [getAComponent(0, 0, 9, 2, 9, 9, 2, 2), getAComponent(0, 1, 2, 1, 2, 3, 1, 1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 9, 2));
                expect(components[1].getPosition()).toEqual(new Position(2, 0, 2, 1));

            });

            it("puts a second component on a new row and after a third component if it overlaps the first and the third one is in the way", function () {
                var components = [getAComponent(0, 0, 9, 2,9,9,2,2), getAComponent(0, 1, 2, 1, 2, 3, 1, 1), getAComponent(2, 1, 3, 2)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 9, 2));
                expect(components[1].getPosition()).toEqual(new Position(2, 4, 2, 1));
                expect(components[2].getPosition()).toEqual(new Position(2, 1, 3, 2));
            });

            it("when can't fit a component then wrap to next available space", function () {
                var components = [getAComponent(0,0,8,1,8,8,1,1), getAComponent(0,9,3,1,3,3,1,1), getAComponent(1,0,5,1)];

                var layoutStrategy = new LayoutStrategy(gridDimensions, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 8, 1));
                expect(components[1].getPosition()).toEqual(new Position(1, 0, 5, 1));
                expect(components[2].getPosition()).toEqual(new Position(1, 5, 3, 1));
            });

            it("when can't fit a component and are at the bttom of the grid then create a new row and wrap onto it", function () {
                var components = [getAComponent(0,0,4,2,3,4,2,2), getAComponent(2,0,4,3,4,4,3,3),
                    getAComponent(1,4,1,1), getAComponent(4,4,3,1,1,3,1,1)];

                var layoutStrategy = new LayoutStrategy({width: 4, height: 5}, components);
                layoutStrategy.execute();

                expect(components[0].getPosition()).toEqual(new Position(0, 0, 3, 2));
                expect(components[1].getPosition()).toEqual(new Position(2, 0, 4, 3));
                expect(components[2].getPosition()).toEqual(new Position(1, 3, 1, 1));
                expect(components[3].getPosition()).toEqual(new Position(5, 0, 3, 1));
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