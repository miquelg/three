#### Component example

(actor_component.js)

    var c = require('components');

    module.exports = {

        create: function() {

            return new c.Form({
                title: "Actor detail",
                components: {
                     "first_name": c.Textbox({ width: "40%" }),
                     "last_name": c.Textbox({ width: "40%", newLine: true }),
                     "films_actors": c.Grid()
                }
            });
        },

        render: function(innerHTML) {
            return "<div>" + innerHTML + "</div>";
        }

    };
