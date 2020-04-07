# FTP-Sync extension for HBuilderX

This extension allows you to easily synchronise your local workspace (project files) with an FTP server. It also has several advanced features such as **automatic upload on save**.

![Demo of extension](https://img-cdn-qiniu.dcloud.net.cn/uploads/article/20200320/60b9e7ebd8edb52696a755ccb0464912.gif)

## Usage

There are four commands available. You can access them from the command palette (Ctrl+Shift+P on Windows/Linux).

You can also sync a single file by right-clicking on it in the left menu and using the "Ftp-sync: Upload File" and "Ftp-sync: Download File" commands.

### Ftp-sync: Init

Initializes a default FTP-Sync configuration file in the `.ftp` directory. Options can be customised as follows:

- remotePath - This can be set to the path on the remote that you would like to upload to. The default is `./` i.e. the root.
- host - The hostname of the FTP server you want to connect to.
- username - The username of the FTP account you want to use.
- password - The password of the FTP account you want to use.
- port - The port on the FTP server you would like to connect to. The default is `"21"`.
- protocol - The FTP protocol to be used. The default is `"ftp"` but you can also specify `"sftp"`.
- uploadOnSave - Whether files should automatically be uploaded on save. The default is `false`.
- passive - Specifies whether to use FTP passive mode. The default is `false`.
- debug - Specifies whether to display debug information in an ftp-sync Output window. The default is `false`.
- privateKeyPath - Specifies the path to the private key for SFTP. The default is `null`.
- passphrase - Specifies the passphrase to use with the private key for SFTP. The default is `null`.
- agent - Specifies the ssh-agent to use for SFTP. The default is `null`.
- allow - An array of escaped regular expression strings specifying paths which are allowed. If nonempty, unless a path matches any of these regular expressions it will not be included in the sync. Default value is empty, implying everything is allowed.
- ignore - An array of escaped regular expression strings specifying paths to ignore. If a path matches any of these regular expressions then it will not be included in the sync. Default values are `"\\.git"`, `"\\.vscode"` and `".DS_Store"`.
- generatedFiles: - Automatically upload freshly generated files. Also uploads files that are deleted. extensionsToInclude has to be set for this feature to work.
  - extensionsToInclude: [] e.g. [".js", ".css"] - Array of strings specifying what extensions to add for auto-upload. An empty array here means that generatedFiles feature is disabled. Setting it to [""] will cause it to upload files of all extensions.
  - path: "" - This specifies the path to the directory where the files are, [e.g.] "/build", default is "" which is the root workspace directory


## To be added soon:

- Config validation (add minimal configuration requirement)
- Better connection error handling
- More real life testing
- Bug fixes
- Context menu to sync folders (up/down)
