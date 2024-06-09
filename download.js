const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

ffmpeg.setFfmpegPath(ffmpegPath);

function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function ensureDirectoryExistence(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}

async function downloadAudio(youtubeUrl, outputPath) {
    try {
        const info = await ytdl.getInfo(youtubeUrl);
        const sanitizedTitle = sanitizeFilename(info.videoDetails.title);
        const audioOutputPath = path.join(outputPath, `${sanitizedTitle}.mp3`);

        ensureDirectoryExistence(outputPath);

        const audioStream = ytdl(youtubeUrl, { quality: 'highestaudio' });

        let downloadedBytes = 0;
        const totalBytes = info.videoDetails.lengthSeconds * 100000; // Assumindo 100KB/s para simplificação

        return new Promise((resolve, reject) => {
            ffmpeg(audioStream)
                .audioBitrate(128)
                .on('progress', (progress) => {
                    const percent = Math.round((progress.targetSize / totalBytes) * 100);
                    downloadedBytes = progress.targetSize;
                    ipcMain.emit('download-progress', percent);
                })
                .save(audioOutputPath)
                .on('end', () => {
                    ipcMain.emit('downloaded', audioOutputPath);
                    resolve(audioOutputPath);
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    } catch (error) {
        console.error(`An error occurred: ${error}`);
        throw error;
    }
}

module.exports = downloadAudio;
