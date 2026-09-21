const questions = [
  { id: 'contact', kicker: 'Il referente', title: 'Chi sta compilando?', detail: 'Nome della famiglia o del referente.', type: 'text', placeholder: 'Es. Famiglia Bianchi' },
  { id: 'count', kicker: 'La squadra', title: 'In quanti partecipate?', detail: 'Scegli il numero totale di persone.', type: 'count' },
  { id: 'people', kicker: 'I partecipanti', title: 'Come si chiamano?', detail: 'Inserisci tutti i nomi: gli spazi corrispondono al numero scelto prima.', type: 'people' },
  { id: 'food', kicker: 'La tavolata', title: 'Cosa portate da mangiare?', detail: 'Scegli una categoria e raccontaci cosa porterete.', type: 'food' },
  { id: 'tournament', kicker: 'Ping Pong', title: 'Chi partecipa al torneo?', detail: 'Clicca il + accanto ai nomi. Per ogni sfidante scegli adulto o bambino.', type: 'tournament' },
  { id: 'swap', kicker: 'Swap Party', title: 'Partecipate allo Swap Party?', detail: 'Una risposta semplice, cosi possiamo organizzarci.', type: 'swap' },
  { id: 'recap', kicker: 'Recap', title: 'La vostra squadra e pronta.', detail: 'Controlla i dati prima di inviare.', type: 'recap' }
];

const state = { contact: '', count: null, people: [], food: '', foodDetail: '', tournament: [], noTournament: false, swap: '' };
let step = 0;
const root = document.querySelector('#registration-flow');
const foodOptions = ['Dolce', 'Bibite', 'Carne', 'Pane', 'Contorno', 'Antipasto', 'Snack', 'Altro'];

function isComplete() {
  const q = questions[step].id;
  if (q === 'contact') return state.contact.trim().length > 0;
  if (q === 'count') return Number.isInteger(state.count);
  if (q === 'people') return state.people.length === state.count && state.people.every(name => name.trim().length > 0);
  if (q === 'food') return state.food && state.foodDetail.trim().length > 0;
  if (q === 'tournament') return state.noTournament || state.tournament.length > 0;
  if (q === 'swap') return Boolean(state.swap);
  return true;
}

function getField(q) {
  if (q.type === 'text') return `<input id="contact" class="answer" placeholder="${q.placeholder}" value="${escapeAttr(state.contact)}" oninput="state.contact=this.value; refreshButton()">`;
  if (q.type === 'count') return `<div class="count-grid">${[1,2,3,4,5,6].map(n => `<button class="count-option ${state.count === n ? 'selected' : ''}" onclick="setCount(${n})">${n}</button>`).join('')}</div>`;
  if (q.type === 'people') return `<div class="people-inputs">${Array.from({ length: state.count || 0 }, (_, i) => `<label><span>Persona ${i + 1}</span><input class="person-input" value="${escapeAttr(state.people[i] || '')}" placeholder="Nome e cognome" oninput="setPerson(${i}, this.value)"></label>`).join('')}</div>`;
  if (q.type === 'food') return `<div class="food-options">${foodOptions.map(item => `<button class="choice ${state.food === item ? 'selected' : ''}" onclick="setFood('${item}')">${item}</button>`).join('')}</div>${state.food ? `<div class="tell-more"><label for="food-detail">Dicci di piu <small>obbligatorio</small></label><textarea id="food-detail" class="open-answer" placeholder="Es. Due torte salate e una crostata..." oninput="state.foodDetail=this.value; refreshButton()">${escapeHtml(state.foodDetail)}</textarea></div>` : ''}`;
  if (q.type === 'tournament') return `<p class="tournament-count">${state.noTournament ? 'Nessun partecipante al torneo.' : `${state.tournament.length} ${state.tournament.length === 1 ? 'partecipante' : 'partecipanti'} selezionati`}</p><div class="tournament-list">${state.people.map((name, i) => tournamentRow(name, i)).join('')}</div><button class="none-button ${state.noTournament ? 'selected' : ''}" onclick="setNoTournament()">Nessuno della famiglia partecipa</button>`;
  if (q.type === 'swap') return `<div class="swap-options"><button class="swap-card ${state.swap === 'Si' ? 'selected' : ''}" onclick="setSwap('Si')">Si <span>Portiamo qualcosa da scambiare</span></button><button class="swap-card ${state.swap === 'No' ? 'selected' : ''}" onclick="setSwap('No')">No <span>Questa volta passiamo</span></button></div>`;
  return recap();
}

