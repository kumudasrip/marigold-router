const STORAGE_KEY = "marigold-router-memories";
const seededMemories = [
  {id:"seed-1", title:"The cardamom tea ritual", body:"Every Sunday, she warmed the cups before pouring tea. The kitchen smelled of cardamom and toasted sugar, and everyone knew to stay a little longer.", type:"story", year:"circa 1998", source:"Meera, remembered at home", tags:["kitchen","ritual","belonging"]},
  {id:"seed-2", title:"A yellow sari in the garden", body:"A photograph from the jasmine garden. She wore the yellow sari with the tiny blue border and held the first flowers of the season.", type:"photo", year:"2004", source:"Family photograph", tags:["garden","photograph","joy"]},
  {id:"seed-3", title:"The radio at dusk", body:"He always turned the radio on just before sunset. The old songs made the whole house feel like it had exhaled.", type:"story", year:"childhood", source:"Arun, voice note transcript", tags:["music","home","dusk"]}
];

let memories = loadMemories();
const $ = (selector) => document.querySelector(selector);

function loadMemories() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : seededMemories;
  } catch (error) {
    console.warn("Memories could not be loaded; using demo memories.", error);
    return seededMemories;
  }
}

function saveMemories() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    $("#lastSaved").textContent = `saved locally · ${new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}`;
  } catch (error) {
    console.error("Memories could not be saved.", error);
    $("#lastSaved").textContent = "local save unavailable";
  }
}

function renderMemories() {
  const grid = $("#memoryGrid");
  $("#memoryCount").textContent = memories.length;
  $("#sourceCount").textContent = memories.filter(memory => memory.source || memory.image).length;
  $("#emptyState").hidden = memories.length > 0;
  grid.innerHTML = memories.map(memory => `
    <article class="memory-card">
      <button class="delete-memory" data-id="${escapeHtml(memory.id)}" aria-label="Remove ${escapeHtml(memory.title)}">×</button>
      ${memory.image && memory.attachmentType !== "audio" ? `<img class="memory-image" src="${memory.image}" alt="">` : `<div class="memory-placeholder">${memory.type === "voice" || memory.attachmentType === "audio" ? "◌" : "⌁"}</div>`}
      <h4>${escapeHtml(memory.title)}</h4>
      <p>${escapeHtml(memory.body)}</p>
      <div class="memory-meta"><span>${escapeHtml(memory.year || "undated")}</span><span>${escapeHtml((memory.tags || [memory.type])[0])}</span></div>
    </article>`).join("");
  grid.querySelectorAll(".delete-memory").forEach(button => button.addEventListener("click", () => {
    memories = memories.filter(memory => memory.id !== button.dataset.id);
    saveMemories();
    renderMemories();
  }));
}

function curateMemory(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  const dictionary = {kitchen:["kitchen","cook","tea","recipe","bread","food"], music:["song","radio","music","sing"], garden:["garden","flower","jasmine","tree"], ritual:["every","always","sunday","morning","ritual"], belonging:["home","family","together","house"], photograph:["photo","picture","sari","wear"], joy:["laugh","smile","joy","happy"]};
  const tags = Object.entries(dictionary).filter(([, words]) => words.some(word => text.includes(word))).map(([tag]) => tag);
  return tags.length ? tags.slice(0, 3) : ["memory", "belonging"];
}

function answerGuide(question) {
  const normalized = question.toLowerCase();
  const terms = normalized.split(/\W+/).filter(term => term.length > 3);
  const matches = memories.filter(memory => terms.some(term => `${memory.title} ${memory.body} ${(memory.tags || []).join(" ")}`.toLowerCase().includes(term)));
  if (!matches.length) return {text:"This memory is not in the ofrenda yet. I won't fill the silence with a guess — try adding a story, photograph, or voice note that speaks to it.", citations:[]};
  const selected = matches.slice(0, 2);
  return {text:`I found ${selected.length === 1 ? "one memory" : `${selected.length} memories`} that may help. ${selected.map(memory => memory.body).join(" ")}`, citations:selected};
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[character]));
}

