// http://stackoverflow.com/questions/5199126/javascript-object-create-not-working-in-firefox/5199135#5199135
//
if (typeof Object.create === 'undefined') {
    Object.create = function (o) { 
        function F() {} 
        F.prototype = o; 
        return new F(); 
    };
}

inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false
        }
    });
};

function submitForm()
{
    var forms = document.getElementsByTag("form");
    if (forms && forms[0]) {
        forms[0].submit();
    }
}

