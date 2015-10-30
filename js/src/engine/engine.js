define(function() {

    return function() {
        this.findComponent = function(name) {
            var component = $('[data-name="' + name + '"]');
            if (component) {
                return component[0].eControl;
            } else {
                console.log('Engine: component not found');
            }
        };

        this.ready = function(callback) {
            var self = this;
            $(document).on('engineInitFinish', function() {
                callback.call(self);
            });
        };

        this.go = function() {
            var TPL_COMPONENT_PATH = _.template('src/engine/components/<%=name%>/<%=name%>');
            var initDefs = [];

            $('[data-component]').each(function() {
                var self = this;

                var def = $.Deferred();
                initDefs.push(def);

                require([TPL_COMPONENT_PATH({'name': $(this).data('component')})], function(component) {
                    new component().init(self);
                    def.resolve();
                });
            });

            $.when.apply($, initDefs).done(function() {
                $(document).trigger('engineInitFinish');
            });
        };
    }
});
