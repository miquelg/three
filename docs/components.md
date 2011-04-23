#### Component example

(actor_form.js)

    var c = require('components');

    ActorForm = function() {

            return new c.Form({
                title: "Actor detail",
                components: {
                     "first_name": c.Textbox({ width: "40%" }),
                     "last_name": c.Textbox({ width: "40%", newLine: true }),
                     "films_actors": c.Grid()
                }
            });
        },

    ActorForm.prototype.render = function(innerHTML, bindValue, bindType) {
            return "<div>" + innerHTML + "</div>";
    }

    exports.ActorForm = ActorForm;
