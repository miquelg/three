if (exports) {
    var inherits = require('sys').inherits;
    var EventEmitter = require('events').EventEmitter;
}
else {
    window.components = {};     // TODO: rename with lib name
}

// TODO: meterlo en util.js

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

  exports.tmpl = tmpl;


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
    this.variables_ = {};
    this.id_ = null;
};
inherits(Component, EventEmitter);
Component.prototype.isComponent = true;

Component.prototype.getParent = function() {
  return this.parent_;
};

Component.prototype.setParent = function(parent) {
  this.parent_ = parent;
};

Component.idCounter = 1;
Component.prototype.getId = function() {
    if (!this.id_) {
      if (typeof this.getName() === "undefined") {
        this.id_ = "id#" + Component.idCounter++;
      }
      else {
        this.id_ =  this.getNamespace() + this.getName();
      }
    }
    return this.id_;
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

Component.prototype.setVariable = function(variableName, value) {
    this.variables_[variableName] = value;
};

Component.prototype.getVariable = function(variableName) {
    return this.variables_[variableName];
};

Component.prototype.setVariables = function(variables) {
    this.variables_[variableName] = variables;
};

Component.prototype.getVariables = function() {
    return this.variables_;
};

Component.prototype.getNamespace = function() {
    var parent = this.getParent();
    var namespace = (parent ? parent.getNamespace() + parent.getName() : "");     // By default, parent namespace
    return (namespace === "" ? "" : namespace + ".");
};

// TODO: there are parents that do not extend namespace: "groupComponent", "tab", and others that do: "form"
//       getParentNamespace() instead
/*Component.prototype.getId = function() {
    var parent = this.getParent();
    return this.getNamespace() != "" ? this.getNamespace() + "." + this.getName() : this.getName();
};*/

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

Component.prototype.setBinding = function(recordOrCollection, propertyName) {   // propertyName optional if we bind to the whole record
    this.recordOrCollection_ = recordOrCollection;
    this.propertyName_ = propertyName;
};

Component.prototype.getRecord = function() {
    return this.recordOrCollection_;
};

// Alias if we are binding to a Collection
Component.prototype.getCollection = function() {
    if (this.recordOrCollection_.isCollection) return this.recordOrCollection_;
    else return this.recordOrCollection_.get(this.propertyName_);
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

Component.prototype.frameTemplate = tmpl(
    "<div class='control' style='width:<%= getOption(\"width\") %>;'><div>" +
        "<%= internalRender(obj) %>" + 
    "<div class='selection-mark'></div><div class='resize-handle-x'></div><div class='resize-handle-y'></div>" +
    "</div></div>"
);

Component.prototype.render = function() {
    return this.frameTemplate(this) +
        "<input type='hidden' id='" + this.getId() + ".variables' value='" + JSON.stringify(this.getVariables()) + "'/>";
};

Component.prototype.template = function() { return ""; };

Component.prototype.internalRender = function() {
    return this.template(this);
};

// Editor

Component.prototype.selectUnselect = function(select) {
    var elem = this.getElement();
    if (elem) {
        var control = elem.parentNode.parentNode;
        var hasTheClass = hasClass(control, "selected");
        if (select && !hasTheClass) {
            addClass(control, "selected");
        }
        else if (!select && hasTheClass) {
            removeClass(control, "selected");
        }
    }
};

// TODO: rename (init, initUI, ...)
//
Component.prototype.postRender = function() {
    var elem = this.getElement();
    var control = elem.parentNode.parentNode;
    var this_ = this;
    /*control.onclick = function(e) {
        Form.unselectAll();
        this_.selectUnselect(true);
        e.stopPropagation();
        return false;
    };*/
    elem.isComponent = true;  // kludge!!!
    var rxs = getElementsByClassName(control, "resize-handle-x");
    var rx = rxs[rxs.length-1];
    rx.onmousedown = function(e) {
        var e = e || window.event;
        var initialX = e.clientX;
        var initialWidth =  control.clientWidth;
        var dimensionX = getElementsByClassName(document, "dimension-x")[0];
        dimensionX.style.display = "";
        dimensionX.style.left = -getOffset(dimensionX.parentNode).left + getOffset(control).left + "px";
        dimensionX.style.top = -getOffset(dimensionX.parentNode).top + getOffset(control).top + 5 + "px";
        dimensionX.style.width = elem.parentNode.clientWidth + "px";
        // console.log(e);
        document.onmousemove = function(e) {
            var event = e || window.event;
            control.style.width = initialWidth + (e.clientX - initialX) + "px";
            dimensionX.style.left = -getOffset(dimensionX.parentNode).left + getOffset(control).left + "px";
            dimensionX.style.top = -getOffset(dimensionX.parentNode).top + getOffset(control).top + 5 + "px";   
            dimensionX.style.width = elem.parentNode.clientWidth + "px";
            dimensionX.innerHTML = "<span>" + dimensionX.style.width  + "</span>";
            console.log(e);
        }
        document.onmouseup = function(e) {
            console.log(e);
            var event = e || window.event;
            document.onmousemoveup = null;
            document.onmousemove = null;
            dimensionX.style.display = "none";
            event.stopPropagation();
        }
        e.stopPropagation();
        return false;
    }
    var ryx = getElementsByClassName(control, "resize-handle-y");
    var ry = ryx[ryx.length-1];
    ry.onmousedown = function(e) {
        var e = e || window.event;
        var dragging = true;
        var initialY = e.clientY;
        var initialHeight =  elem.clientHeight;
        var dimensionY = getElementsByClassName(document, "dimension-y")[0];
        dimensionY.style.display = "";
        dimensionY.style.left = -getOffset(dimensionY.parentNode).left + getOffset(control).left + 5 + "px";
        dimensionY.style.top = -getOffset(dimensionY.parentNode).top + getOffset(control).top + "px";
        dimensionY.style.height = elem.parentNode.clientHeight + "px";
        document.onmousemove = function(e) {
            var event = e || window.event;
            elem.style.height = initialHeight + (e.clientY - initialY) + "px";
            dimensionY.style.height = elem.parentNode.clientHeight + "px";
            dimensionY.innerHTML = "<span>" + control.clientHeight + "px </span>";
        }
        document.onmouseup = function(e) {
            console.log(e);
            var event = e || window.event;
            document.onmouseup = null;
            document.onmousemove = null;
            dimensionY.style.display = "none";
            event.stopPropagation();
        }
        e.stopPropagation();
        return false;
    }
};

Component.prototype.getLimits = function() {
    var elem = this.getElement().parentNode.parentNode;     // TODO: getFrame
    var offset = getOffset(elem);
    return { 
        x1: offset.left, 
        y1: offset.top, 
        x2: offset.left + (elem ? elem.clientWidth : 0), 
        y2: offset.top + (elem ? elem.clientHeight : 0)
    };
};

Component.prototype.determineDropPosition = function(x, y) {
    var dropPosition = { target: this };
    
    var limits = this.getLimits();
    var distX1 = Math.abs(x - limits.x1), distX2 = Math.abs(x - limits.x2), distX = Math.min(distX1, distX2);
    var distY1 = Math.abs(y - limits.y1), distY2 = Math.abs(y - limits.y2), distY = Math.min(distY1, distY2);
    if (distX < distY) { 
        if (distX1 < distX2) dropPosition.left = limits.x1;
        else dropPosition.right = limits.x2;
    }
    else { 
        if (distY1 < distY2) dropPosition.top = limits.y1;
        else dropPosition.bottom = limits.y2;
    }
    
    return dropPosition;
};


exports.Component = Component;

// To be overridden

Component.prototype.getOptionsModel = function() { };

// MultiComponent - Component composed from multiple components

var MultiComponent = function(options, children) {
  this.children_ = children || []; 
  Component.call(this, options);
  var this_ = this;
  this.forEachChild(function(childName, child) {
      child.setParent(this_);
  });
};
inherits(MultiComponent, Component);
MultiComponent.prototype.isMultiComponent = true;

MultiComponent.prototype.getChildren = function() {
  return this.children_;
};

MultiComponent.prototype.forEachChild = function(callback) {
    var children = this.getChildren();
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        callback(child.getName(), child);
    }
};

MultiComponent.prototype.forEachDescendant = function(callback) {
    var this_ = this;
    this.forEachChild(function(childName, child) {
        if (callback) callback(childName, child);
        if (child.isMultiComponent) {
            child.forEachDescendant(callback);
        }
    });
};

MultiComponent.prototype.assignVariablesFromParams = function(params) {
    this.forEachDescendant(function(descendantName, descendant) {
        var variablesJson = params[descendant.getId() + ".variables"];
        if (variablesJson) {
            descendant.setVariables(JSON.parse(variablesJson));
        }
    });
};

MultiComponent.prototype.internalRender = function() {
    var html = "<div id='" + this.getId() + "' class='MultiComponent'>";
    this.forEachChild(function(childName, child) {
        html += child.render();
    });
    html += "<div class='clear'></div>";
    html += "<div class='multi-select'></div>";     // TODO: solo form / Form
    html += "<div class='dimension-x'></div>";
    html += "<div class='dimension-y'></div>";
    html += "<div class='drop-caret'></div>";
    html += "</div>";
    return html;
};

MultiComponent.prototype.postRender = function() {
    Component.prototype.postRender.call(this);
    this.forEachChild(function(childName, child) {
        child.postRender();
    });
};

MultiComponent.prototype.descendantFromId = function(id) {
    var descendant = null;
    this.forEachDescendant(function(childName, child) {
        if (child.getId() === id) {
            descendant = child;
        }
    });
    return descendant;
};

MultiComponent.prototype.indexOfChild = function(child) {
    for (var i = 0; i < this.getChildren().length; i++) {
        if (this.getChildren()[i] == child) return i;
    }
};

MultiComponent.prototype.nextSibling = function(child) {
    var index = this.indexOfChild(child);
    return (index+1 == this.getChildren().length ? null : this.getChildren()[index+1]);
};

MultiComponent.prototype.previousSibling = function(child) {
    var index = this.indexOfChild(child);
    return (index-1 < 0 ? null : this.getChildren()[index-1]);
};

MultiComponent.prototype.removeChild = function(child) {
    var index = this.indexOfChild(child);
    
    console.log("Before:", index);
    for (var i = 0; i < this.getChildren().length; i++) {
        console.log(this.getChildren()[i].getId());
    }
    
    // Remove from children
    this.getChildren().splice(index, 1);
    child.setParent(null);
    
    console.log("After:");
    for (var i = 0; i < this.getChildren().length; i++) {
        console.log(this.getChildren()[i].getId());
    }
    
    // Remove from DOM
    var control = child.getElement().parentNode.parentNode;     // TODO: support not-framed controls
    control.parentNode.removeChild(control);
};

MultiComponent.prototype.insert = function(newChild, referenceChild, after) {
    
    var newControl;
    if (!newChild.getParent()) {    // Does not have parent, assume not rendered yet
        console.log(newChild.render());
        var dummyDiv = document.createElement("div");
        dummyDiv.innerHTML = newChild.render();
        newControl = dummyDiv.firstChild;
        // TODO: must destroy dummyDiv ??
        // newControl = document.createElement(newChild.render());
    }
    else {
        newControl = newChild.getElement().parentNode.parentNode;               // TODO: support not-framed controls
        // Remove from last parent
        newChild.getParent().removeChild(newChild);
    }

    // Attach to new parent
    //
    // Insert into children
    var index = this.indexOfChild(referenceChild);
    this.getChildren().splice(after ? index+1 : index, 0, newChild);
    newChild.setParent(this);
    
    // Insert into DOM
    // TODO: support not-framed controls
    var referenceControl;
    if (referenceChild.isNewLine) {
        referenceControl = referenceChild.getElement();
    }
    else {
        referenceControl = referenceChild.getElement().parentNode.parentNode;
    }
    if (after) {
        // If next sibling doesn't exist, it would still work, because the referenceNode.nextSibling will return “null”, 
        // and js will just append to last child of parent node.
        referenceControl.parentNode.insertBefore(newControl, referenceControl.nextSibling);
    }
    else {
        referenceControl.parentNode.insertBefore(newControl, referenceControl);
    }
    
    return newChild;        // Return newly inserted element
    
};

// TODO: better algorithm?
//
MultiComponent.prototype.descendantFromElement = function(elem) {
    while (elem) {
        if (elem.isComponent) {
            return this.descendantFromId(elem.id);
        }
        elem = elem.parentNode;
    }
    return null;
};



// TODO: not efficient
// TODO: global map for root (no parent) components
//       serves as base for Component.getComponentFromId(...)
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
    "<input id='<%=getId()%>' class='text' " +
    // "<% if (getRecord().getPropertyType(getPropertyName()).isNumber) { %>" +
    //     " style='text-align:right;' " +
    // "<% } %>" +
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
NewLine.prototype.isNewLine = true;

exports.NewLine = function(options) { return new NewLine(options); };

NewLine.prototype.render = function() {
    return "<br id='" + this.getId() + "' class='new-line' />"; // Not in frame
};

// Button - example

var Button = function(options) {
  Component.call(this, options);
};
inherits(Button, Component);

exports.Button = function(options) { return new Button(options); };

Button.prototype.template = tmpl(
    "<button id='<%=getId()%>' ><span><%=getName() %></span></button>"
);

// Groupbox

var Groupbox = function(options, children) {
  MultiComponent.call(this, options, children);
  this.selected_ = [];
};
inherits(Groupbox, MultiComponent);

Groupbox.prototype.internalRender = function() {
    var html = "<div id='" + this.getId() + "' class='groupbox'>";
    html += "<span class='legend'>" + this.getName() + "</span>";
    this.forEachChild(function(childName, child) {
        html += child.render();
    });
    html += "<div class='clear'></div>";
    html += "</div>";
    return html;
};

Groupbox.prototype.setBinding = function(record, propertyMap) {
    MultiComponent.prototype.setBinding.call(this, record);
    this.forEachChild(function(childName, child) {
        // Lookup property name on passed property map
        // By default bind each child with the same named property
        child.setBinding(record, propertyMap && propertyMap[childName] ? propertyMap[childName] : childName);
    });
};

exports.Groupbox = function(options, children) { return new Groupbox(options, children); };

// Form

var Form = function(options, children) {
  MultiComponent.call(this, options, children);
  this.selected_ = [];
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

/*Form.prototype.getNamespace = function() {
    return this.getParent() && this.getParent().getNamespace() != "" ? this.getParent().getNamespace() + "." + this.getName() : this.getName();
};*/

Form.prototype.postRender = function() {
    
    var elem = this.getElement();
    var multiSelect = getElementsByClassName(elem, "multi-select")[0];
    var this_ = this;
    /*
    elem.onmousemove = function(e) {
        var event = e || window.event;
        var target = event.target || event.srcElement;
        var descendant = this_.descendantFromElement(target);
        if (descendant) {
            this_.renderDropCaret(descendant, e.clientX, e.clientY);
        }
    }
    */
    elem.onmousedown = function(e) {
        
       var e = e || window.event;
        var initialX = e.clientX;
        var initialY = e.clientY;
        
        var selected = this_.selectedFromRectangle(initialX, initialY, initialX, initialY);
        var uniqueSelected = (selected.length > 0 ? selected[0] : null);
        for (var i = 0; i < this_.selected_.length; i++) {
            if (uniqueSelected === this_.selected_[i]) break;
        }
        console.log(uniqueSelected, i, this_.selected_.length);
        if (i < this_.selected_.length) {   // Move mode
        
           var control = uniqueSelected.getElement().parentNode.parentNode;
           var controlLimits = getOffset(control);
           var dropPosition = null;
           var selectionMark = getElementsByClassName(control, "selection-mark")[0];
           
           document.onmousemove = function(e) {
                var event = e || window.event;
                var target = event.target || event.srcElement;
                var descendant = this_.descendantFromElement(target);
                var dx = e.clientX - controlLimits.left + 20, dy = e.clientY - controlLimits.top + 20;
                control.style.left = dx + "px";
                control.style.top = dy +"px";
                selectionMark.style.left = -dx -4 + "px";
                selectionMark.style.top = -dy + "px";
                control.style.opacity = .4;
                if (descendant && descendant != uniqueSelected) {
                  console.log(control.style.left, control.style.top);
                  dropPosition = this_.renderDropCaret(descendant, e.clientX, e.clientY, uniqueSelected);
                }
            };
            document.onmouseup = function(e) {
                var event = e || window.event;
                document.onmouseup = null;
                document.onmousemove = null;
                
                var dropCaret = getElementsByClassName(this_.getElement(), "drop-caret")[0];
                dropCaret.style.display = "none";
                control.style.left = null;
                control.style.top = null;
                selectionMark.style.left = null;
                selectionMark.style.top = null;
                 control.style.opacity = 1;
                
                // Do the move
                if (dropPosition) {
                    var target = dropPosition.target;
                    if (target != uniqueSelected) {
                        
                        var targetParent = target.getParent();
                        if (dropPosition.top) {
                            var previousSibling = targetParent.previousSibling(target);
                            while (previousSibling && !previousSibling.isNewLine) {
                                target = previousSibling;
                                previousSibling = targetParent.previousSibling(target);
                            }
                            if (!previousSibling || (targetParent.previousSibling(previousSibling) && !targetParent.previousSibling(previousSibling).isNewLine)) {
                                target = targetParent.insert(new NewLine(), target, false);
                            }
                            else {
                                target = previousSibling;
                            }
                        }
                        else if (dropPosition.bottom) {
                            var nextSibling = targetParent.nextSibling(target);
                            while (nextSibling && !nextSibling.isNewLine) {
                                target = nextSibling;
                                nextSibling = targetParent.nextSibling(target);
                            }
                            if (!nextSibling || (targetParent.nextSibling(nextSibling) && !targetParent.nextSibling(nextSibling).isNewLine)) {
                                target = targetParent.insert(new NewLine(), target, true);
                            }
                            else {
                                target = nextSibling;
                            }
                        }
    
                        // uniqueSelected.getParent().removeChild(uniqueSelected);
                        targetParent.insert(uniqueSelected, target, dropPosition.right || dropPosition.bottom);
                    }
                }
            }
        }
        else {  // Selection mode
        
            multiSelect.style.left = -getOffset(elem).left + initialX + "px";
            multiSelect.style.top = -getOffset(elem).top + initialY + "px";
            multiSelect.style.width = "1px";
            multiSelect.style.height = "1px";
            multiSelect.style.display = "";
    
            document.onmousemove = function(e) {
                var event = e || window.event;
                // console.log(e);
                multiSelect.style.left = -getOffset(elem).left + (e.clientX > initialX ? initialX : e.clientX) + "px";
                multiSelect.style.width = Math.abs(e.clientX - initialX) + "px";
                multiSelect.style.top = -getOffset(elem).top + (e.clientY > initialY ? initialY : e.clientY) + "px";
                multiSelect.style.height = Math.abs(e.clientY - initialY) + "px";
            }
            document.onmouseup = function(e) {
                var event = e || window.event;
                document.onmouseup = null;
                document.onmousemove = null;
                multiSelect.style.display = "none";
                var finalX = (e.clientX > initialX ? e.clientX : initialX);
                initialX = (e.clientX > initialX ? initialX : e.clientX)
                var finalY = (e.clientY > initialY ? e.clientY : initialY);
                initialY = (e.clientY > initialY ? initialY : e.clientY)
                
                this_.selected_ = this_.selectedFromRectangle(initialX, initialY, finalX, finalY);
                
                // Unselect all
                this_.forEachDescendant(function(childName, child) {
                   child.selectUnselect(false);
                 });
                
                // Select
                for (i = 0; i < this_.selected_.length; i++) {
                    this_.selected_[i].selectUnselect(true);
                }
    
                event.stopPropagation();
            }
        }
        
        e.stopPropagation();
        return false;
    };
    
    this.forEachChild(function(childName, child) {
        child.postRender();
    });
};

Form.prototype.renderDropCaret = function(descendant, x, y, uniqueSelected) {
    var dropCaret = getElementsByClassName(this.getElement(), "drop-caret")[0];
    dropCaret.style.display = "";
    console.log(dropCaret);
    
    var dropPosition = descendant.determineDropPosition(x, y);
    var limits = descendant.getLimits();
    console.log(dropPosition, limits);
    if (dropPosition.left || dropPosition.right) {
        dropCaret.style.left = -getOffset(dropCaret.parentNode).left + (dropPosition.left || dropPosition.right) + "px";
        dropCaret.style.top = -getOffset(dropCaret.parentNode).top + limits.y1 + "px";
        dropCaret.style.height = limits.y2 - limits.y1 + "px";
        dropCaret.style.width = "4px";
        console.log(dropCaret.left, dropCaret.top, dropCaret.height, dropCaret.width);
    }
    else {
        var maxY2 = limits.y2, maxY1 = limits.y1;
        var parent = descendant.getParent();
        var newLineFound = false;
        if (parent && (dropPosition.top || dropPosition.bottom)) {
            parent.forEachChild(function(childName, child) {
              if (child != uniqueSelected) {
                  if (child.isNewLine) newLineFound = true;
                  var y2 = child.getLimits().y2;
                  if (y2 > maxY2 && !newLineFound) maxY2 = y2;
              }
            });
            limits = parent.getLimits();
        }
        dropCaret.style.left =  -getOffset(dropCaret.parentNode).left + limits.x1 + "px";
        dropCaret.style.top = -getOffset(dropCaret.parentNode).top + (dropPosition.top ? maxY1 : maxY2) + "px";
        dropCaret.style.width = limits.x2 - limits.x1 + "px";
        dropCaret.style.height = "4px";
    } 
    return dropPosition;
};

// TODO: support more modes apart from "intersect"
// 
Form.prototype.selectedFromRectangle = function(initialX, initialY, finalX, finalY) {
    var selected = [];
    
    this.forEachDescendant(function(childName, child) {
        var childElem = child.getElement();
        if (childElem) {
            var childInitialX = getOffset(childElem).left;
            var childFinalX = childInitialX + childElem.clientWidth -1;
            var childInitialY = getOffset(childElem).top;
            var childFinalY = childInitialY + childElem.clientHeight -1;
            var intersects = !(childFinalX < initialX || finalX < childInitialX) &&
                             !(childFinalY < initialY || finalY < childInitialY);
            if (intersects) {
                selected.push(child);
            }
        }
    });
    
    // Cut off parents
    var onlyLeafs = [];
    for (var i = 0; i < selected.length; i++) {
        for (var j = 0; j < selected.length; j++) {
            if (selected[j].getParent() == selected[i]) break;
        }
        if (j == selected.length) onlyLeafs.push(selected[i]);
    }

    return onlyLeafs;
};


// SimpleGrid
// Input - example

var SimpleGrid = function(options) {
  Component.call(this, options);
};
inherits(SimpleGrid, Component);

exports.SimpleGrid = function(options) { return new SimpleGrid(options); };

SimpleGrid.prototype.template = tmpl(
    "<table class='grid' id='<%= getId() %>' >" + 
        "<% var model = getCollection().getModel(); %>" +
        "<% model.forEachProperty(function(name, type) { %>" +
            "<th><%= name %></th>" +
        "<% }); %>" +
        "<% for (var i = 0; i < getCollection().size(); i++) { var elem = getCollection().get(i);  %>" +
            "<tr class='<%= i % 2 ? 'odd ' : 'even ' %><%= i == 0 ? 'first ' : '' %><%= i == getCollection().size()-1 ? 'last ' : '' %>' >" +
                "<% model.forEachProperty(function(name, type, isFirst, isLast) { %>" +
                    "<td class='<%= isFirst ? 'first ' : '' %><%= isLast ? 'last ' : '' %>' ><%= elem.get(name) %></td>" +
                "<% }); %>" +
            "</tr>" +
        "<% } %>" +
    "</table>" +
    "<a href='#'>Previous</a> <%= getVariable('page') %> " +
    " <a href='#'>Next</a>"
);


})(exports ? exports : window.components);

