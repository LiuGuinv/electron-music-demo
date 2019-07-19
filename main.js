// 主进程
// BrowserWindow ->创建和控制浏览器窗口
// app ->控制你的应用程序的事件生命周期
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./renderer/MusicDataStore')
// 初始化，name是存储库的名称
const myStore = new DataStore({ 'name': 'Music Data' })

// 封装创建窗口类ES6
class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 900,
      height: 600,
      webPreferences: {
        nodeIntegration: true,//true表示为可以使用node.js的API
      }
    }
    // const finalConfig = Object.assign(basicConfig, config)
    // ES6语法
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadFile(fileLocation)
    // 优雅显示窗口
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

app.on('ready', () => {//当 Electron 完成初始化时被触发

  //创建第一个窗口
  const mainWindow = new AppWindow({}, './renderer/index.html')
  // mainWindow.webContents.openDevTools()


  // 渲染主窗口的页面，webContents负责渲染和控制网页, 是 BrowserWindow 对象的一个属性
  // 'did-finish-load'事件->导航完成时触发，即选项卡的旋转器将停止旋转，并指派onload事件后
  mainWindow.webContents.on('did-finish-load', () => {
    // console.log('page load')
    mainWindow.send('getTracks', myStore.getTracks())
  })

  ipcMain.on('add-music-window', () => {
    // console.log('111')
    //创建第二个窗口
    const addWindow = new AppWindow({
      width: 600,
      height: 400,
      parent: mainWindow
    }, './renderer/add.html')

    // Open the DevTools.
    // addWindow.webContents.openDevTools()
  })

  ipcMain.on('add-tracks', (event, tracks) => {
    // console.log(tracks)
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    // console.log(updatedTracks)//得到的是一个格式化的数组数据
    // 把添加的音乐数据传到主窗口渲染
    mainWindow.send('getTracks', updatedTracks)
  })

  // 删除音乐
  ipcMain.on('delete-track', (event, id) => {
    const updatedTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updatedTracks)
  })

  ipcMain.on('open-music-file', (event) => {
    dialog.showOpenDialog({
      // properties->包含对话框应用的功能，openFile - 允许选择文件，multiSelections-允许多选
      properties: ['openFile', 'multiSelections'],
      // filters 指定一个文件类型数组，用于规定用户可见或可选的特定类型范围
      filters: [{ name: 'Music', extensions: ['mp3'] }]
    }, (files) => {
      // console.log(files)
      if (files) {
        // 如果文件存在，就回复消息给渲染进程
        event.sender.send('selected-file', files)
      }
    })
  })

})
