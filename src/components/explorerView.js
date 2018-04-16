"use strict";

//component use to handle the exploration view (going throught the 3D DOM)

function ExplorerView() {

	this._super();

	this.viewScene = new ViewScene();

};
//just after constructor
WebExplorerUtility.JsUtility.makeHerit(ExplorerView, AbstractComponent);