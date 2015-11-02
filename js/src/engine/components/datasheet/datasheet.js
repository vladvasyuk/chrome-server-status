define([
   'css!src/engine/components/datasheet/datasheet'
], function () {
    return function() {
        /**
         * Init component
         * @param  {object} element
         */
        this.init = function(element) {
            this._data = {};
            this._validators = {};
            this.$element = $(element);
            this.$element[0].eControl = this;
            this.$element.addClass('engine-datasheet');
        };

        /**
         * Renders datasheet body from this._data information
         */
        this.render = function() {
            var self = this;
            if (!this._data) {
                console.log('Engine.Datasheet: no data, render stopped');
                return;
            }

            // find template rows

            /** @type {jQuery} template for common row */
            var $row_template = this.$element.find('.datasheet-row-template');
            
            /** @type {jQuery} template for editing row */
            var $edit_template = this.$element.find('.datasheet-edit-template');

            // remove all data and edit rows
            this.$element.find('.datasheet-row').remove();
            this.$element.find('.datasheet-edit').remove();

            // go over rows in data and render table rows
            for (var row_key in this._data) {
                if (this._data[row_key]['_draft']) {
                    // drafts render with edit template
                    var $row = this._renderEditRow($edit_template, row_key);
                } else {
                    // common rows with row template
                    var $row = this._renderRow($row_template, row_key);
                }
                $row.attr('data-rowkey', row_key);
                // append created row to "body" element of datasheet
                this.$element.find('.datasheet-body').append($row);
            }

            this.$element.show();

            componentHandler.upgradeDom();

            // if there is draft, focus on it's children, for working 'onfocusout-save' functionality
            var invalidFields = this.$element.find('.datasheet-edit .datasheet-invalidField');
            if (invalidFields.length) {
                invalidFields.eq(0).focus();
            } else {
                this.$element.find('.datasheet-edit input').eq(0).focus();
            }
        };

        /**
         * @param  {jQuery} $edit_template
         * @param  {number} row_key 
         * @return {jQuery}
         */
        this._renderEditRow = function($edit_template, row_key) {
            var self = this;
            var $row = $edit_template.clone()
                                     .removeClass('datasheet-edit-template')
                                     .addClass('datasheet-edit');
            $row.find('[data-upgraded]').attr('data-upgraded', null)
                                        .removeClass('is-upgraded');
            // go over keys in row and fill inputs
            for (var key in this._data[row_key]) {
                /** @type {jQuery} element with our field data */
                var el = $row.find('[data-field=' + key + ']');

                // process checkbox value
                if (el.is('input[type=checkbox]')) {
                    if (this._data[row_key][key]) {
                        el.attr('checked', 'checked');
                    } else {
                        el.removeAttr('checked');
                    }
                } else {
                    // assume all other elements - common inputs
                    el.val(this._data[row_key][key]);
                }
            }

            // if there validation errors, populate appropriate container
            if (this._data[row_key]['_validationRes']) {
                /** @type {jQuery} container for validation messages */
                for (var field in this._data[row_key]['_validationRes']) {
                    var $dataElement = $row.find('[data-field=' + field + ']');
                    var validationContainer = $dataElement.siblings('.datasheet-validationRes');
                    validationContainer.empty();
                    $dataElement.addClass('datasheet-invalidField')
                    for (var ind in this._data[row_key]['_validationRes'][field]) {
                        validationContainer.append(
                            $('<div>',
                                {
                                    html: this._data[row_key]['_validationRes'][field][ind]
                                }
                            )
                        );
                    }
                }
            }

            // remove previous validation messages
            delete this._data[row_key]['_validationRes'];

            // save row on action-icon click
            $row.find('.datasheet-saveRow').click(function() {
                self.saveRow(row_key);
            });
            // save row on enter key pressed
            $row.keyup(function(e) {
                // 13 - ENTER
                if (e.which == 13) {
                    self.saveRow(row_key);
                }
            });
            // also save row on focusout from component
            $row.focusout(function(e) {
                return;
                // relatedTarget - target where focus comes in
                if (!$row.has(e.relatedTarget).length) {
                    self.saveRow(row_key);
                }
            });
            return $row;
        };

        /**
         * @param  {jQuery} $row_template
         * @param  {number}
         * @return {jQuery}
         */
        this._renderRow = function($row_template, row_key) {
            var self = this;
            var $row = $row_template.clone()
                                    .removeClass('datasheet-row-template')
                                    .addClass('datasheet-row');
            $row.find('[data-upgraded]').attr('data-upgraded', null)
                                        .removeClass('is-upgraded');                        
            // go over keys in row and fill td's
            for (key in this._data[row_key]) {
                var el = $row.find('[data-field=' + key + ']');
                if (el.is('input[type=checkbox]')) {
                    if (this._data[row_key][key]) {
                        el.attr('checked', 'checked');
                    } else {
                        el.removeAttr('checked');
                    }
                } else {
                    el.html(this._data[row_key][key]);
                }
            }
            $row.find('.datasheet-discardRow').click(function() {
                self.discardRow(row_key);
            });
            $row.find('.datasheet-instantEdit').click(function(e) {
                e.stopPropagation();
            });
            $row.find('.datasheet-instantEdit').change(function(e) {
                var saveResult = self.saveField(
                    $(this).attr('data-field'),
                    self.parseInputValue(this),
                    $(this).parents('tr').attr('data-rowkey')
                );
                if (saveResult) {
                    self.render();
                    $(self).trigger('dataChanged');
                }
            });
            $row.click(function() {
                self.editRow(row_key);
            });
            return $row;
        }

        /**
         * @param {Array}
         * @param {Boolean}
         */
        this.setData = function(data, noRender) {
            this._data = {};
            for (key in data) {
                this._data[_.uniqueId()] = data[key];
            }

            if (!noRender) {
                this.render();
            }
        };

        /**
         * Set validators for collection fields
         * @param {Object} validators [description]
         */
        this.setValidators = function(validators) {
            this._validators = validators;
        };

        /**
         * @return {[type]}
         */
        this.getData = function() {
            var result = [];
            for (key in this._data) {
                if (!('_draft' in this._data[key])) {
                    result.push(this._data[key]);
                }
            }
            return result;
        };

        /**
         * @param {[type]}
         */
        this.addRow = function(row) {
            if (this.isThereDrafts()) {
                console.log('Engine.Datasheet: cant add new row, drafts exists in dataset');
                return;
            }
            this._data[_.uniqueId()] = {'_draft': true};
            this.render();
        };

        /**
         * @param  {[type]}
         * @return {[type]}
         */
        this.discardRow = function(key) {
            delete this._data[key];
            $(this).trigger('dataChanged');
            this.render();
        };

        /**
         * @param  {[type]}
         * @return {[type]}
         */
        this.editRow = function(key) {
            this._data[key]['_draft'] = true;
            this.render();
        };

        /**
         * Save the data from edit row
         * @param  {Number}
         */
        this.saveRow = function(rowkey) {
            var self = this;

            /** @type {Boolean} self-descriptive */
            var isThereValidationErrs = false;

            /** @type {Object} data row from collection */
            var data_row = this._data[rowkey];

            /** @type {jQuery} jQuery object representing this row */
            var view_row = this.$element.find('[data-rowkey="' + rowkey + '"]');

            var isEmpty = true;

            view_row.find('[data-field]').each(function() {
                var val = $(this).val();
                var fieldName = $(this).attr('data-field');
                var isCheckbox = $(this).is('input[type=checkbox]');

                if (val && !isCheckbox) {
                    isEmpty = false;
                }

                val = self.parseInputValue(this);

                if (!self.saveField(fieldName, val, rowkey)) {
                    isThereValidationErrs = true;
                }
            });
            if (isEmpty) {
                this.discardRow(rowkey);
            } else if (!isThereValidationErrs) {
                delete data_row['_draft'];
                $(this).trigger('dataChanged');
            }
            this.render();
        };

        this.parseInputValue = function(input) {
            var isCheckbox = $(input).is('input[type=checkbox]');

            if (isCheckbox) {
                return $(input).is(':checked');
            }

            return $(input).val(); 
        };

        /**
         * [saveField description]
         * @param  {[type]} fieldName [description]
         * @param  {[type]} val       [description]
         * @param  {[type]} key       [description]
         * @return {[type]}           [description]
         */
        this.saveField = function(fieldName, val, rowkey) {
            var data_row = this._data[rowkey];
            var validationRes = this.validateField(fieldName, val);

            if (validationRes) {
                if (!data_row['_validationRes']) {
                    data_row['_validationRes'] = [];
                }
                data_row['_validationRes'][fieldName] = validationRes;
                return false;
            }

            data_row[fieldName] = val;
            return true;
        };

        /**
         * Validate field
         * @param  {String} field field name
         * @param  {[type]} value value for field to be tested
         * @return {Array|undefined}       validation messages array
         */
        this.validateField = function(field, value) {
            var result = [];
            if (field in this._validators) {
                for (validator in this._validators[field]) {
                    var res = this._validators[field][validator](value);
                    if (typeof res == 'string') {
                        result.push(res);
                    }
                } 
            }
            if (result.length) {
                return result;
            }
        };

        /**
         * @return {[type]}
         */
        this.discardDrafts = function() {
            for (key in this._data) {
                if ('_draft' in this._data[key]) {
                    this.discardRow(key);
                }
            }
        };

        /**
         * @return {Boolean}
         */
        this.isThereDrafts = function() {
            for (key in this._data) {
                if ('_draft' in this._data[key]) {
                    return true;
                }
            }
            return false;
        };
    }
});
