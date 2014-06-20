JQ = Ember.Namespace.create();

JQ.Widget = Em.Mixin.create({

    classNames: ['jq-widget'],

    didInsertElement: function() {
        var options = this._gatherOptions();
        this._gatherEvents(options);
        var ui = jQuery.ui[this.get('uiType')](options, this.get('element'));
        this.set('ui', ui);
    },

    willDestroyElement: function() {
        var ui = this.get('ui');

        if (ui) {
            var observers = this._observers;
            for (var prop in observers) {
                if (observers.hasOwnProperty(prop)) {
                    this.removeObserver(prop, observers[prop]);
                }
            }
            ui._destroy();
        }
    },

    _gatherOptions: function() {
        var uiOptions = this.get('uiOptions'),
            options = {};

        uiOptions.forEach(function(key) {
            options[key] = this.get(key);

            var observer = function() {
                var value = this.get(key);
                this.get('ui').option(key, value);
            };

            this.addObserver(key, observer);

            this._observers = this._observers || {};
            this._observers[key] = observer;
        }, this);

        return options;
    },

    _gatherEvents: function(options) {
        var uiEvents = this.get('uiEvents') || [],
            self = this;

        uiEvents.forEach(function(event) {
            var callback = self[event];

            if (callback) {
                options[event] = function(event, ui) {
                    callback.call(self, event, ui);
                };
            }
        });
    }
});
JQ.Widget.extend = function(o) {
    return Em.View.extend(this, o);
};

JQ.CollectionWidget = Em.CollectionView.extend(JQ.Widget, {
    classNames: ['jq-collection-widget'],
    itemViewClass: Em.View.extend({
        context: function() {
            return this.get('content');
        }.property('content'),
    }),
    arrayDidChange: function(content, start, removed, added) {
        this._super(content, start, removed, added);
        var ui = this.get('ui');
        if (ui) {
            Em.run.scheduleOnce('afterRender', ui, ui.refresh);
        }
    }
});

//--------------------------------------


JQ.Button = JQ.Widget.extend({
    uiType: 'button',
    uiOptions: ['label', 'disabled'],
    tagName: 'button'
});

JQ.Menu = JQ.CollectionWidget.extend({
    uiType: 'menu',
    uiOptions: ['disabled'],
    uiEvents: ['select'],
    tagName: 'ul',
});

JQ.ProgressBar = JQ.Widget.extend({
    uiType: 'progressbar',
    uiOptions: ['value', 'max'],
    uiEvents: ['change', 'complete']
});

JQ.Accordion = JQ.CollectionWidget.extend({
    uiType: 'accordion',
    uiOptions: ['active', 'animate', 'collapsible', 'disabled', 'event', 'header', 'heightStyle', 'icons'],
    uiEvents: ['activate', 'beforeActivate', 'create'],
    window_resized_listener: null,
    parent_height: 0,
    didInsertElement: function() {
        this._super();
        var win = Ti.UI.getCurrentWindow();
        var me = this;
        me.set("parent_height", me.$().parent().height());
        this.window_resized_listener = win.addEventListener(Ti.RESIZED, function() {
            me.set("parent_height", me.$().parent().height());
            me.$().accordion("refresh");
        });
    },
    willDestroyElement: function() {
        var win = Ti.UI.getCurrentWindow();
        win.removeEventListener(Ti.RESIZED, this.window_resized_listener);
        this._super();
    }
});