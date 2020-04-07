var vscode = require('vscode');
var ftpconfig = require('./ftp-config');
var fs = require('fs');

module.exports = function(workspaceFolder) {

	if(!ftpconfig.rootPath(workspaceFolder).fsPath) {
		vscode.window.showErrorMessage("Ftp-sync: Cannot init ftp-sync without opened folder");
		return;
	}
	
	if(!fs.existsSync(ftpconfig.getConfigDir(workspaceFolder)))
		fs.mkdirSync(ftpconfig.getConfigDir(workspaceFolder));

	if(fs.existsSync(ftpconfig.getConfigPath(workspaceFolder)))
		vscode.window.showWarningMessage("Ftp-sync: config already exists");
	else
		fs.writeFileSync(ftpconfig.getConfigPath(workspaceFolder), JSON.stringify(ftpconfig.defaultConfig, null, 4));
	
	var configDocument = vscode.workspace.openTextDocument(ftpconfig.getConfigPath(workspaceFolder));
	configDocument.then(function(document) {
		vscode.window.showTextDocument(document);
	});
}