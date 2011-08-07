if (exports) {
    var inherits = require('sys').inherits;
    var EventEmitter = require('events').EventEmitter;
}
else {
    window.components = {};     // TODO: rename with lib name
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

(function(exports) {   // Open closure


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
    this.options_ = options || {};                              // de-jsonify (recordfy)?
    if (options && options.name) this.setName(options.name);  // Set internally rather than externally
    this.parent_ = null;                                     // Parent (none by default)
    
};
inherits(Component, EventEmitter);
Component.prototype.isComponent = true;

Component.prototype.getName = function() {
  return this.name_;
};

Component.prototype.setName = function(name) {
  this.name_ = name;
};

Component.prototype.getParent = function() {
  return this.parent_;
};

Component.prototype.setParent = function(parent) {
  this.parent_ = parent;
};

Component.prototype.getId = function() {
    var parent = this.getParent();
    return parent ? parent.getId() + "." + this.getName() : this.getName();
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

Component.prototype.getOption = function(optionName) {
    return this.options_[optionName];
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

Component.prototype.template = function() {
    return "";
};

Component.prototype.frameTemplate = tmpl(
    "<div class='control' style='width:<%= getOption(\"width\") %>;'><div>" +
        "<%= internalRender(obj) %>" + 
    "</div></div>"
);

Component.prototype.render = function() {
    return this.frameTemplate(this);
};

Component.prototype.template = function() { return ""; };

Component.prototype.internalRender = function() {
    return this.template(this);
};

// To be overridden

Component.prototype.getOptionsModel = function() {};
Component.prototype.getOptionsComponent = function() {};

// MultiComponent - Component composed from multiple components

var MultiComponent = function(options, children) {
  this.children_ = children || []; 
  Component.call(this, options);
};
inherits(MultiComponent, Component);

MultiComponent.prototype.getChildren = function() {
  return this.children_;
};

MultiComponent.prototype.forEachChild = function(callback) {
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        child.setParent(this);
        callback(child.getName(), child);
    }
};

MultiComponent.prototype.render = function() {
    var html = "";
    this.forEachChild(function(childName, child) {
        html += child.render();
    });
    return html;
};

// TODO: not efficient
MultiComponent.prototype.getChildFromName = function(name) {
    this.forEachChild(function(childName, child) {
        if (childName == name) return child;
    });
};
MultiComponent.prototype.ctrl = MultiComponent.prototype.getChildFromName;      // alias

// Input - example

var Input = function(options) {
  Component.call(this, options);
};
inherits(Input, Component);

exports.Input = function(options) { return new Input(options); };

Input.prototype.template = tmpl(
    "<label><%=getName() %></label>" +        // TODO: get from type
    "<input id='<%=getId()%>' " +
    "<% if (getRecord().getPropertyType(getPropertyName()).isNumber) { %>" +
        " style='text-align:right;' " +
    "<% } %>" +
    "value='<%=getRecord().get(getPropertyName())%>' />"
);

// Input - client side methods

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


// NewLine

var NewLine = function(options) {
  Component.call(this, options);
};
inherits(NewLine, Component);

exports.NewLine = function(options) { return new NewLine(options); };

NewLine.prototype.render = function() {
    return "<br/>"; // Not in frame
};


// Form

var Form = function(options, children) {
  MultiComponent.call(this, options, children);
};
inherits(Form, MultiComponent);

exports.Form = function(options, children) { return new Form(options, children); };

Form.prototype.setBinding = function(record, propertyMap) {
    MultiComponent.prototype.setBinding.call(this, record);
    this.forEachChild(function(childName, child) {
        // Lookup property name on passed property map
        // By default bind each child with the same named property
        child.setBinding(record, propertyMap && propertyMap[childName] ? propertyMap[childName] : childName);
    });
};


})(exports ? exports : window.components);

