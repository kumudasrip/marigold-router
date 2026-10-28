const STORAGE_KEY = "marigold-router-memories";
const seededMemories = [
  {id:"seed-1",title:"The cardamom tea ritual",body:"Every Sunday, she warmed the cups before pouring tea. The kitchen smelled of cardamom and toasted sugar, and everyone knew to stay a little longer.",type:"story",year:"circa 1998",source:"Meera, remembered at home",tags:["kitchen","ritual","belonging"]},
  {id:"seed-2",title:"A yellow sari in the garden",body:"A photograph from the jasmine garden. She wore the yellow sari with the tiny blue border and held the first flowers of the season.",type:"photo",year:"2004",source:"Family photograph",tags:["garden","photograph","joy"]},
  {id:"seed-3",title:"The radio at dusk",body:"He always turned the radio on just before sunset. The old songs made the whole house feel like it had exhaled.",type:"story",year:"childhood",source:"Arun, voice note transcript",tags:["music","home","dusk"]}
];
let memories = loadMemories();
let activeFilter = "all";
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function loadMemories() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(saved) ? saved : seededMemories.map(item => ({...item})); }
  catch (error) { console.warn("Local archive unavailable; showing demo memories.", error); return seededMemories.map(item => ({...item})); }
}
function saveMemories() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memories)); }
  catch (error) { console.error("Could not save local archive.", error); }
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char])); }
function curateMemory(title, body) {
  const text = `${title} ${body}`.toLowerCase();
  const dictionary = {kitchen:["kitchen","cook","tea","recipe","bread","food"], music:["song","radio","music","sing"], garden:["garden","flower","jasmine","tree"], ritual:["every","always","sunday","morning","ritual"], belonging:["home","family","together","house"], photograph:["photo","picture","sari","wear"], joy:["laugh","smile","joy","happy"]};
  const tags = Object.entries(dictionary).filter(([, words]) => words.some(word => text.includes(word))).map(([tag]) => tag);
  return tags.length ? tags.slice(0, 3) : ["memory","belonging"];
}
function visibleMemories() {
  const query = ($("#archiveSearch")?.value || "").trim().toLowerCase();
  return memories.filter(memory => (activeFilter === "all" || memory.type === activeFilter) && (!query || `${memory.title} ${memory.body} ${(memory.tags || []).join(" ")}`.toLowerCase().includes(query)));
}
function renderArchive() {
  const items = visibleMemories();
  $("#heroCount").textContent = memories.length;
  $("#timelineCount").textContent = memories.length;
  $("#archiveGrid").innerHTML = items.length ? items.map(memory => `
    <article class="archive-card" data-id="${escapeHtml(memory.id)}">
      <div class="archive-card-media">${memory.image && memory.attachmentType !== "audio" ? `<img src="${memory.image}" alt="" style="width:100%;height:100%;object-fit:cover">` : memory.type === "voice" || memory.attachmentType === "audio" ? "◌" : "⌁"}</div>
      <h3>${escapeHtml(memory.title)}</h3><p>${escapeHtml(memory.body)}</p>
      <div class="archive-meta"><span>${escapeHtml(memory.year || "undated")}</span><span>${escapeHtml((memory.tags || [memory.type])[0])}</span></div>
    </article>`).join("") : `<div class="no-results"><h3>No memory found here.</h3><p>The honest archive has room for what is still missing.</p></div>`;
  $$(".archive-card").forEach(card => card.addEventListener("click", () => openDrawer(card.dataset.id)));
  renderTimeline();
}
function renderTimeline() {
  const timeline = $("#miniTimeline");
  timeline.innerHTML = memories.slice(0, 3).map(memory => `<div class="timeline-point"><b>${escapeHtml(memory.year || "undated")}</b>${escapeHtml(memory.title)}</div>`).join("");
}
function openDrawer(id) {
  const memory = memories.find(item => item.id === id);
  if (!memory) return;
  $("#drawerContent").innerHTML = `<div class="drawer-media">${memory.image && memory.attachmentType !== "audio" ? `<img src="${memory.image}" alt="" style="width:100%;height:100%;object-fit:cover">` : memory.type === "voice" || memory.attachmentType === "audio" ? "◌" : "⌁"}</div><p class="kicker"><span></span> ${escapeHtml(memory.type)} memory</p><h2>${escapeHtml(memory.title)}</h2><p class="drawer-body">${escapeHtml(memory.body)}</p><div class="drawer-source">SOURCE<br><strong>${escapeHtml(memory.source || "private archive")}</strong><br><br>${escapeHtml(memory.year || "undated")} · ${(memory.tags || []).map(tag => `#${escapeHtml(tag)}`).join(" ")}</div><button class="text-button delete-from-drawer" data-id="${escapeHtml(id)}">Remove from archive ×</button>`;
  $("#memoryDrawer").hidden = false;
  $(".delete-from-drawer").addEventListener("click", () => { memories = memories.filter(item => item.id !== id); saveMemories(); closeDrawer(); renderArchive(); });
}
function closeDrawer() { $("#memoryDrawer").hidden = true; }
function answerGuide(question) {
  const rawTerms = question.toLowerCase().split(/\W+/).filter(term => term.length > 3);
  const intentMap = {cook:"kitchen", cooking:"kitchen", recipe:"kitchen", food:"kitchen", love:"belonging", loved:"belonging", song:"music", songs:"music", sing:"music", flower:"garden", flowers:"garden"};
  const terms = [...new Set(rawTerms.flatMap(term => [term, intentMap[term]].filter(Boolean)))];
  const matches = memories.filter(memory => terms.some(term => `${memory.title} ${memory.body} ${(memory.tags || []).join(" ")}`.toLowerCase().includes(term)));
  if (!matches.length) return {text:"That memory is not in the archive yet. I won't fill the silence with a guess — try adding a story, photograph, or voice note that speaks to it.", citations:[]};
  return {text:`I found ${matches.length === 1 ? "one memory" : `${matches.length} memories`} that may help. ${matches.slice(0,2).map(memory => memory.body).join(" ")}`, citations:matches.slice(0,2)};
}
function addChatMessage(text, isUser, citations = []) {
  const message = document.createElement("div");
  message.className = `chat-message ${isUser ? "user-message" : "guide-message"}`;
  message.innerHTML = isUser ? `<p>${escapeHtml(text)}</p>` : `<span class="chat-avatar">⌁</span><div><p>${escapeHtml(text)}</p><small>${citations.length ? `source: ${citations.map(item => escapeHtml(item.title)).join(" · ")}` : "no memory is invented here"}</small></div>`;
  $("#chatMessages").appendChild(message);
  message.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function closeModal() { $("#memoryModal").hidden = true; }
function openModal() { $("#memoryModal").hidden = false; $("#memoryModal input").focus(); }
function exportMemorial() {
  const cards = memories.map(memory => `<article class="memory">${memory.image && memory.attachmentType !== "audio" ? `<img src="${memory.image}" alt="" style="max-width:100%;max-height:260px;object-fit:cover">` : ""}<h2>${escapeHtml(memory.title)}</h2><p>${escapeHtml(memory.body)}</p><small>${escapeHtml(memory.year || "undated")} · ${escapeHtml(memory.source || "private source")}</small><p>${escapeHtml((memory.tags || []).map(tag => `#${tag}`).join(" "))}</p></article>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Marigold memorial</title><style>@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap');:root{--ink:#301d22;--muted:#845548;--paper:#fbf0d7;--red:#4b1820;--orange:#e65b27;--gold:#f2c242;--line:#d89a50}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.7 "DM Sans",Arial,sans-serif}body:before{content:"";display:block;height:16px;background:linear-gradient(135deg,transparent 10px,var(--orange) 0) 0 0/32px 18px repeat-x}main,header,footer{max-width:900px;margin:auto;padding-left:28px;padding-right:28px}header{padding-top:64px;padding-bottom:38px;border-bottom:1px solid var(--line)}header>p:first-child{color:var(--red);font:12px "DM Mono",monospace;letter-spacing:.13em;text-transform:uppercase}h1{color:var(--red);font:600 clamp(54px,8vw,92px)/.84 "Cormorant Garamond",Georgia,serif;letter-spacing:-.05em;margin:38px 0 28px}header>p:last-child{color:var(--muted);max-width:650px}main{padding-top:18px}.memory{position:relative;border-bottom:1px solid var(--line);padding:38px 20px 36px 0}.memory:before{content:"";position:absolute;left:-28px;top:48px;width:10px;height:10px;border-radius:50%;background:var(--orange);box-shadow:0 0 0 5px #f7d98a}.memory:nth-child(2n){background:#f8e5be;padding-left:20px;margin-left:-20px}.memory h2{color:var(--red);font:600 36px/1 "Cormorant Garamond",Georgia,serif;margin:0 0 14px}.memory p{max-width:700px}.memory img{display:block;border:8px solid #fff0bd;box-shadow:7px 8px 0 #c3462c;margin-bottom:20px}.memory small{color:var(--muted);font:11px "DM Mono",monospace}.memory p:last-child{color:var(--orange);font:11px "DM Mono",monospace}footer{padding-top:45px;padding-bottom:60px;color:var(--muted);font:11px "DM Mono",monospace}footer:before{content:"✦  ✦  ✦";display:block;color:var(--gold);font-size:18px;margin-bottom:20px}@media(max-width:600px){main,header,footer{padding-left:22px;padding-right:22px}header{padding-top:46px}.memory:nth-child(2n){margin-left:-10px;padding-left:14px}h1{font-size:58px}}</style></head><body><header><p>⌁ Marigold / Router</p><h1>A record of love,<br>not a reconstruction.</h1><p>This private archive was exported from a local device. The Guide will not invent what is not here.</p></header><main>${cards || "<p>No memories have been added yet.</p>"}</main><footer>All stories remain yours. Use with consent and care.</footer></body></html>`;
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([html], {type:"text/html"})); link.download = "marigold-archive.html"; link.click(); URL.revokeObjectURL(link.href);
}
$("#openMemoryModal").addEventListener("click", openModal);
$("#closeMemoryModal").addEventListener("click", closeModal);
$("#memoryModal").addEventListener("click", event => { if (event.target === $("#memoryModal")) closeModal(); });
$("#closeDrawer").addEventListener("click", closeDrawer);
$("#memoryForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget); const file = $("#memoryAttachment").files[0];
  const memory = {id:`memory-${Date.now()}`,title:form.get("title"),body:form.get("body"),type:form.get("type"),year:form.get("year"),source:form.get("source") || "added privately",tags:curateMemory(form.get("title"),form.get("body"))};
  const finish = data => { memory.image = data; memory.attachmentType = file?.type.startsWith("audio") ? "audio" : "image"; memories.unshift(memory); saveMemories(); renderArchive(); event.currentTarget.reset(); closeModal(); location.hash = "archive"; };
  if (file) { const reader = new FileReader(); reader.addEventListener("load", () => finish(reader.result)); reader.readAsDataURL(file); } else finish("");
});
$("#archiveSearch").addEventListener("input", renderArchive);
$$(".filter-button").forEach(button => button.addEventListener("click", () => { $$(".filter-button").forEach(item => item.classList.remove("active")); button.classList.add("active"); activeFilter = button.dataset.filter; renderArchive(); }));
$("#guideForm").addEventListener("submit", event => { event.preventDefault(); const input = $("#guideQuestion"); const question = input.value.trim(); if (!question) return; addChatMessage(question,true); input.value = ""; const answer = answerGuide(question); window.setTimeout(() => addChatMessage(answer.text,false,answer.citations),220); });
$$(".guide-suggestions button").forEach(button => button.addEventListener("click", () => { $("#guideQuestion").value = button.textContent; $("#guideForm").requestSubmit(); }));
$("#runCurator").addEventListener("click", () => { $("#aiStatus").textContent = "Reading your archive locally…"; window.setTimeout(() => { const tags = [...new Set(memories.flatMap(memory => memory.tags || []))].slice(0,5); $("#aiTags").innerHTML = tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join(""); $("#aiStatus").textContent = `${memories.length} memories reviewed. No data left this device.`; },450); });
$("#processTranscript").addEventListener("click", () => { const text = $("#transcriptInput").value.trim(); $("#transcriptResult").textContent = text ? `Ready to index: “${text.slice(0,120)}${text.length > 120 ? "…" : ""}”` : "Add a transcript first. Your words will remain unchanged."; });
$("#exportButton").addEventListener("click", exportMemorial);
$("#railExport").addEventListener("click", exportMemorial);
$("#resetDemo").addEventListener("click", () => { if (confirm("Restore the three sample memories?")) { memories = seededMemories.map(item => ({...item})); saveMemories(); renderArchive(); } });
renderArchive();
