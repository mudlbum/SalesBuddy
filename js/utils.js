const modal = document.getElementById('ai-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');

function showModal(title, content) {
    if (!modal || !modalTitle || !modalBody) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.style.display = "block";
}

function showLoadingInModal(title) {
    showModal(title, `<div class="flex justify-center items-center"><div class="spinner"></div><span class="ml-4">Generating...</span></div>`);
}

function closeModal() {
     if (!modal) return;
     modal.style.display = "none";
}

if(modalCloseBtn) {
    modalCloseBtn.onclick = () => closeModal();
}

window.onclick = (event) => {
    if (event.target == modal) {
        closeModal();
    }
};

export { showModal, showLoadingInModal, closeModal };

