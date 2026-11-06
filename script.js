// Find Your Gym — interactive prototype
// All studio listings below are fictional demonstration data, not verified businesses.

const studios = [
  {
    id: 1, name: "The Quiet Form", type: "pilates", neighborhood: "Chueca",
    address: "Illustrative location · Chueca, Madrid", price: 55, mood: "calm",
    lat: 40.4225, lng: -3.6975,
    description: "A calm, light-filled concept for mindful movement and small-group Pilates sessions.",
    classes: "Mat & reformer Pilates", symbol: "◆"
  },
  {
    id: 2, name: "District Strength", type: "weights", neighborhood: "Malasaña",
    address: "Illustrative location · Malasaña, Madrid", price: 39, mood: "focused",
    lat: 40.4262, lng: -3.7042,
    description: "A focused training space imagined for strength work, free weights and independent routines.",
    classes: "Strength & free weights", symbol: "▲"
  },
  {
    id: 3, name: "Tempo Cycle Club", type: "cycling", neighborhood: "Barrio de las Letras",
    address: "Illustrative location · Barrio de las Letras, Madrid", price: 28, mood: "social",
    lat: 40.4148, lng: -3.6990,
    description: "An energetic indoor-cycling concept with music-led classes and a welcoming group atmosphere.",
    classes: "Indoor cycling", symbol: "○"
  }
];

const typeLabels = { pilates: "Pilates", weights: "Weights", cycling: "Indoor cycling" };
const moodLabels = { calm: "Calm", social: "Social", focused: "Focused" };
let activeType = "all";
let savedIds = JSON.parse(localStorage.getItem("fyg-saved") || "[]");
let map;
let markerLayer;
const markerById = new Map();

const listEl = document.getElementById("studio-list");
const savedListEl = document.getElementById("saved-list");
const dialog = document.getElementById("studio-dialog");

function iconFor(type) {
  const cls = type === "pilates" ? "pilates" : type === "weights" ? "weights" : "cycling";
  const symbol = type === "pilates" ? "◆" : type === "weights" ? "▲" : "○";
  return L.divIcon({
    className: "custom-marker-wrap",
    html: `<span class="map-marker marker-${cls}" aria-hidden="true">${symbol}</span>`,
    iconSize: [34, 34], iconAnchor: [17, 17]
  });
}

function initMap() {
  if (!window.L) {
    document.getElementById("map").innerHTML = '<p style="padding:20px">The map could not load. Please check your internet connection.</p>';
    return;
  }
  map = L.map("map", { scrollWheelZoom: false }).setView([40.4195, -3.7005], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  studios.forEach(studio => {
    const marker = L.marker([studio.lat, studio.lng], { icon: iconFor(studio.type), title: studio.name, alt: studio.name });
    marker.on("click", () => openDetails(studio.id));
    marker.addTo(markerLayer);
    markerById.set(studio.id, marker);
  });
  setTimeout(() => map.invalidateSize(), 150);
}

function getFilteredStudios() {
  const search = document.getElementById("search-input").value.trim().toLowerCase();
  const price = document.getElementById("price-filter").value;
  const mood = document.getElementById("mood-filter").value;
  return studios.filter(studio => {
    const matchesType = activeType === "all" || studio.type === activeType;
    const matchesSearch = !search || `${studio.name} ${studio.neighborhood} ${studio.type}`.toLowerCase().includes(search);
    const matchesPrice = price === "all" || studio.price < Number(price);
    const matchesMood = mood === "all" || studio.mood === mood;
    return matchesType && matchesSearch && matchesPrice && matchesMood;
  });
}

function studioCard(studio, savedView = false) {
  const isSaved = savedIds.includes(studio.id);
  return `<article class="studio-card" tabindex="0" data-id="${studio.id}" aria-label="View details for ${studio.name}">
    <div>
      <div class="card-type">${typeLabels[studio.type]}</div>
      <h4>${studio.name}</h4>
      <div class="card-location">${studio.neighborhood} · Madrid</div>
      <div class="card-bottom"><span>From €${studio.price}/mo*</span><span>${moodLabels[studio.mood]}</span></div>
    </div>
    ${savedView
      ? `<button class="save-button remove-saved" data-id="${studio.id}" aria-label="Remove ${studio.name} from saved" title="Remove from saved">×</button>`
      : `<button class="save-button" data-id="${studio.id}" aria-label="${isSaved ? "Remove from" : "Save"} ${studio.name}" aria-pressed="${isSaved}" title="${isSaved ? "Remove from saved" : "Save space"}">${isSaved ? "♥" : "♡"}</button>`}
  </article>`;
}

function attachCardEvents(container) {
  container.querySelectorAll(".studio-card").forEach(card => {
    const open = () => openDetails(Number(card.dataset.id));
    card.addEventListener("click", event => {
      if (event.target.closest(".save-button")) return;
      open();
    });
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        if (event.target === card) { event.preventDefault(); open(); }
      }
    });
  });
  container.querySelectorAll(".save-button").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      toggleSaved(Number(button.dataset.id));
    });
  });
}

