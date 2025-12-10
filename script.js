// Gemini Configuration
const API_KEY = "AIzaSyCo2-vFw19t8mqOMDCnaAscbm5WKk0Vipg";

const mainScreen = document.getElementById("main-screen");
const chatScreen = document.getElementById("chat-screen");
const chatTitle = document.getElementById("chat-title");
const chatBody = document.getElementById("chat-body");
const chatForm = document.getElementById("chat-form");
const chatSuggestions = document.getElementById("chat-suggestions");
const allCloseButtons = document.querySelectorAll(".btn-close");

let currentChatType = "";
const MAX_MESSAGES = 10;
const chatHistory = [];

// Configurações de segurança e mensagens
const TRIGGER_WORDS = [
  "suicídio",
  "suicida",
  "matar",
  "morrer",
  "morte",
  "acabar com tudo",
  "sem saída",
  "machucar",
  "cortar",
  "overdose",
  "não aguento mais",
  "desistir",
  "abandonar",
  "sem esperança",
];

const EMERGENCY_CONTACTS = {
  CVV: "188",
  SAMU: "192",
  POLICIA: "190",
};

const SUGGESTIONS = {
  Conversar: [
    "Como foi seu dia hoje?",
    "Quero compartilhar algo legal",
    "Preciso de alguém para conversar",
    "Me conte mais sobre você",
  ],
  Desabafar: [
    "Estou me sentindo triste",
    "Tive um dia difícil",
    "Preciso falar sobre algo pessoal",
    "Estou preocupado(a) com...",
  ],
  Dicas: [
    "Como posso melhorar meu sono?",
    "Dicas para ansiedade",
    "Como me concentrar melhor",
    "Atividades para relaxar",
  ],
};

function getWelcomeMessage(type) {
  const messages = {
    Conversar: "Oi! Estou aqui para conversar com você. Como posso ajudar?",
    Desabafar:
      "Este é um espaço seguro para você compartilhar seus sentimentos. Como está se sentindo?",
    Dicas:
      "Posso tentar ajudar com algumas sugestões. Sobre qual área você gostaria de conversar?",
  };
  return messages[type] || "Olá! Como posso ajudar?";
}

function getDisclaimerMessage() {
  return (
    "⚠️ Importante: Sou um assistente virtual e não um profissional de saúde mental. " +
    "Para questões sérias, por favor procure ajuda profissional. Em emergências, ligue 188 (CVV)."
  );
}

function updateSuggestions(type) {
  const suggestions = SUGGESTIONS[type] || [];
  const suggestionElements = chatSuggestions.querySelectorAll(".suggestion");
  suggestionElements.forEach((element, index) => {
    if (suggestions[index]) {
      element.textContent = suggestions[index];
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  });
}
async function getAIResponse(message) {
  const systemPrompt = getSystemPrompt();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                ...chatHistory
                  .slice(-MAX_MESSAGES)
                  .map((msg) => ({ text: `${msg.role}: ${msg.content}` })),
                { text: `Usuário: ${message}` },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    chatHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: aiResponse }
    );

    return aiResponse;
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "Desculpe, estou tendo dificuldades para responder. Por favor, tente novamente em alguns momentos.";
  }
}

function getSystemPrompt() {
  const basePrompt = `Você é um assistente amigável e solidário do app Mente Jovem.
Diretrizes importantes:
- Você NÃO é um profissional de saúde mental
- Mantenha um tom acolhedor mas nunca dê conselhos médicos
- Foque em escuta ativa e suporte emocional básico
- Sugira atividades positivas e saudáveis
- Se detectar conteúdo preocupante, recomende ajuda profissional
- Mantenha respostas curtas e claras
- Use linguagem simples e acessível
- Seja sempre honesto sobre suas limitações

Tipo atual de conversa: ${currentChatType}`;

  const specificPrompts = {
    Conversar:
      "Mantenha um tom leve e amigável, focando em assuntos do dia a dia.",
    Desabafar:
      "Demonstre empatia e compreensão, mas evite dar conselhos específicos.",
    Dicas:
      "Ofereça sugestões gerais e práticas para bem-estar, sempre reforçando que são apenas dicas básicas.",
  };

  return `${basePrompt}\n\n${specificPrompts[currentChatType] || ""}`;
}

