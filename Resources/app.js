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

        var w = Ti.UI.getMainWindow();
        w.addEventListener(Ti.UNFOCUSED, function() {
            me.lostFocus();
        });
    },
    trayClicked: function() {
        logger.log("tray icon clicked");
        var w = Ti.UI.getMainWindow();
        if (w.isVisible()) {
            logger.log("hidding window");
            w.hide();
            return;
        }

        if (this.lostFocusRecently) {
            logger.log("have lost focus recently, not showing")
            return;
        }

        logger.log("showing window");

        w.show();
        w.focus();
        w.setTopMost(true);
        setTimeout(function() {
            w.setTopMost(false);
        }, 20);
    },
    lostFocusRecently: false,
    lostFocus: function() {
        this.set("lostFocusRecently", true);
        logger.log("lost focus");
        var w = Ti.UI.getMainWindow();
        w.setTopMost(false);
        logger.log("hidding");
        w.hide();

        var me = this;
        setTimeout(function() {
            me.set("lostFocusRecently", false);
        }, 800);
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