function addChatMessage(text, isUser, citations = []) {
  const message = document.createElement("div");
  message.className = `message ${isUser ? "user-message" : "guide-message"}`;
  message.innerHTML = isUser ? `<p>${escapeHtml(text)}</p>` : `<span class="message-avatar">⌁</span><div><p>${escapeHtml(text)}</p>${citations.length ? `<small>source: ${citations.map(item => escapeHtml(item.title)).join(" · ")}</small>` : "<small>grounded in your ofrenda</small>"}</div>`;
  $("#chatMessages").appendChild(message);
  message.scrollIntoView({behavior:"smooth", block:"nearest"});
}

$("#memoryForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const file = $("#memoryAttachment").files[0];
  const memory = {id:`memory-${Date.now()}`, title:form.get("title"), body:form.get("body"), type:form.get("type"), year:form.get("year"), source:form.get("source") || "added privately", tags:curateMemory(form.get("title"), form.get("body"))};
  const finish = image => { memory.image = image; memory.attachmentType = file?.type.startsWith("audio") ? "audio" : "image"; memories.unshift(memory); saveMemories(); renderMemories(); event.currentTarget.reset(); location.hash = "ofrenda"; };
  if (file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => finish(reader.result));
    reader.readAsDataURL(file);
  } else finish("");
});

$("#guideForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("#guideQuestion");
  const question = input.value.trim();
  if (!question) return;
  addChatMessage(question, true);
  const answer = answerGuide(question);
  window.setTimeout(() => addChatMessage(answer.text, false, answer.citations), 220);
  input.value = "";
});

document.querySelectorAll(".suggested-questions button").forEach(button => button.addEventListener("click", () => {
  $("#guideQuestion").value = button.textContent;
  $("#guideForm").requestSubmit();
}));

$("#resetDemo").addEventListener("click", () => {
  if (window.confirm("Restore the three sample memories?")) {
    memories = seededMemories.map(memory => ({...memory}));
    saveMemories();
    renderMemories();
  }
});

function exportMemorial() {
  const cards = memories.map(memory => `<article class="memory">${memory.image && memory.attachmentType !== "audio" ? `<img src="${memory.image}" alt="" style="max-width:100%;max-height:260px;object-fit:cover">` : ""}<h2>${escapeHtml(memory.title)}</h2><p>${escapeHtml(memory.body)}</p><small>${escapeHtml(memory.year || "undated")} · ${escapeHtml(memory.source || "private source")}</small><p class="tags">${escapeHtml((memory.tags || []).map(tag => `#${tag}`).join(" "))}</p></article>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Marigold Router memorial</title><style>body{background:#e9e4da;color:#30403d;font:16px Arial;max-width:850px;margin:0 auto;padding:60px 25px}h1{font:italic 52px Georgia;color:#547a72}h2{font:26px Georgia;color:#bf7454}.memory{border-top:1px solid #c8d0ca;padding:26px 0;line-height:1.7}.memory small,.tags{color:#71827d;font-size:12px}header{border-bottom:1px solid #c8d0ca;padding-bottom:25px}footer{margin-top:50px;color:#71827d;font-size:12px}</style></head><body><header><p>⌁ MARIGOLD / ROUTER</p><h1>A record of love,<br>not a reconstruction.</h1><p>This self-contained memorial was exported from a private device. The Guide will not invent what is not here.</p></header><main>${cards || "<p>No memories have been added yet.</p>"}</main><footer>All stories remain yours. Use with consent and care.</footer></body></html>`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([html], {type:"text/html"}));
  link.download = "marigold-memorial.html";
  link.click();
  URL.revokeObjectURL(link.href);
}
$("#exportButton").addEventListener("click", exportMemorial);
renderMemories();
