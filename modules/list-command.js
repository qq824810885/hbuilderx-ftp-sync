/* global STATUS_TIMEOUT */
const vscode = require('vscode');
const ftpconfig = require('./ftp-config');
const path = require('path');
const fs = require('fs')
const isIgnored = require('./is-ignored');
const output = require('./output');
const downloadFn = require('./downloadcurrent-command');
const uploadFn = require('./uploadcurrent-command');

module.exports = function(fileUrl, getFtpSync) {
	var filePath = fileUrl ? fileUrl.fsPath : undefined;
	var workspaceFolder = fileUrl ? fileUrl.workspaceFolder : undefined;
	//We aren't getting a file, trying to take the current one
	if(!filePath) {
		filePath = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : undefined;
	}

	if(!filePath) {
		vscode.window.showErrorMessage("Ftp-sync: No file selected");
		return;
	}

  if (!ftpconfig.rootPath(workspaceFolder).fsPath) {
    vscode.window.showErrorMessage('Ftp-sync: Cannot init ftp-sync without opened folder');
    return;
  }

  if (filePath.indexOf(ftpconfig.rootPath(workspaceFolder).fsPath) < 0) {
    vscode.window.showErrorMessage('Ftp-sync: Selected file is not a part of the workspace.');
    return;
  }
  
  if(!ftpconfig.validateConfig(workspaceFolder)){
  	return ;
  }

  var config = ftpconfig.getConfig(workspaceFolder);
  if (isIgnored(filePath, config.allow, config.ignore)) {
    vscode.window.showErrorMessage('Ftp-sync: Selected file is ignored.');
    return;
  }
  if(fs.statSync(filePath).isDirectory()){
      filePath = filePath + '/';
  }
  let remotePath = getFatherPath(filePath.replace(ftpconfig.rootPath(workspaceFolder).fsPath, config.remotePath));
  function listAllFiles(filesRemotePath) {
    getFtpSync(workspaceFolder).ListRemoteFilesByPath(filesRemotePath, function(err, files) {
      if (err) {
        // console.error('err:', err);
        vscode.window.showErrorMessage('Ftp-sync: Listing failed: ' + err);
      } else {
        vscode.window.setStatusBarMessage('Ftp-sync: Listing successfully!', STATUS_TIMEOUT);
        console.log('files:', files);
        showFiles(files, filesRemotePath);
      }
    });
  }
  function deleteFn(filePath) {
    getFtpSync(workspaceFolder).deleteRemoteFile(filePath).then(function(result) {
      vscode.window.setStatusBarMessage('Ftp-sync: Delete successfully!', STATUS_TIMEOUT);
    }).catch(err => {
      vscode.window.showErrorMessage('Ftp-sync: Delete failed: ' + err);
    })
  }
  listAllFiles(remotePath);
  // show remotePath files
  function showFiles(files, filesRemotePath) {
    const pickOptions = files.map(file => ({label: getLabel(file), description: file.path, file, isDir: file.isDir}));
    const pickResult = vscode.window.showQuickPick([
      {
        label: '../',
        description: '回到上一级目录',
        backPath: getFatherPath(filesRemotePath)
      }
    ].concat(pickOptions), {placeHolder: '请选择一个目录或者文件'});

    pickResult.then(function(result) {
      if (!result) {
        return;
      }
      // console.log('sel file:', result);
      if (result.backPath) {
        listAllFiles(result.backPath);
      } else if (result.isDir) {
        listAllFiles(result.file.path);
      } else {
        showFileActions(result.file);
      }
    });
  }
  // show Actions
  function showFileActions(file) {
    const pickOptions = [
      {
        label: '../',
        description: '回到上一级目录',
        backPath: getFatherPath(file.path)
      }, {
        label: '打开',
        description: '打开此文件',
        file,
        action: 'open'
      }, {
        label: '下载',
        description: '下载此文件',
        file,
        action: 'download'
      }, {
        label: '删除',
        description: '删除此文件',
        file,
        action: 'delete'
      }
    ];
    const pickResult = vscode.window.showQuickPick(pickOptions);

    pickResult.then(function(result) {
      // console.log('sel Actions:', result);
      if (!result) {
        return;
      }
      if (result.backPath) {
        listAllFiles(result.backPath);
      } else if (result.action === 'download') {
        downloadFn(getLocalPath(result.file.path,workspaceFolder), getFtpSync);
      } else if (result.action === 'open') {
		let localFilePath = getLocalPath(result.file.path,workspaceFolder);
		localFilePath.open = true;
		downloadFn(localFilePath, getFtpSync);
      } else if (result.action === 'delete') {
        deleteFn(result.file.path);
      }
    });
  }
};
function getLabel(file) {
  const name = file.name && file.name.indexOf('/') === 0
    ? file.name.slice(1)
    : file.name;
  return file.isDir
    ? `${name}/`
    : name

}
function getLocalPath(fileRemotePath,workspaceFolder) {
  // console.error("remotePath:" + ftpconfig.getConfig(workspaceFolder).remotePath);
  // console.error("rootPath:"+  ftpconfig.rootPath(workspaceFolder).fsPath);
  let fileRemoteRelativePath = fileRemotePath.replace(ftpconfig.getConfig(workspaceFolder).remotePath,"");
  if(!fileRemoteRelativePath.startsWith("/")){
	  fileRemoteRelativePath = "/" + fileRemoteRelativePath;
  }
  return {
    fsPath: ftpconfig.rootPath(workspaceFolder).fsPath + fileRemoteRelativePath,
	workspaceFolder:workspaceFolder
  };
}
function getFatherPath(son) {
  let father = son.split('/');
  father = father.slice(0, father.length - 1).join('/');
  return father;
}
