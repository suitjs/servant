(function (console) { "use strict";
var Main = function() { };
Main.main = function() {
	js.suit.core.Servant.start();
};
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
