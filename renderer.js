const { ipcRenderer } = require('electron');

document.getElementById('download-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const youtubeUrl = document.getElementById('url-input').value;
    ipcRenderer.send('download-video', youtubeUrl);
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
    }, 15000); // Ocultar a mensagem após 5 segundos e redefinir a barra de progresso
});

ipcRenderer.on('downloaded', (event, downloadPath) => {
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


