logger = Ember.Logger;

Ember.onerror = function(error) {
    logger.log(error);
    throw error;
};

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
            logger.log("have lost focus recently, not showing");
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

App.Router.map(function() {});

App.FileWrapper = Ember.Object.extend({
    file_name: "",
    file_content: null,
    file_load: function() {
        var fn = this.get("file_name");
        logger.log(fn + " load");
        var fs = Ti.Filesystem;
        var dir = fs.getApplicationDataDirectory();
        logger.debug(fn + " directory is: " + dir.nativePath());
        var file = fs.getFile(dir, fn);
        if (!file.exists()) {
            logger.log(fn * " dont exist, creating");
            var newf = this.file_create();
            if (newf === null || typeof(newf) === "undefined") {
                logger.log(fn + " marked to do not create")
                return;
            }
            var fStream = file.open(fs.MODE_WRITE);
            fStream.write(newf);
            fStream.close();
            logger.log(fn + " created");
        }
        logger.debug(fn + " opening");
        var fStream = file.open(fs.MODE_READ);
        var content = "";
        logger.debug(fn + " reading file");
        var line = fStream.readLine();
        while (line != null) {
            logger.debug(fn + " readline");
            content = content + line;
            line = fStream.readLine();
        }
        fStream.close();
        this.set("file_content", content);
        logger.log(fn + " done");
    },
    file_create: function() {
        // return string from which init the file
        // or null (or nothing(undefined))to cancel creation
        return null;
    },
    file_save: function() {
        var fn = this.get("file_name");
        logger.log(fn + " saving");
        var fs = Ti.Filesystem;
        var dir = fs.getApplicationDataDirectory();
        logger.debug(fn + " directory is: " + dir.nativePath());
        var file = fs.getFile(dir, fn);
        logger.debug(fn + " opening");
        var fStream = file.open(fs.MODE_WRITE);
        logger.debug(fn + " writing");
        fStream.write(this.get("file_content"));
        fStream.close();
        logger.log(fn + " saved");
    }
});

App.TaskList = App.FileWrapper.extend({
    file_name: "tasklist.json",
    file_create: function() {
        return '{"name": "tasklist", "tasks": [{"title": "Your First Task"}]}';
    },
    init: function() {
        this.load();
    },
    load: function() {
        this.file_load();
        var c = $.parseJSON(this.get("file_content"));
        if (typeof(c.tasks) !== undefined) {
            var tmptasks = []
            c.tasks.forEach(function(t) {
                tmptasks.push(App.TaskObject.create(t));
            });
            this.set("tasks", tmptasks);
        }
        if (typeof(c.name) !== undefined)
            this.set("name", c.name);
    },
    save: function() {
        logger.log("saving tasklist");
        var content = JSON.stringify({
            "name": this.get("name"),
            "tasks": this.get("tasks")
        });
        logger.debug("saving to file");
        this.set("file_content", content);
        this.file_save();
    },
    name: "",
    tasks: []
});

// Not an Ember Object for now
App.TaskObject = {
    create: function(o) {
        if (typeof(o) === "undefined")
            o = {};
        var no = $.extend(true, {
            name: "",
            description: "",
            tasks: [],
            isEditing: false,
        }, o);
        var tmptasks = []
        no.tasks.forEach(function(t) {
            tmptasks.push(App.TaskObject.create(t));
        });
        no.tasks = tmptasks;
        return no;
    }
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
            t.tasks.removeAt(t.tasks.indexOf(childTask), 1);
        },
        addChild: function() {
            logger.log("adding child");
            var t = this.get("task");
            t.tasks.pushObject(App.TaskObject.create());
        }
    }
});

App.TaskNameEdit = Em.TextField.extend({
    didInsertElement: function() {
        this.$().focus();
    },
    focusOut: function() {
        logger.log("focused out");
        this.sendAction('lostFocus');
    },
    keyPress: function(e) {
        logger.log("key pressed");
        if (e.charCode == 13)
            this.sendAction('enterPress');
    }
});

App.IndexRoute = Ember.Route.extend({
    model: function() {
        var m = App.TaskList.create();
        logger.log("modelo creado");
        return m;
    },
    setupController: function(controller, m) {
        logger.log("seteando modelo del controlador");
        logger.debug("this is the controller: " + controller);
        logger.debug("model name: " + m.name);
        controller.set("model", m);
    }
});

App.IndexController = Ember.Controller.extend({
    actions: {
        removeTask: function(task) {
            logger.log("removing main task");
            var tl = this.get("model.tasks");
            tl.removeAt(tl.indexOf(task), 1);
        },
        addTask: function() {
            logger.log("adding main task");
            var tl = this.get("model.tasks");
            tl.pushObject(App.TaskObject.create());
        },
        closeApp: function() {
            logger.log("closing app");
            Ti.UI.getCurrentWindow().close();
        },
        save: function() {
            logger.log("saving task list");
            this.get("model").save();
        }
    }
});

//