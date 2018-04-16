"use strict";

//component use to see in detail the selected element

function SelectedView() {

	this._super();

	this.viewScene = new ViewScene();
};

WebExplorerUtility.JsUtility.makeHerit(SelectedView, AbstractView);