function tournamentRow(name, index) {
  const player = state.tournament.find(p => p.index === index);
  if (!player) return `<div class="tournament-row"><span>${escapeHtml(name)}</span><button class="plus-button" onclick="addPlayer(${index})">+</button></div>`;
  return `<div class="tournament-row active"><span>${escapeHtml(name)}</span><div class="category-toggle"><button class="${player.type === 'Adulto' ? 'selected' : ''}" onclick="setPlayerType(${index}, 'Adulto')">Adulto</button><button class="${player.type === 'Bambino' ? 'selected' : ''}" onclick="setPlayerType(${index}, 'Bambino')">Bambino</button></div><button class="remove-player" onclick="removePlayer(${index})">×</button></div>`;
}

function recap() {
  const names = state.people.map(name => `<li>${escapeHtml(name)}</li>`).join('');
  const players = state.noTournament ? 'Nessuno' : state.tournament.map(p => `${escapeHtml(state.people[p.index])} (${p.type})`).join(', ');
  return `<div class="recap-card"><div><span>Referente</span><b>${escapeHtml(state.contact)}</b></div><div><span>Partecipanti</span><b>${state.count}</b><ul>${names}</ul></div><div><span>Cibo</span><b>${escapeHtml(state.food)}</b><p>${escapeHtml(state.foodDetail)}</p></div><div><span>Ping Pong</span><b>${players}</b></div><div><span>Swap Party</span><b>${state.swap}</b></div></div>`;
}

function draw() {
  const q = questions[step];
  const progress = questions.map((_, i) => `<i class="${i <= step ? 'active' : ''}"></i>`).join('');
  root.innerHTML = `<div class="form-top"><span>${q.kicker}</span><span>${step + 1} / ${questions.length}</span></div><div class="progress">${progress}</div><h2>${q.title}</h2><p class="form-detail">${q.detail}</p><div class="registration-field ${q.type}">${getField(q)}</div><div class="form-footer"><button class="back" onclick="goBack()" ${step === 0 ? 'style="visibility:hidden"' : ''}>← Indietro</button><button class="next ${isComplete() ? '' : 'disabled'}" id="continue" onclick="goNext()" ${isComplete() ? '' : 'disabled'}>${step === questions.length - 1 ? 'Invia iscrizione ✓' : 'Continua →'}</button></div>`;
}

function refreshButton() { const button = document.querySelector('#continue'); const complete = isComplete(); button.disabled = !complete; button.classList.toggle('disabled', !complete); }
function setCount(n) { state.count = n; state.people = Array.from({ length: n }, (_, i) => state.people[i] || ''); state.tournament = state.tournament.filter(p => p.index < n); draw(); }
function setPerson(i, value) { state.people[i] = value; refreshButton(); }
function setFood(food) { state.food = food; draw(); }
function addPlayer(index) { state.noTournament = false; state.tournament.push({ index, type: 'Adulto' }); draw(); }
function removePlayer(index) { state.tournament = state.tournament.filter(p => p.index !== index); draw(); }
function setPlayerType(index, type) { state.tournament.find(p => p.index === index).type = type; draw(); }
function setNoTournament() { state.noTournament = !state.noTournament; if (state.noTournament) state.tournament = []; draw(); }
function setSwap(value) { state.swap = value; draw(); }
function goBack() { if (step > 0) { step--; draw(); } }
function goNext() { if (!isComplete()) return; if (step === questions.length - 1) { saveRegistration(); root.innerHTML = `<div class="sent-message"><b>✓</b><h2>Iscrizione inviata.</h2><p>Ci vediamo alla Bugu Cup.</p><a class="next link-button" href="index.html">Torna alla home</a></div>`; return; } step++; draw(); }
function saveRegistration() {
  const people = state.people.map((name, index) => ({ id: `${Date.now()}-${index}`, name }));
  const tournament = state.tournament.map(player => ({ personId: people[player.index].id, name: people[player.index].name, type: player.type }));
  const entry = { id: String(Date.now()), createdAt: new Date().toISOString(), contact: state.contact, people, food: state.food, foodDetail: state.foodDetail, tournament, noTournament: state.noTournament, swap: state.swap };
  const registrations = JSON.parse(localStorage.getItem('buguCupRegistrations') || '[]');
  registrations.push(entry);
  localStorage.setItem('buguCupRegistrations', JSON.stringify(registrations));
}
function escapeHtml(text) { return String(text || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]); }
function escapeAttr(text) { return escapeHtml(text); }
draw();
