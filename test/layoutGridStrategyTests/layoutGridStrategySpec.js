define(['findNextPositionStrategy', 'knocksnap/models/options.model', 'knocksnap/models/grid.model', 'knocksnap/models/position.model', 'knocksnap/models/gridComponent.model'], function(LayoutStrategy, Options, Grid, Position, GridComponent) {
    describe("For a new grid 10 x 5 wide, the layout strategy", function () {
        var componentId;
        var gridDimensions = {width: 10, height: 5};

        beforeEach(function() {
            componentId = 0;
        });

        it("puts two components that don't overlap at their preferred positions", function () {
            var components = [getAComponent(0,0,1,1), getAComponent(0,2,1,1)];

            var layoutStrategy = new LayoutStrategy(gridDimensions, components);
            layoutStrategy.execute();


            expect(components[0].getPosition()).toEqual(new Position(0, 0, 1, 1));
            expect(components[1].getPosition()).toEqual(new Position(0, 2, 1, 1));

        });

        it("puts a second component next to the first if they overlap", function () {
            var components = [getAComponent(0,0,3,2), getAComponent(0,1,1,1)];
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

        it("puts a second component next to the first if they overlap but reduces width if it hits end of row", function () {
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

        it("puts a second component next to first if they overlap and shrinks the first if it won't fit otherwise", function () {
            var components = [getAComponent(0,0,9,2,7,9,2,2), getAComponent(0,1,2,1,2,3,1,1)];

            var layoutStrategy = new LayoutStrategy(gridDimensions, components);
            layoutStrategy.execute();

            expect(components[0].getPosition()).toEqual(new Position(0, 0, 8, 2));
            expect(components[1].getPosition()).toEqual(new Position(0, 8, 2, 1));

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