const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_Key = "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";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-colors");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode" ;

    const defaultText = `<div class = "default-text">
                          <h1>ChatBot </h1>
                          <p> "Connecting thoughts, one message at a time." </p>
                        </div> `

    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
}

loadDataFromLocalStorage();

const createElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat",className);
    chatDiv.innerHTML = html;
    return chatDiv;
}

const getChatResponse = async(incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    const requestOptions = {
        method : "POST",
        headers : {
           "Content-Type" : "application/json",
           "Authorization" : `Bearer ${API_Key}`
        },
        body : JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            stop: null,
            n : 1
        })
    }

    try {
        const response = await (await fetch(API_URL,requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch(error){
        pElement.classList.add("error");
        pElement.textContent = "Oop!! Something went wrong while retriving response. Please try again later.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats" , chatContainer.innerHTML);

}

const showTypingAnimation = () => {
    const html = `<div class = "chat-content">
    <div class = "chat-details">
        <span class = "material-icons icon">smart_toy</span>
        <div class = "typing-animation">
            <div class = "typing-dots" style="--delay: 0.2s"></div>
            <div class = "typing-dots" style="--delay: 0.3s"></div>
            <div class = "typing-dots" style="--delay: 0.4s"></div>
        </div>
    </div>
    <span class = "material-icons material-symbols-rounded" onclick = "copyResponse(this)">content_copy</span>
</div>`;
const incomingChatDiv = createElement(html , "incoming");
chatContainer.appendChild(incomingChatDiv);
chatContainer.scrollTo(0, chatContainer.scrollHeight);
getChatResponse(incomingChatDiv);
}

const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() =>  copyBtn.textContent = "content_copy", 1000);
}


const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if(!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;

    const html = `<div class = "chat-content">
                    <div class = "chat-details">
                        <i class="fa-solid fa-user icon"></i>
                        <p class = "user-para"></p>
                    </div>
                   </div>`;
    const outgoingChatDiv = createElement(html , "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation , 500);
}

themeButton.addEventListener("click" , () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-colors", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode" ;
});

deleteButton.addEventListener("click" , () => {
    if(confirm("Are you sure to delete all chats?")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
});

chatInput.addEventListener("input" , () => {
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
})

chatInput.addEventListener("keydown" , () => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
        e.preventDefault();
        handleOutgoingChat();
    }
})

sendButton.addEventListener("click", handleOutgoingChat);