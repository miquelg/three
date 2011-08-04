if (!isBrowser) {
    var inherits = require('sys').inherits;
    var EventEmitter = require('events').EventEmitter;
}
else {
    window.components = {};     // TODO: rename with lib name
    var exports = window.components;
}

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
  
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
      
     /*alert("var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str.replace(/[\r\t\n]/g, " ")
               .replace(/'(?=[^%]*%>)/g, "\t")
               .split("'").join("\\'")
               .split("\t").join("'")
               .replace(/<%=(.+?)%>/g, "',$1,'")
               .split("<%").join("');")
               .split("%>").join("p.push('")
 
      + "');}return p.join('');");*/
    
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        // Single-quote issue fix from http://www.west-wind.com/weblog/posts/2008/Oct/13/Client-Templating-with-jQuery
        str.replace(/[\r\t\n]/g, " ")
               .replace(/'(?=[^%]*%>)/g, "\t")
               .split("'").join("\\'")
               .split("\t").join("'")
               .replace(/<%=(.+?)%>/g, "',$1,'")
               .split("<%").join("');")
               .split("%>").join("p.push('")
               
      + "');}return p.join('');");
      
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

(function() {   // Open closure


// template
// render - generate HTML (binded?)
// prefix + id
// paint - insert HTML in DOM
// bind
// children
// json options
// TODO: treat options as record, allowing for meta-binding
// TODO: namespacing as in types?

// Create a component from id and its options
var Component = function(options) {
  EventEmitter.call(this);
  this.options_ = options || {};                // de-jsonify (recordfy)?
  if (options.id) this.setId(options.id);       // Set internally rather than externally
};
inherits(Component, EventEmitter);
Component.prototype.isComponent = true;

Component.prototype.getId = function() {
  return this.id_;
};

Component.prototype.setId = function(id) {
  this.id_ = id;
};

Component.prototype.getOptions = function() {
    return this.options_;
};

Component.prototype.setOptions = function(options) {
  this.options_ = options;
};

Component.prototype.setOption = function(optionName, optionValue, paint) {
  this.options_[optionName] = optionValue;
  if (paint) {
      this.paint();
  }
};

Component.prototype.setBinding = function(record, propertyName) {   // propertyName optional if we bind to the whole record
    this.record_ = record;
    this.propertyName_ = propertyName;
};

Component.prototype.getRecord = function() {
    return this.record_;
};

Component.prototype.getPropertyName = function() {
    return this.propertyName_;
};

// Client side methods

if (isBrowser) {
    
    Component.prototype.getElement = function() {
        return document.getElementById(this.id_);
    };
    
    Component.prototype.paint = function() {
        // Render HTML
        var html = this.render();
        // Inject HTML
	    var element = this.getElement();
	    element.innerHTML = html;
    };
}

// To be overridden

Component.prototype.render = function() {};
Component.prototype.getOptionsModel = function() {};
Component.prototype.getOptionsComponent = function() {};

// MultiComponent - Component composed from multiple components

var MultiComponent = function(options, children) {
  Component.call(this, options);
  this.children_ = children || {}; 
};
inherits(MultiComponent, Component);

MultiComponent.prototype.getChildren = function() {
  return this.children_;
};

MultiComponent.prototype.forEachChild = function(callback) {
    var children = this.getChildren();
    for (var childName in children) {
        if (children.hasOwnProperty(childName)) {
            var child = children[childName];
            callback(childName, children[childName]);
        }
    }
};

MultiComponent.prototype.render = function() {
    this.forEachChild(function(childName, child) {
        child.render();
    });
};

MultiComponent.prototype.setId = function(id) {
    Component.prototype.setId.call(this, id);
    this.forEachChild(function(childName, child) {
        child.setId(id + "." + childName);          // Prefix it with parent id
    });
};

MultiComponent.prototype.getChildFromName = function(name) {
    return this.getChildren()[name];
};
MultiComponent.prototype.ctrl = MultiComponent.prototype.getChildFromName;      // alias

// Input - example

var Input = function(options) {
  Component.call(this, options);
};
inherits(Input, Component);

Input.prototype.render = function() {
    var renderInput = tmpl(
        "<input id='<%=getId()%>' " +
        "<% if (getRecord().getPropertyType(getPropertyName()).isNumber) { %>" +
            " style='textAlign:right;' " +
        "<% } %>" +
        "value='<%=getRecord().get(getPropertyName())%>' />"
    );
    return renderInput(this);
};

// Input - client side methods

if (isBrowser) {

    Input.prototype.getValue = function() {
        var value = this.getElement().value;
        return value;	
    };
    
    Input.prototype.setValue = function(value) {
        this.getElement().value = value;
    };
    
    Input.prototype.bind = function() {
        
        // var id = this.getId();
        var element = this.getElement();
        var record = this.getRecord();
        var propertyName = this.getPropertyName();
        var this_ = this;

        record.on(propertyName, function() {
            this_.setValue(record.getF(propertyName));
            record.set(propertyName, this_.getValue());			    // Reassing value (getF may have converted the value)
        });
            
        element.onchange = function() {
            if (this_.getValue() != record.get(propertyName)) {		// Only when really changes
                // Record.newTransaction();
                record.set(propertyName, this_.getValue());			// Conversions already handled by set
            }
        };

    };
    
}

exports.Input = Input;

// Form

var Form = function(options, children) {
  MultiComponent.call(this, options);
  this.children_ = children || {}; 
};
inherits(Form, MultiComponent);

exports.Form = Form;

})();

