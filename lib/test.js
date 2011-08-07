var express = require('express');

var Model = require('../public/js/lib/shared/model').Model;
var Store = require('../public/js/lib/shared/store').Store;
var t = require('../public/js/lib/shared/types');
var c = require('../public/js/lib/shared/component');

var DataSourceMySQL = require('./datasource_mysql').DataSourceMySQL;

var Actor = new Model(t.Record({
    table: "actor",
    pk: "actor_id",
    properties: {
        "actor_id": t.Number(5),
        "first_name": t.String(45),
        "last_name": t.String(45),
        "last_update": t.Date(),
        "film_debutted_id": t.Number(5),
        "film_debutted": t.Relation1({ model: "film", own: "film_debutted_id" }),
        "films_actors": t.RelationN({ model: "film_actor", other: "actor_id" })
    }
})).getRecordClass();

var Language = new Model(t.Record({
    table: "language",
    pk: "language_id",
    properties: {
        "language_id": t.Number(3),
        "name": t.String(20),
        "last_update": t.Date()
    }
})).getRecordClass();

// DataSourceMySQL.retrieve(Actor.getModel(), "1=1", "", "");

var store = new Store(DataSourceMySQL);

var html = "";

Actor.load("actor_id=45", store, function(julia) {

    console.log(julia.get("first_name"));
    console.log(julia.get("last_name"));
    console.log(julia.values_);
    
    Language.loadCollection("", store, function(col) {
        
        console.log("lenguajes");
        
        // TODO: Constructor format?
        
        /*var input1 = new c.Input({id: "first_name", width: "30%"});
        input1.setBinding(julia, "first_name");
        html += input1.render();
        
        var input2 = new c.Input({id: "actor_id", width: "30%"});
        input2.setBinding(julia, "actor_id");
        html += input2.render();
        */
        
        var form = new c.Form({name: "form1", width: "60%"}, [ 
                c.Input({name: "actor_id", width: "30%"}),
                c.NewLine(), 
                c.Input({name: "first_name", width: "30%"}), 
                c.Input({name: "last_name", width: "30%"})
        ]);
        form.setBinding(julia);
        html += form.render();
                
    });

});

var app = express.createServer();

// Middleware

app.configure(function(){
  app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-time'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/../public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function(req, res){
    
    res.send(    
        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">' +
        '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">' +
        '<title>Three in node.js</title>' +
        '<link type="text/css" href="css/three.css" rel="stylesheet">' +
        '<script src="js/three.js" type="text/javascript"></script>' +
        '</head>' +
        '<body>' +  
        html + 
        '</body></html>');
});

app.listen(3000);

/*

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<html><body>' + html + '</body></html>');
}).listen(3000);
*/