function renderResults() {
  const filtered = getFilteredStudios();
  listEl.innerHTML = filtered.map(studio => studioCard(studio)).join("");
  document.getElementById("result-count").textContent = `${String(filtered.length).padStart(2, "0")} PLACES`;
  document.getElementById("empty-state").hidden = filtered.length !== 0;
  listEl.hidden = filtered.length === 0;
  markerLayer?.clearLayers();
  filtered.forEach(studio => markerById.get(studio.id)?.addTo(markerLayer));
  attachCardEvents(listEl);
  renderSaved();
}

function renderSaved() {
  const saved = studios.filter(studio => savedIds.includes(studio.id));
  document.getElementById("saved-count").textContent = saved.length;
  document.getElementById("saved-section-count").textContent = `${saved.length} SAVED`;
  savedListEl.innerHTML = saved.length
    ? saved.map(studio => studioCard(studio, true)).join("")
    : '<p class="saved-empty">Your shortlist is waiting. Tap the bookmark on a studio to save it here.</p>';
  attachCardEvents(savedListEl);
}

function toggleSaved(id) {
  savedIds = savedIds.includes(id) ? savedIds.filter(item => item !== id) : [...savedIds, id];
  localStorage.setItem("fyg-saved", JSON.stringify(savedIds));
  renderResults();
}

function openDetails(id) {
  const studio = studios.find(item => item.id === id);
  if (!studio) return;
  document.getElementById("dialog-content").innerHTML = `
    <div class="card-type">${typeLabels[studio.type]}</div>
    <h2 class="dialog-title" id="dialog-title">${studio.name}</h2>
    <p class="dialog-copy">${studio.description}</p>
    <div class="dialog-facts">
      <div><small>Neighborhood</small><strong>${studio.neighborhood}</strong></div>
      <div><small>Indicative price*</small><strong>€${studio.price}/month</strong></div>
      <div><small>Atmosphere</small><strong>${moodLabels[studio.mood]}</strong></div>
      <div><small>Workout</small><strong>${studio.classes}</strong></div>
    </div>
    <p class="dialog-copy"><strong>Demo listing:</strong> This is illustrative project data. The location, studio and price must be verified before publication.</p>
    <button class="filter-chip ${savedIds.includes(id) ? "selected" : ""}" id="dialog-save">${savedIds.includes(id) ? "♥ Saved to shortlist" : "♡ Save this space"}</button>`;
  document.getElementById("dialog-save").addEventListener("click", () => {
    toggleSaved(id);
    openDetails(id);
  });
  dialog.showModal();
  if (map) map.flyTo([studio.lat, studio.lng], 16, { duration: .5 });
}

document.querySelectorAll(".filter-chip[data-type]").forEach(button => {
  button.addEventListener("click", () => {
    activeType = button.dataset.type;
    document.querySelectorAll(".filter-chip[data-type]").forEach(item => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderResults();
  });
});
["search-input", "price-filter", "mood-filter"].forEach(id => {
  document.getElementById(id).addEventListener(id === "search-input" ? "input" : "change", renderResults);
});
document.getElementById("clear-filters").addEventListener("click", () => {
  document.getElementById("search-input").value = "";
  document.getElementById("price-filter").value = "all";
  document.getElementById("mood-filter").value = "all";
  activeType = "all";
  document.querySelectorAll(".filter-chip[data-type]").forEach(button => {
    const selected = button.dataset.type === "all";
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderResults();
});
document.getElementById("dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

initMap();
renderResults();
