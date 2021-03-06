// 封装数据存储
const Store = require('electron-store')
const uuidv4 = require('uuid/v4')
const path = require('path')

class DataStore extends Store {
    constructor(settings) {
        super(settings)
        this.tracks = this.get('tracks') || []
    }

    saveTracks() {
        this.set('tracks', this.tracks)
        return this
    }

    getTracks() {
        return this.get('tracks') || []
    }

    addTracks(tracks) {//tracks是一个数组
        const tracksWithProps = tracks.map((track) => {
            return {
                id: uuidv4(),//可生成唯一id
                path: track,
                fileName: path.basename(track)
            }
        }).filter(track => {//去重 
            const currentTracksPath = this.getTracks().map(track => track.path)
            return currentTracksPath.indexOf(track.path) < 0
        })

        this.tracks = [...this.tracks, ...tracksWithProps]
        return this.saveTracks()
    }

    deleteTrack(deletedId) {
        this.tracks = this.tracks.filter(item => item.id !== deletedId)
        return this.saveTracks()
    }
}

module.exports = DataStore