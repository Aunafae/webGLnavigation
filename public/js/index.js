const grid = document.getElementById('buildingsGrid');
let buildings = [];

async function loadBuildings() {  
    const res = await fetch('/api/buildings');
    if (!res.ok) 
        throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    buildings = data.success ? data.buildings : [];
    renderCards(buildings);
}

function renderCards(list) {
    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = `<div class="no-buildings">${t('noBuildings')}</div>`;
        return;
    }

    const descriptions = t('buildingDescriptions');
    const addresses = t('buildingAddresses');
    list.forEach(b => grid.appendChild(createCard(b, descriptions[b.number], addresses[b.number])));
}

function createCard(building, description, address) {
    const number = building.number;
    const name = `${t('building')} №${number}`;
    const img = createImage(number);

    const card = document.createElement('div');
    card.className = 'building_card';
    card.dataset.id = building.id;
    card.dataset.number = number;

    card.innerHTML = `
    <div class="card_image">
      <div class="building_number_overlay">${number}</div>
    </div>
    <div class="card_content">
      <h4 class="building_title">${name}</h4>
      <div class="building_description">${description}</div>
      <div class="building_address">${address}</div>
      <button class="btn_view">${t('selectBuildingButton')}</button>
    </div>
    `;
    card.querySelector('.card_image').appendChild(img);
    return card;
}

function createImage(buildingNumber) {
  const img = document.createElement('img');
  img.src = `/assets/images/building_img_${buildingNumber}.jpg`;
  img.alt = '';
  
  img.onerror = function() {
    const currentSrc = this.src.split('/').pop();
    if (currentSrc.includes('.jpg')) {
      this.src = this.src.replace('.jpg', '.png');
    } else if (currentSrc.includes('.png')) {
      this.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'no-image';
      this.parentNode.appendChild(placeholder);
    }
  };
  return img;
}

function setupDelegation() {
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.building_card');
    if (!card) return;
    
    const number = card.dataset.number;
    window.location.href = `/viewer.html?id=${number}`;
  });
}

function setupLangButtons() {
  document.getElementById('langRu')?.addEventListener('click', () => setLanguage('ru'));
  document.getElementById('langEn')?.addEventListener('click', () => setLanguage('en'));
}

window.renderBuildings = () => {
  if (buildings.length) renderCards(buildings);
  else loadBuildings();
};

document.addEventListener('DOMContentLoaded', () => {
  setupLangButtons();
  setupDelegation();
  loadBuildings();

  setTimeout(updateIndexPageTexts, 50);
});