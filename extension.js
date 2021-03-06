// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");

global.STATUS_TIMEOUT = 3000;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  var syncHelper, currentConfig;
  var ftpConfig = require("./modules/ftp-config");
  var getSyncHelper = function(workspaceFolder) {
    var oldConfig = currentConfig;
    currentConfig = ftpConfig.getSyncConfig(workspaceFolder);

    if (!syncHelper) syncHelper = require("./modules/sync-helper")();
    else if (ftpConfig.connectionChanged(oldConfig,workspaceFolder)) syncHelper.disconnect();

    syncHelper.useConfig(currentConfig);

    return syncHelper;
  };

  var initCommand = vscode.commands.registerCommand(
    "extension.ftpsyncinit",
    function(fileUrl){
		require("./modules/init-command")(fileUrl.workspaceFolder);
	}
  );
  var singleCommand = vscode.commands.registerTextEditorCommand(
    "extension.ftpsyncsingle",
    function(editor) {
      require("./modules/sync-single-command")(editor, getSyncHelper);
    }
  );
  var uploadcurrentCommand = vscode.commands.registerCommand(
    "extension.ftpsyncuploadselected",
    function(fileUrl) {
      require("./modules/uploadcurrent-command")(fileUrl, getSyncHelper);
    }
  );
  var downloadcurrentCommand = vscode.commands.registerCommand(
    "extension.ftpsyncdownloadselected",
    function(fileUrl) {
      require("./modules/downloadcurrent-command")(fileUrl, getSyncHelper);
    }
  );
  var listcurrentCommand = vscode.commands.registerCommand(
    "extension.ftpsynclistselected",
    function(fileUrl) {
      require("./modules/list-command")(fileUrl, getSyncHelper);
    }
  );
  var onSave = require("./modules/on-save");
  vscode.workspace.onDidSaveTextDocument(function(file) {
    onSave(file, getSyncHelper);
  });

  // context.subscriptions.push(initCommand);
  // context.subscriptions.push(syncCommand);
  // context.subscriptions.push(downloadCommand);
  // context.subscriptions.push(singleCommand);
  // context.subscriptions.push(uploadcurrentCommand);
  // context.subscriptions.push(downloadcurrentCommand);
  // context.subscriptions.push(listcurrentCommand);
}

exports.activate = activate;

function deactivate() {
  fsw.dispose();
}
exports.deactivate = deactivate;
