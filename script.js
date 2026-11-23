const districtSelect=document.getElementById('districtFilter');
const zones=[...new Set(gyms.map(g=>g.zone))].sort((a,b)=>a.localeCompare(b,'es'));
zones.forEach(d=>{const o=document.createElement('option');o.value=d;o.textContent=d;districtSelect.appendChild(o)});
const searchInput=document.getElementById('searchInput'),typeFilter=document.getElementById('typeFilter'),priceFilter=document.getElementById('priceFilter');
const gymList=document.getElementById('gymList'),resultCount=document.getElementById('resultCount'),mapCount=document.getElementById('mapCount'),emptyState=document.getElementById('emptyState');
let map,markers={},activeId=null;
const colors={Gym:'#c96c8c',Pilates:'#e6a1b7',CrossFit:'#82617d',Cycling:'#d59b63',Boutique:'#b17a91'};
function initMap(){
 if(!window.L)return;
 map=L.map('map',{scrollWheelZoom:false}).setView([40.4215,-3.695],12);
 // OpenStreetMap standard tiles: no API key required.
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ',maxZoom:19}).addTo(map);
 gyms.forEach(g=>{
   const c=colors[g.category]||colors.Gym;
   const icon=L.divIcon({className:'',html:`<div class="custom-pin" style="background:${c}"><span>${g.id}</span></div>`,iconSize:[27,27],iconAnchor:[13,26],popupAnchor:[0,-24]});
   const marker=L.marker([g.lat,g.lng],{icon}).addTo(map);
   marker.bindPopup(`<div class="popup-title">${g.name}</div><div class="popup-address">${g.address}</div><div class="popup-price">${g.priceLabel}</div>`);
   marker.on('click',()=>highlightCard(g.id));
   markers[g.id]=marker;
 });
}
function filteredGyms(){
 const q=searchInput.value.trim().toLocaleLowerCase('es'),t=typeFilter.value,d=districtSelect.value,p=priceFilter.value;
 return gyms.filter(g=>{
  const text=[g.name,g.address,g.zone,g.activity,g.category].join(' ').toLocaleLowerCase('es');
  const matchesQ=!q||text.includes(q),matchesT=!t||g.category===t,matchesD=!d||g.zone===d;
  let matchesP=true;if(p==='40')matchesP=g.price<=40;else if(p==='70')matchesP=g.price<=70;else if(p==='120')matchesP=g.price<=120;else if(p==='999')matchesP=g.price>120;
  return matchesQ&&matchesT&&matchesD&&matchesP;
 });
}
function render(){
 const list=filteredGyms();
 gymList.innerHTML='';
 list.forEach(g=>{
  const card=document.createElement('article');card.className='gym-card'+(activeId===g.id?' active':'');card.dataset.id=g.id;
  const note=g.priceNote;
  const safeUrl=g.url?`<a href="${g.url}" target="_blank" rel="noopener">Web oficial ↗</a>`:'';
  const mapsUrl='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(g.address);
  card.innerHTML=`<div class="gym-number">${String(g.id).padStart(2,'0')}</div><div class="gym-main"><h3>${g.name}</h3><p>${g.address}</p><div class="gym-tags"><span class="tag">${g.category}</span><span class="tag">${g.zone}</span><span class="tag activity-tag">${g.activity}</span></div><div class="gym-actions">${safeUrl}<a href="${mapsUrl}" target="_blank" rel="noopener">Cómo llegar ↗</a></div></div><div class="gym-price">${g.priceLabel}<small>${note}</small></div>`;
  card.addEventListener('click',e=>{if(e.target.closest('a'))return;focusGym(g.id)});
  gymList.appendChild(card);
 });
 emptyState.hidden=list.length!==0;
 resultCount.textContent=`${list.length} ${list.length===1?'lugar':'lugares'}`;
 mapCount.textContent=`${list.length} pins`;
 document.getElementById('resultsTitle').textContent=list.length===gyms.length?'Lugares para descubrir': 'Resultados de tu búsqueda';
 Object.entries(markers).forEach(([id,m])=>{const visible=list.some(g=>g.id===Number(id));if(visible){if(!map.hasLayer(m))m.addTo(map)}else if(map.hasLayer(m))map.removeLayer(m)});
 if(list.length&&map&&list.length<gyms.length){const group=L.featureGroup(list.map(g=>markers[g.id]));map.fitBounds(group.getBounds().pad(.18),{maxZoom:13})}
 else if(map&&list.length===gyms.length)map.setView([40.4215,-3.695],12);
}
function highlightCard(id){activeId=id;document.querySelectorAll('.gym-card').forEach(c=>c.classList.toggle('active',Number(c.dataset.id)===id));const el=document.querySelector(`.gym-card[data-id="${id}"]`);if(el)el.scrollIntoView({block:'nearest',behavior:'smooth'})}
function focusGym(id){activeId=id;const g=gyms.find(x=>x.id===id);if(!g)return;map.setView([g.lat,g.lng],15,{animate:true});markers[id].openPopup();render();highlightCard(id)}
[searchInput,typeFilter,districtSelect,priceFilter].forEach(el=>el.addEventListener(el===searchInput?'input':'change',render));
document.getElementById('clearFilters').addEventListener('click',()=>{searchInput.value='';typeFilter.value='';districtSelect.value='';priceFilter.value='';activeId=null;render()});
document.getElementById('totalPlaces').textContent=gyms.length;
initMap();render();


// DAILY INSPIRATION
// The same quote is shown to every visitor on a given local calendar day.
const dailyQuotes = [
  "Progress, not perfection.",
  "Small steps still move you forward.",
  "Your body deserves kindness, not punishment.",
  "Move your body, lift your spirit.",
  "Your journey is your own.",
  "You are stronger than you think.",
  "Consistency grows one day at a time.",
  "Make time for the things that make you feel alive.",
  "You do not have to be perfect. Just keep showing up.",
  "A little progress each day adds up.",
  "Rest is part of the process, too.",
  "Find movement that makes you feel good.",
  "Celebrate what your body can do.",
  "You can always begin again."
];

const dailyQuoteElement = document.getElementById("dailyQuote");
const newQuoteButton = document.getElementById("newQuote");

if (dailyQuoteElement && newQuoteButton) {
  const today = new Date();
  const dayNumber = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000
  );
  let currentQuoteIndex = ((dayNumber % dailyQuotes.length) + dailyQuotes.length) % dailyQuotes.length;

  function showDailyQuote(index) {
    dailyQuoteElement.textContent = dailyQuotes[index];
  }

  showDailyQuote(currentQuoteIndex);

  newQuoteButton.addEventListener("click", () => {
    currentQuoteIndex = (currentQuoteIndex + 1) % dailyQuotes.length;
    showDailyQuote(currentQuoteIndex);
  });
}
