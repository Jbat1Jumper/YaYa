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

App.TaskObject = Ember.Object.extend({
    text: "New task",
    isEditing: false,
    subTasks: [],
    init: function() {
        logger.log("creating task object");
    }
});

App.TaskRawObject = function() {
    return {
        text: "New task",
        isEditing: false,
        subTasks: [],
    };
};

App.TaskHolderComponent = Ember.Component.extend({
    actions: {
        edit: function() {
            logger.log("editing task");
            //var t = this.get("task");
            //t.isEditing = true;
            this.set("task.isEditing", true);
        },
        save: function() {
            logger.log("saving task");
            //var t = this.get("task");
            this.set("task.isEditing", false);
        },
        removeThis: function() {
            logger.log("removing this");
            var t = this.get("task");
            this.sendAction("remove", t);
        },
        removeChild: function(childTask) {
            logger.log("removing child");
            var t = this.get("task");
            t.subTasks.removeAt(t.subTasks.indexOf(childTask), 1);
        },
        addChild: function() {
            logger.log("adding child");
            var t = this.get("task");
            t.subTasks.pushObject(App.TaskRawObject());
        }
    }
});

App.IndexRoute = Ember.Route.extend({
    model: function() {
        var t = App.TaskRawObject();
        t.subTasks.push(App.TaskRawObject());
        t.subTasks.push(App.TaskRawObject());
        return [t, App.TaskRawObject()];
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
        removeTask: function(task) {
            logger.log("removing main task");
            var m = this.get("model");
            m.removeAt(m.indexOf(task), 1);
        },
        addTask: function() {
            logger.log("adding main task");
            var m = this.get("model");
            m.pushObject(App.TaskRawObject());
        },
        closeApp: function() {
            logger.log("closing app");
            Ti.UI.getCurrentWindow().close();
        }
    }
})