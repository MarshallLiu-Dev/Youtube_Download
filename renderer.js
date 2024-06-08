const { ipcRenderer } = require('electron');

document.getElementById('download-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const youtubeUrl = document.getElementById('url-input').value;
        ipcRenderer.send('download-video', youtubeUrl);
    });

ipcRenderer.on('download-complete', (event, message) => {
        const alertBox = document.getElementById('alert');
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 15000); // Ocultar a mensagem após 5 segundos
    });
