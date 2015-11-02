define(function() {
    return {
        required: function(message) {
            return function(val) {
                if (!val) {
                    return message || 'This field can not be empty';
                }
                return true;
            };
        }, 
        minValue: function(minValue, message) {
            return function(val) {
                if (val < minValue) {
                    if (message) {
                        return message
                    }
                    return _.template(
                        'This field can not be less than <%= minValue %>')({minValue: minValue});
                }
                return true;
            };
        }
    };
});