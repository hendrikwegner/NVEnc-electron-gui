// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {execFile} = require("child_process");
const { ipcRenderer } = require('electron');

function init() {
  // add global variables to your web page
  window.isElectron = true
  window.ipcRenderer = ipcRenderer
  window.saveTo = ""
  window.filePaths = []
  window.logs = []

  window.ipcRenderer.on('saveTo_ToPreload', (event, msg) => {
    console.log(msg)
    window.saveTo = msg.filePaths[0] + "\\"
  })
  window.ipcRenderer.on('nvenc_ToPreload', (event, msg) => {
    console.log(msg)
    window.nvencPath = msg.filePaths[0]
  })
}

init();


window.addEventListener('DOMContentLoaded', () => {

  const saveBtn = document.getElementById('saveTo')
  const nvencBtn = document.getElementById('nvencPath')
  saveBtn.addEventListener('click', (e) => {
    if (window.isElectron) {
      window.ipcRenderer.send('saveTo_ToMain', 'select save folder')
    }
  })

  nvencBtn.addEventListener('click', (e) => {
    if (window.isElectron) {
      window.ipcRenderer.send('nvenc_ToMain', 'select nvenc path')
    }
  })

  const drop = document.getElementById('dropzone')
  drop.ondrop = (ev) => {
    ev.preventDefault()

    for (let file of ev.dataTransfer.files){
      window.filePaths.push(file.path)
    }
    console.log(window.filePaths)

    const params = document.getElementById('params')
    paramsArray = params.value.split(' ')

    encode(window.filePaths.shift(), paramsArray,"_")
  }
})

updateLog = function (data) {
  window.logs.push(data)
  log = document.getElementById('log')

  var entry = document.createElement('pre');
  entry.className = 'log-entry';
  entry.innerHTML = data;

  log.prepend(entry)
}

encode = function (pathToFile, params, prefix = "", suffix = "") {
  let filename = pathToFile.split('\\')
  filename = filename[filename.length - 1].replace(/\.[^/.]+$/, "")


  // TODO: path for runner cwd and exectuable filename
  let execPath = window.nvencPath.replace(/(.*\\)(.*)/, "$1")
  let nvencName = window.nvencPath.replace(/(.*\\)(.*)/, "$2")


  params.push('-i')
  params.push(pathToFile)
  params.push('-o')
  params.push(window.saveTo+prefix + filename + suffix + ".mp4")

  const runner = execFile(nvencName, params, {cwd: execPath});

  runner.kill()
  //const runner = execFile(`NVEncC64.exe`, params, {cwd: window.nvencPath});
  console.log(runner)

  runner.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
    updateLog(data.toString())
  });

  runner.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
    updateLog(data.toString())

  });

  runner.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
    updateLog('child process exited with code ' + code.toString())



    if (code == 0) {
      console.log('success...?')
      if (window.filePaths.length > 0) {
        encode(window.filePaths.shift(), "hevc", "_")
        console.log('filepaths:', window.filePaths)
      }
    }
  });
}


getDateString = function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  return `${year}${month}${day}`
}