function checkForTriggers(message) {
  const lowercaseMsg = message.toLowerCase();
  const triggers = TRIGGER_WORDS.some((word) => lowercaseMsg.includes(word));

  if (triggers) {
    showEmergencyAlert();
    return true;
  }
  return false;
}

function showEmergencyAlert() {
  const alertHtml = `
    <div class="emergency-alert">
      <h2>❗ Precisamos da sua atenção</h2>
      <p>Percebemos que você pode estar passando por um momento difícil. 
         É muito importante buscar ajuda profissional neste momento.</p>
      <div class="emergency-contacts">
        <p><strong>Contatos de Emergência:</strong></p>
        <ul>
          <li>CVV (Centro de Valorização da Vida): 188</li>
          <li>SAMU: 192</li>
          <li>Polícia: 190</li>
        </ul>
      </div>
      <p>Você não está sozinho(a). Há pessoas preparadas para te ajudar.</p>
    </div>
  `;

  chatBody.innerHTML += alertHtml;
  chatForm.style.display = "none";
  chatSuggestions.style.display = "none";
}

function showChat(type) {
  mainScreen.style.display = "none";
  chatScreen.style.display = "flex";
  chatBody.innerHTML = "";
  currentChatType = type;
  chatHistory.length = 0;
  setSuggestionColor(type);
  updateSuggestions(type);
  addMessage(getWelcomeMessage(type), "response");
  addMessage(getDisclaimerMessage(), "system");
}

function setSuggestionColor(type) {
  const suggestions = chatSuggestions.querySelectorAll(".suggestion");
  suggestions.forEach((s) =>
    s.classList.remove(
      "suggestion-purple",
      "suggestion-yellow",
      "suggestion-green"
    )
  );
  if (type === "Conversar")
    suggestions.forEach((s) => s.classList.add("suggestion-purple"));
  else if (type === "Desabafar")
    suggestions.forEach((s) => s.classList.add("suggestion-yellow"));
  else if (type === "Dicas")
    suggestions.forEach((s) => s.classList.add("suggestion-green"));
}

function closeChat() {
  chatScreen.style.display = "none";
  chatBody.innerHTML = "";
  chatTitle.textContent = "Chat";
  mainScreen.style.display = "flex";
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.classList.add("message", type);
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

chatSuggestions.addEventListener("click", async (e) => {
  if (e.target.classList.contains("suggestion")) {
    const message = e.target.textContent;
    addMessage(message, "user");

    if (checkForTriggers(message)) {
      return; // Execução interrompida se gatilhos forem detectados
    }

    chatSuggestions.style.display = "none";

    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.textContent = "Digitando...";
    chatBody.appendChild(typingIndicator);

    try {
      const response = await getAIResponse(message);
      typingIndicator.remove();
      addMessage(response, "response");
    } catch (error) {
      typingIndicator.remove();
      addMessage(
        "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        "system"
      );
    }
  }
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = chatForm.querySelector("input");
  const message = input.value.trim();

  if (message !== "") {
    // Desabilitar input durante o processamento
    input.disabled = true;
    const submitButton = chatForm.querySelector("button");
    submitButton.disabled = true;

    addMessage(message, "user");
    input.value = "";

    if (checkForTriggers(message)) {
      input.disabled = false;
      submitButton.disabled = false;
      return; // Execução interrompida se gatilhos forem detectados
    }

    // Adicionar indicador de digitação
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.textContent = "Digitando...";
    chatBody.appendChild(typingIndicator);

    try {
      const response = await getAIResponse(message);
      typingIndicator.remove();
      addMessage(response, "response");
    } catch (error) {
      typingIndicator.remove();
      addMessage(
        "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        "system"
      );
    }

    // Reabilitar input
    input.disabled = false;
    submitButton.disabled = false;
    input.focus();
  }
});

document
  .getElementById("btn-conversar")
  .addEventListener("click", () => showChat("Conversar"));
document
  .getElementById("btn-desabafar")
  .addEventListener("click", () => showChat("Desabafar"));
document
  .getElementById("btn-dicas")
  .addEventListener("click", () => showChat("Dicas"));
allCloseButtons.forEach((btn) => btn.addEventListener("click", closeChat));



