/**
 * Created by martinc on 26/03/2015.
 */
define(['jquery'], function ($) {
    return function options(optionsData) {
        var self = this;

        self.minCellWidth = 150;
        self.cellHeight = 150;
        self.minRows = 5;
        self.spacing = 1;

        if (optionsData) {
            if (optionsData.minCellWidth && !isNaN(optionsData.minCellWidth)) self.minCellWidth = optionsData.minCellWidth;
            if (optionsData.cellHeight && !isNaN(optionsData.cellHeight)) self.cellHeight = optionsData.cellHeight;
            if (optionsData.minRows && !isNaN(optionsData.minRows)) self.minRows = optionsData.minRows;
            if (optionsData.spacing && !isNaN(optionsData.spacing)) self.spacing = optionsData.spacing;
        }
    }
});