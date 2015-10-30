define([
   'css!src/engine/components/datasheet/datasheet'
], function () {
    return function() { 
        this.init = function(element) {
            this.$element = $(element);
            this.$element[0].eControl = this;
            this.$element.addClass('engine-datasheet');
        };

        this.render = function() {
            if (!this._data) {
                console.log('Engine.Datasheet: no data, render stopped');
                return;
            }

            // find template row
            var $row_template = this.$element.find('.datasheet-row-template');

            // remove all data rows
            this.$element.find('.datasheet-row').remove();

            // go over rows in data and render table rows
            for (var row in this._data) {
                var $row = $row_template.clone()
                                        .removeClass('datasheet-row-template')
                                        .addClass('datasheet-row');
                // go over keys in row and fill td's
                for (key in this._data[row]) {
                    $row.find('[data-recordset-field=' + key + ']').html(this._data[row][key]);
                }
                this.$element.append($row);
            }

            this.$element.show();
        };

        this.setData = function(data, noRender) {
            this._data = data;

            if (!noRender) {
                this.render();
            }
        };
    }
});
