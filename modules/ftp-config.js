var fs = require("fs");
var vscode = require("vscode");
var path = require("path");
var _ = require("lodash");
var upath = require("upath");

module.exports = {
  DEBUG:false,
  rootPath: function(wsFolder) {
    return wsFolder.uri;
  },
  getConfigPath: function(wsFolder) {
    return this.getConfigDir(wsFolder) + "/ftp-sync.json";
  },
  getConfigDir: function(wsFolder) {
    return this.rootPath(wsFolder).fsPath + "/.ftp";
  },
  getGeneratedDir: function(wsFolder) {
    return upath.join(this.rootPath(wsFolder).fsPath, this.generatedFiles.path);
  },
  defaultConfig: {
    remotePath: "/",
    host: "host",
    username: "username",
    password: "password",
    port: 21,
    secure: false,
    protocol: "ftp",
    uploadOnSave: false,
    passive: false,
    debug: false,
    privateKeyPath: null,
    passphrase: null,
    agent: null,
    allow: [],
    ignore: ["\\.ftp", "\\.git", "\\.DS_Store"],
    generatedFiles: {
      extensionsToInclude: [],
      path: ""
    }
  },
  getConfig: function(wsFolder) {
	if(fs.existsSync(this.getConfigPath(wsFolder))){
		var configjson = fs.readFileSync(this.getConfigPath(wsFolder)).toString();
		var configObject;

		try {
		  configObject = JSON.parse(configjson);
		} catch (err) {
		  vscode.window.showErrorMessage(
			"Ftp-sync: Config file is not a valid JSON document. - " + err.message
		  );
		}
	}
    return _.defaults(configObject, this.defaultConfig);
  },
  validateConfig: function(wsFolder) {
    if (!fs.existsSync(this.getConfigPath(wsFolder))) {
      var options = [
        "创建FTP配置文件...",
        "忽略..."
      ];
      var pick = vscode.window.showQuickPick(options, {
        placeHolder: "还没有配置FTP连接，请先配置"
      });
      pick.then(function(answer) {
        if (answer == options[0]) require("./init-command")(wsFolder);
      });
      return false;
    }

    return true;
  },
  getSyncConfig: function(wsFolder) {
    let config = this.getConfig(wsFolder);
    return {
      getGeneratedDir: this.getGeneratedDir,
      local: config.localPath,
      root: config.rootPath,
      remote: upath.toUnix(config.remotePath),
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      passphrase: config.passphrase,
      allow: config.allow,
      ignore: config.ignore,
      passive: config.passive,
      secure: config.secure,
      secureOptions: config.secureOptions,
      protocol: config.protocol || "ftp",
      privateKeyPath: config.privateKeyPath,
      passphrase: config.passphrase,
      agent: config.agent,
      generatedFiles: config.generatedFiles,
      debug: config.debug,
      rootPath: this.rootPath
    };
  },
  connectionChanged: function(oldConfig,wsFolder) {
    var config = this.getSyncConfig(wsFolder);
    return (
      config.host != oldConfig.host ||
      config.port != oldConfig.port ||
      config.user != oldConfig.user ||
      config.password != oldConfig.password
    );
  }
};
