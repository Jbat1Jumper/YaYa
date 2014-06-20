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

        this.moveToCorner();
        this.hideWindow();
    },
    trayClicked: function() {
        logger.log("tray icon clicked");
        var w = Ti.UI.getMainWindow();
        if (w.isVisible()) {
            this.hideWindow();
        } else
        if (this.lostFocusRecently) {
            logger.log("have lost focus recently, not showing")
        } else {
            this.moveToCorner();
            this.showWindow();
        }
    },
    hideWindow: function() {
        logger.log("hidding window");
        var w = Ti.UI.getMainWindow();
        w.hide();
    },
    showWindow: function() {
        logger.log("showing window");
        var w = Ti.UI.getMainWindow();
        w.show();
        w.focus();
        w.setTopMost(true);
        setTimeout(function() {
            w.setTopMost(false);
        }, 80);
    },
    moveToCorner: function() {
        logger.log("moviendo ventana");
        var w = Ti.UI.getMainWindow();
        var width = w.getWidth();
        var height = w.getHeight();
        var wwidth = window.screen.width;
        var wheight = window.screen.height;
        w.moveTo(wwidth - width, wheight - height);
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

App.TodoTask = Ember.Object.extend({
    text: "New task",
    isEditing: false
})

App.IndexRoute = Ember.Route.extend({
    model: function() {
        return [App.TodoTask.create()];
    },
    setupController: function(controller, m) {
        logger.log("seteando modelo del controlador");
        logger.debug("this is the controller: " + controller);
        logger.debug("model text: " + m.text);
        controller.set("model", m);
    }
});

App.IndexController = Ember.ArrayController.extend({
    actions: {
        editTask: function(task) {
            logger.log("editing text");
            task.set("isEditing", true);

        },
        saveTask: function(task) {
            logger.log("saving text");
            task.set("isEditing", false);
        },
        removeTask: function(task) {
            var m = this.get("model");
            m.removeAt(m.indexOf(task), 1);
        },
        addTask: function() {
            var m = this.get("model");
            m.pushObject(App.TodoTask.create());
        },
        closeApp: function() {
            Ti.UI.getCurrentWindow().close();
        }
    }
})