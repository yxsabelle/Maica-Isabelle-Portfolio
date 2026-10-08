/* =========================================
   CHATBASE AI CHAT
========================================= */

const aiChatButton = document.getElementById("aiChatButton");
const aiChatWindow = document.getElementById("aiChatWindow");
const aiChatClose = document.getElementById("aiChatClose");

function openAIChat() {
    aiChatWindow.classList.add("active");

    aiChatButton.setAttribute("aria-expanded", "true");
    aiChatWindow.setAttribute("aria-hidden", "false");
}

function closeAIChat() {
    aiChatWindow.classList.remove("active");

    aiChatButton.setAttribute("aria-expanded", "false");
    aiChatWindow.setAttribute("aria-hidden", "true");
}

aiChatButton.addEventListener("click", () => {
    const isOpen = aiChatWindow.classList.contains("active");

    if (isOpen) {
        closeAIChat();
    } else {
        openAIChat();
    }
});

aiChatClose.addEventListener("click", () => {
    closeAIChat();
});
