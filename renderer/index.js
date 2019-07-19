const { ipcRenderer } = require('electron')
const { $, converDuration } = require('./helper')

// 创建音频播放对象
let musicAudio = new Audio()
// 所有音乐
let allTracks
// 当前音乐
let currentTrack

$('add-music-btn').addEventListener('click', () => {
    ipcRenderer.send('add-music-window')
})

// 渲染页面
// 使用data-*自定义事件存储数据
const renderListHTML = (tracks) => {
    const tracksList = $('tracksList')
    const tracksListHTML = tracks.reduce((html, track) => {
        html += `<li class="music-track list-group-item d-flex justify-content-between align-items-center">
            <div class="col-10">
                <i class="fas fa-music mr-2 text-success"></i>
                <b>${track.fileName}</b>
            </div>
            <div class="col-2">
                <i class="fas fa-play mr-3" data-id="${track.id}"></i>
                <i class="fas fa-trash-alt" data-id="${track.id}"></i>
            </div>
        </li>`
        return html
    }, '')//初始值为空

    const emptyTrackHTML = '<div class="alert alert-primary" role="alert">还没有音乐</div>'
    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}

// 主窗口接收主进程传来的数据
ipcRenderer.on('getTracks', (event, tracks) => {
    // console.log('receive tracks', tracks)
    renderListHTML(tracks)// 调用
    allTracks = tracks
})


// 事件代理
$('tracksList').addEventListener('click', (event) => {
    event.preventDefault() //阻止默认行为
    // 当前点击的对象为event.target
    // 获取自定义事件存储的数据
    const { dataset, classList } = event.target
    const id = dataset && dataset.id

    // classList.contains()判断类名是什么
    if (id && classList.contains('fa-play')) {//播放音乐
        // 判断是当前音乐还是新音乐
        if (currentTrack && currentTrack.id === id) {
            // 继续播放音乐
            musicAudio.play()
        }
        else {
            // 播放新音乐，注意还原之前的图标
            currentTrack = allTracks.find(track => track.id === id)
            musicAudio.src = currentTrack.path
            musicAudio.play()
            // 还原之前的图标
            const resetIconEle = document.querySelector('.fa-pause')
            if (resetIconEle) {
                resetIconEle.classList.replace('fa-pause', 'fa-play')
            }
        }

        // 替换类名
        classList.replace('fa-play', 'fa-pause')
    }
    else if (id && classList.contains('fa-pause')) {//暂停音乐
        musicAudio.pause()
        // 替换类名
        classList.replace('fa-pause', 'fa-play')
    }
    else if (id && classList.contains('fa-trash-alt')) { //发送事件删除音乐
        ipcRenderer.send('delete-track', id)
    }

})

const renderPlayerHTML = (name, duration) => {
    const palyer = $('player-status')
    const html = `<div class="col font-weight-bold">正在播放：${name}</div>
                <div class="col">
                    <span id="current-seeker">00:00</span> / ${converDuration(duration)}
                </div>
            `
    palyer.innerHTML = html
}

// 实时更新时间
const updateProgressHTML = (currentTime, duration) => {
    const seeker = $('current-seeker')
    seeker.innerHTML = converDuration(currentTime)
    // 计算歌曲播放进度并渲染
    const progress = Math.floor(currentTime / duration * 100)
    const bar = $('player-progress')
    bar.innerHTML = progress + '%'
    bar.style.width = progress + '%'
}

// 渲染播放器状态
musicAudio.addEventListener('loadedmetadata', () => {
    renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
})

// 更新播放器状态
musicAudio.addEventListener('timeupdate', () => {
    updateProgressHTML(musicAudio.currentTime, musicAudio.duration)
})

