App = Ember.Application.create({});

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
    model: function() {
        return {
            village_people: [{
                name: "sam",
                age: 34
            }, {
                name: "susan",
                age: 32
            }, {
                name: "paul",
                age: 41
            }]
        };
    }
});

App.IndexController = Ember.ObjectController.extend({
    toto: function() {
        alert("TOTO");
    },
    Accordion: JQ.Accordion.extend({
        resize_well: function() {
            var h = this.parent_height;
            // this.$().css({
            //     height: (h - 22) + "px",
            // });
        }.observes("parent_height")
    }),
    FileButton: JQ.Button.extend({
        label: "File"
    }),
    EditButton: JQ.Button.extend({
        label: "Edit"
    }),
    HelpButton: JQ.Button.extend({
        label: "Help"
    })
})

EUI = Ember.Namespace.create();
EUI.Layout = Ember.View.extend({
    tagName: "div",
    classNames: ['n-full-size'],
    didInsertElement: function() {
        this.$().layout({
            fit: true
        });
        //$.parser.parse();
    }
});