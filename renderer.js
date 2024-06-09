const { ipcRenderer } = require('electron');

function updateUrlInput(downloadPath) {
    document.getElementById('url-input').value = downloadPath;
}

document.getElementById('download-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const youtubeUrl = document.getElementById('url-input').value;
    const downloadType = document.querySelector('input[name="download-type"]:checked').value;
    ipcRenderer.send('download-video', { youtubeUrl, downloadType });
});

document.getElementById('clear-button').addEventListener('click', () => {
    document.getElementById('url-input').value = '';
});

ipcRenderer.on('download-progress', (event, progress) => {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${progress}%`;
    progressBar.innerText = `${progress}%`;
});

ipcRenderer.on('download-complete', (event, message) => {
    const alertBox = document.getElementById('alert');
    alertBox.style.display = 'block';
    setTimeout(() => {
        alertBox.style.display = 'none';
        document.getElementById('progress-bar').style.width = '0%';
        document.getElementById('progress-bar').innerText = '';
    }, 115000); // Ocultar a mensagem após 15 segundos e redefinir a barra de progresso
});

ipcRenderer.on('downloaded', (event, downloadPath) => {
    updateUrlInput(downloadPath);
    
    const downloadsList = document.getElementById('downloads-list');
    const listItem = document.createElement('li');
    listItem.classList.add('download-item');
    listItem.innerHTML = `<span>${downloadPath}</span><button class="remove-button">Remove</button>`;
    downloadsList.appendChild(listItem);

    // Adicionar evento de clique para o botão de remover
    const removeButton = listItem.querySelector('.remove-button');
    removeButton.addEventListener('click', () => {
        listItem.remove();
    });
});
