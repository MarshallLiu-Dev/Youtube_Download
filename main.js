const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('download-video', async (event, { youtubeUrl, downloadType }) => {
    const outputPath = path.join(__dirname, 'downloads');
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath);
    }

    try {
        const info = await ytdl.getInfo(youtubeUrl);
        const title = info.videoDetails.title.replace(/[<>:"\/\\|?*]+/g, ''); // Sanitize title

        if (downloadType === 'audio') {
            const filePath = path.join(outputPath, `${title}.mp3`);
            const audioStream = ytdl(youtubeUrl, { quality: 'highestaudio' });

            ffmpeg(audioStream)
                .audioBitrate(128)
                .save(filePath)
                .on('progress', (progress) => {
                    const percentage = Math.round(progress.percent);
                    event.sender.send('download-progress', percentage);
                })
                .on('end', () => {
                    event.sender.send('download-complete', 'Áudio baixado com sucesso!');
                    event.sender.send('downloaded', filePath);
                })
                .on('error', (err) => {
                    console.error(`Error: ${err}`);
                });
        } else if (downloadType === 'video') {
            const videoFilePath = path.join(outputPath, `${title}.mp4`);
            const audioFilePath = path.join(outputPath, `${title}-audio.mp4`);

            // Download video
            const videoStream = ytdl(youtubeUrl, { quality: 'highestvideo' });

            ffmpeg(videoStream)
                .videoBitrate(1000)
                .save(videoFilePath)
                .on('progress', (progress) => {
                    const percentage = Math.round(progress.percent / 2);
                    event.sender.send('download-progress', percentage);
                })
                .on('end', () => {
                    // Download audio
                    const audioStream = ytdl(youtubeUrl, { quality: 'highestaudio' });

                    ffmpeg(audioStream)
                        .audioBitrate(128)
                        .save(audioFilePath)
                        .on('progress', (progress) => {
                            const percentage = 50 + Math.round(progress.percent / 2);
                            event.sender.send('download-progress', percentage);
                        })
                        .on('end', () => {
                            // Combine video and audio
                            const finalFilePath = path.join(outputPath, `${title}-final.mp4`);
                            ffmpeg()
                                .input(videoFilePath)
                                .input(audioFilePath)
                                .outputOptions('-c copy')
                                .save(finalFilePath)
                                .on('end', () => {
                                    fs.unlinkSync(videoFilePath); // Delete video file
                                    fs.unlinkSync(audioFilePath); // Delete audio file
                                    event.sender.send('download-complete', 'Vídeo baixado com sucesso!');
                                    event.sender.send('downloaded', finalFilePath);
                                })
                                .on('error', (err) => {
                                    console.error(`Error: ${err}`);
                                });
                        })
                        .on('error', (err) => {
                            console.error(`Error: ${err}`);
                        });
                })
                .on('error', (err) => {
                    console.error(`Error: ${err}`);
                });
        }
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
});
