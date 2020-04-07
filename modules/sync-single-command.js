/* global STATUS_TIMEOUT */
var onSave = require('./on-save');
var ftpconfig = require("./ftp-config");

module.exports = function(editor, getFtpSync) {
	if(!editor || !editor.document || !editor.document.workspaceFolder){
		return ;
	}
	if(!ftpconfig.validateConfig(editor.document.workspaceFolder)){
		return ;
	}
	onSave(editor.document, getFtpSync, true);
}