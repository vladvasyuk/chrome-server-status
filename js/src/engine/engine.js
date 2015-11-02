define(function() {

    return function() {
        /**
         * Find component by name
         * @public
         */
        this.findComponent = function(name) {
            var component = $('[data-name="' + name + '"]');
            if (component) {
                return component[0].eControl;
            } else {
                console.log('Engine: component not found');
            }
        };

        /**
         * Method, that runs passed callback when components init has done
         * @public
         */
        this.ready = function(callback) {
            var self = this;
            $(document).on('engineInitFinish', function() {
                callback.call(self);
            });
        };

        /**
         * Init all components
         * @public
         */
        this.go = function() {
            var TPL_COMPONENT_PATH = _.template('src/engine/components/<%=name%>/<%=name%>');
            var initDefs = [];

            // find all components on page
            $('[data-component]').each(function() {
                var self = this;

                // create deferred for component initialization and push it to init queue
                var def = $.Deferred();
                initDefs.push(def);

                // require appropriate component
                require([TPL_COMPONENT_PATH({'name': $(this).data('component')})], function(component) {
                    new component().init(self);
                    def.resolve();
                });
            });

            // when all components initialized, trigger appropriate event
            $.when.apply($, initDefs).done(function() {
                $(document).trigger('engineInitFinish');
            });
        };
    }
});
