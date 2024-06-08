const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

// Função para sanitizar nomes de arquivos
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// Função para garantir que o diretório de saída exista
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

        // Garantir que o diretório de saída exista
        ensureDirectoryExistence(outputPath);

        const audioStream = ytdl(youtubeUrl, { quality: 'highestaudio' });

        ffmpeg(audioStream)
            .audioBitrate(128)
            .save(audioOutputPath)
            .on('end', () => {
                console.log(`Audio downloaded and saved as: ${audioOutputPath}`);
            })
            .on('error', (err) => {
                console.error(`Error: ${err}`);
            });

    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }
}


const youtubeUrl = 'https://www.youtube.com/watch?v=52QujwsiJ4o';
const outputPath = './downloads'; // Caminho para salvar os arquivos baixados
downloadAudio(youtubeUrl, outputPath);
