const mainScreen = document.getElementById('main-screen');
const chatScreen = document.getElementById('chat-screen');
const chatTitle = document.getElementById('chat-title');
const chatBody = document.getElementById('chat-body');
const chatForm = document.getElementById('chat-form');
const chatSuggestions = document.getElementById('chat-suggestions');
const allCloseButtons = document.querySelectorAll('.btn-close');

function showChat(type) {
  mainScreen.style.display = 'none';
  chatScreen.style.display = 'flex';
  chatScreen.style.flexDirection = 'column';
  chatBody.innerHTML = '';
  chatTitle.textContent = type;
  setSuggestionColor(type);
  addMessage("Mensagem inicial do chat: " + type, "response");
}

function setSuggestionColor(type) {
  const suggestions = chatSuggestions.querySelectorAll('.suggestion');
  suggestions.forEach(s => s.classList.remove('suggestion-purple', 'suggestion-yellow', 'suggestion-green'));
  if (type === 'Conversar') suggestions.forEach(s => s.classList.add('suggestion-purple'));
  else if (type === 'Desabafar') suggestions.forEach(s => s.classList.add('suggestion-yellow'));
  else if (type === 'Dicas') suggestions.forEach(s => s.classList.add('suggestion-green'));
}

function closeChat() {
  chatScreen.style.display = 'none';
  chatBody.innerHTML = '';
  chatTitle.textContent = 'Chat';
  mainScreen.style.display = 'flex';
  mainScreen.style.flexDirection = 'column';
  mainScreen.style.justifyContent = 'center';
  mainScreen.style.alignItems = 'center';
  mainScreen.style.height = '100vh';
}

function addMessage(text, type) {
  const div = document.createElement('div');
  div.classList.add('message', type);
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

chatSuggestions.addEventListener('click', e => {
  if (e.target.classList.contains('suggestion')) {
    addMessage(e.target.textContent, 'user');
  }
});

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = chatForm.querySelector('input');
  if (input.value.trim() !== '') {
    addMessage(input.value.trim(), 'user');
    input.value = '';
  }
});

document.getElementById('btn-conversar').addEventListener('click', () => showChat('Conversar'));
document.getElementById('btn-desabafar').addEventListener('click', () => showChat('Desabafar'));
document.getElementById('btn-dicas').addEventListener('click', () => showChat('Dicas'));

allCloseButtons.forEach(btn => btn.addEventListener('click', closeChat));
