/* global STATUS_TIMEOUT */
var vscode = require("vscode");
var ftpconfig = require("./ftp-config");
var path = require("path");
var isIgnored = require("./is-ignored");

module.exports = function(fileUrl, getFtpSync) {

	var filePath = fileUrl ? fileUrl.fsPath : undefined;
	let workspaceFolder = fileUrl ? fileUrl.workspaceFolder : undefined

	//We aren't getting a file, trying to take the current one
	if (!filePath) {
		filePath = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : undefined;
	}

	if (!filePath) {
		vscode.window.showErrorMessage("Ftp-sync: No file selected");
		return;
	}

	if (!ftpconfig.rootPath(workspaceFolder).fsPath) {
		vscode.window.showErrorMessage("Ftp-sync: Cannot init ftp-sync without opened folder");
		return;
	}
	
	if(!ftpconfig.validateConfig(workspaceFolder)){
		return ;
	}

	var config = ftpconfig.getConfig(workspaceFolder);
	if (isIgnored(filePath, config.allow, config.ignore)) {
		vscode.window.showErrorMessage("Ftp-sync: Selected file is ignored.");
		return;
	}

	var fileName = path.basename(filePath);
	var downloadStatus = vscode.window.setStatusBarMessage("Ftp-sync: Downloading " + fileName + " from FTP server...", STATUS_TIMEOUT);
	getFtpSync(workspaceFolder).downloadFile(filePath, ftpconfig.rootPath(workspaceFolder).fsPath, function(err) {
		downloadStatus.dispose();
		if (err){
			vscode.window.showErrorMessage("Ftp-sync: Downloading " + fileName + " failed: " + err);
		}else{
			vscode.window.setStatusBarMessage("Ftp-sync: " + fileName + " downloaded successfully!", STATUS_TIMEOUT);
			if(fileUrl.open){
				vscode.workspace.openTextDocument(filePath);
			}
		}
	})
}