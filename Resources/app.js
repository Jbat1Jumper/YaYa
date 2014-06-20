logger = Ember.Logger;

App = Ember.Application.create({
    tray: null,
    ready: function() {
        logger.log("app is ready");
        var me = this;
        var tray = Ti.UI.addTray("app://app_logo.png", function() {
            me.trayClicked();
        });
        this.set("tray", tray);
    },
    trayClicked: function() {
        logger.log("tray icon clicked");
    }
});

App.Router.map(function() {
    this.resource('post', {
        path: '/post/:post_id'
    }, function() {
        this.route('edit');
        this.resource('comments', function() {
            this.route('new');
        });
    });
});

App.IndexRoute = Ember.Route.extend({
    activate: function() {},
    model: function() {}
});