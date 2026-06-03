let sceneManager;
let modelLoader;
let animationId;
let canvas;

let raycaster;
let mouse;

const autocompletes = {};
let doorSearch;

const urlParams = new URLSearchParams(window.location.search);
const buildingId = `building_${urlParams.get('id')}`;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const elements = {
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingMessage: document.getElementById('loadingMessage'),
    buildingTitle: document.getElementById('buildingTitle'),
    btnReset: document.getElementById('btnReset'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    connectionStatus: document.getElementById('connectionStatus'),
    statusText: document.getElementById('statusText'),
    floorButtons: document.getElementById('floorButtons'),
    modelFunctionsToggle: document.getElementById('modelFunctionsToggle'),
    roomSearch: document.getElementById('roomSearch'),
    searchBtn: document.getElementById('searchBtn'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    startPointInput: document.getElementById('startPoint'),
    endPointInput: document.getElementById('endPoint'),
    buildRouteBtn: document.getElementById('buildRouteBtn'),
    clearRouteBtn: document.getElementById('clearRouteBtn'),
    routeInfo: document.getElementById('routeInfo'),
    roomSearchDropdown: document.getElementById('roomSearchDropdown'),
    startPointDropdown: document.getElementById('startPointDropdown'),
    endPointDropdown: document.getElementById('endPointDropdown'),
    doorInfo: document.getElementById('doorInfo')
};

window.buildingId = buildingId;

// Инициализация
async function init() {
    if (!checkWebGLSupport()) {
        alert('Ваш браузер не поддерживает WebGL');
        window.location.href = '/';
        return;
    }

    if (!buildingId) {
        window.location.href = '/';
        return;
    }

    const check = await fetch(`/models/${buildingId}/${buildingId}.glb`, { method: 'HEAD' });
    if (!check.ok) {
        window.location.href = '/';
        return;
    }

    canvas = document.getElementById('glcanvas');
    setLoading(true, t('loadingMessage'));
    
    sceneManager = new SceneManager(canvas);
    
    await new Promise(resolve => {
        const check = () => {
            if (window.THREE) resolve();
            else requestAnimationFrame(check);
        };
        check();
    });

    try {
        await loadBuildingModel(buildingId);
    } catch (error) {
        showError(t('initError'));
        return;
    }

    setupEventListeners(canvas);
    initRaycaster();
    initDoorHover();
    startAnimation();

    updateConnectionStatus(true);
    setLoading(false);
}

function checkWebGLSupport() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl;
}

async function loadBuildingModel(id) {
    setLoading(true, t('loadingMessage'));

    modelLoader = new ModelLoader();
    const glb = await modelLoader.loadModel(id);

    // название корпуса
    if (elements.buildingTitle) {
        elements.buildingTitle.innerHTML = `<h2>${getBuildingName(id)}</h2>`;
    }

    // построение навигационного графа, загрузка связей и дверей
    const graphBuilder = new ModelGraphBuilder();
    const navGraph = await graphBuilder.build(glb.scene, id);
    window.navGraph = navGraph;

    // установка в сцену
    sceneManager.setModel(glb);

    // инициализация поиска и автодополнений
    initSearchAndAutocompletes();

    // этажи
    const floors = sceneManager.getFloorList();
    createFloorButtons(floors);

    // тумблеры
    populateModelFunctionsPanel();

    // локализация
    updateViewerPageTexts();
    updateInstructionTooltip();
    setupViewerLanguageButtons();

    setLoading(false);
}

function getBuildingName(id) {
    const number = id.replace(/\D/g, '');
    const descriptions = t('buildingDescriptions');
    const description = descriptions[number];
    return description ? `${t('building')} ${number} - ${description}` : `${t('building')} №${number}`;
}
window.getBuildingName = getBuildingName;

function navigateBetweenDoors(doorA, doorB) {
    const door = window.navGraph.getPoint(doorA);

    if (doorA == doorB) {
        sceneManager?.clearPath();
        doorSearch.showDoor(door);
        return [doorA];
    }

    const options = getRouteOptions();
    const path = window.navGraph.navigateAStar(doorA, doorB, options);

    if (!path) {
        showNotFoundMessage(t('routeNotFound'));
        sceneManager?.clearPath();
        return;
    }
    
    switchToFloor(door.floor);
    sceneManager.focusOnPoint(door);

    sceneManager?.visualizePath(path);
    elements.routeInfo?.classList.add('hidden');

    return path;
}

function setLoading(visible, message = '') {
    elements.loadingOverlay?.classList.toggle('hidden', !visible);
    if (message && elements.loadingMessage) elements.loadingMessage.textContent = message;
}

function showError(message) {
    if (elements.loadingMessage) {
        elements.loadingMessage.innerHTML = `❌ ${message}<br><br>${t('redirecting')}`;
    }
    setTimeout(() => {
        window.location.href = '/';
    }, 3000);
}

function updateConnectionStatus(connected) {
    elements.connectionStatus?.classList.toggle('connected', connected);
    if (elements.statusText) elements.statusText.textContent = t(connected ? 'connected' : 'disconnected');
}

function createFloorButtons(floors) {
    const container = elements.floorButtons;
    container.innerHTML = '';

    if (!floors?.length) {
        container.innerHTML = `<div class="no_floors">${t('noFloors')}</div>`;
        return;
    }

    const allBtn = createFloorButton('all', t('allFloors'), () => {
        setActiveFloorButton(allBtn);
        sceneManager.showAllFloors();
    });
    container.appendChild(allBtn);

    floors.forEach(floorNum => {
        const btn = createFloorButton(floorNum, floorNum < 0 ? `-${Math.abs(floorNum)}` : floorNum, () => {
            switchToFloor(floorNum);
        });
        container.appendChild(btn);
    });

    // авто-активация кнопки текущего этажа
    const currentFloor = sceneManager.currentFloor;
    const targetBtn = currentFloor !== null 
        ? Array.from(container.children).find(btn => btn.dataset.floor == currentFloor)
        : null;

    setActiveFloorButton(targetBtn || allBtn);
}

function createFloorButton(value, text, handler) {
    const btn = document.createElement('button');

    btn.className = 'floor_btn' + (value === 'all' ? ' all-floors' : '');
    btn.textContent = text;

    if (value !== 'all') btn.dataset.floor = value;

    btn.addEventListener('click', handler);
    
    return btn;
}

function setActiveFloorButton(activeBtn) {
    document.querySelectorAll('.floor_btn').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function switchToFloor(floorNum) {
    sceneManager.showFloor(floorNum);
    
    const btn = document.querySelector(`.floor_btn[data-floor="${floorNum}"]`);
    if (btn) {
        setActiveFloorButton(btn);
    } else {
        const allBtn = document.querySelector('.floor_btn.all-floors');
        if (allBtn) setActiveFloorButton(allBtn);
    }
}

function populateModelFunctionsPanel() {
    const container = elements.modelFunctionsToggle;
    container.innerHTML = '';

    container.appendChild(
        createToggle('showOtherFloors', sceneManager?.getTransparentMode() ?? true,
            (enabled) => sceneManager?.setTransparentMode(enabled))
    );

    if (window.navGraph?.hasStreetPoints !== false) {
        const streetToggle = createToggle('routersAcrossStreet', true, 
            (enabled) => {rebuildCurrentRoute();}
        );
        container.appendChild(streetToggle);
    }

    if (window.navGraph?.hasElevatorPoints !== false) {
        const elevatorToggle = createToggle('routersWithElevator', true,
            (enabled) => {rebuildCurrentRoute();}
        );
        container.appendChild(elevatorToggle);
    }
}

function createToggle(textKey, checked, onChange) {
    const item = document.createElement('label');
    item.className = 'toggle_item';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    const span = document.createElement('span');
    span.className = 'toggle_switch';
    const text = document.createElement('span');
    text.textContent = t(textKey);
    item.append(input, span, text);
    if (onChange) 
        input.addEventListener('change', (e) => onChange(e.target.checked));
    return item;
}

function rebuildCurrentRoute() {
    const startId = elements.startPointInput.dataset.doorId;
    const endId = elements.endPointInput.dataset.doorId;
    
    if (startId && endId) {
        navigateBetweenDoors(startId, endId);
    }
}

function getRouteOptions() {
    const toggles = document.querySelectorAll('#modelFunctionsToggle .toggle_item');
    
    let allowStreet = true;
    let allowElevator = true;
    
    toggles.forEach(toggle => {
        const text = toggle.querySelector('span:last-child')?.textContent || '';
        const input = toggle.querySelector('input');
                
        if (text === t('routersAcrossStreet')) {
            allowStreet = input.checked;
        }
        if (text === t('routersWithElevator')) {
            allowElevator = input.checked;
        }
    });
    
    return { allowStreet, allowElevator };
}

function setupViewerLanguageButtons() {
    document.getElementById('langRu')?.addEventListener('click', () => { setLanguage('ru'); updateViewerLanguage(); });
    document.getElementById('langEn')?.addEventListener('click', () => { setLanguage('en'); updateViewerLanguage(); });
}

function updateViewerLanguage() {
    const toggles = document.querySelectorAll('#modelFunctionsToggle .toggle_item');
    if (toggles.length >= 1) {
        const showOtherFloorsSpan = toggles[0].querySelector('span:last-child');
        if (showOtherFloorsSpan) showOtherFloorsSpan.textContent = t('showOtherFloors');
    }
    if (toggles.length >= 2) {
        const routersAcrossStreetSpan = toggles[1].querySelector('span:last-child');
        if (routersAcrossStreetSpan) routersAcrossStreetSpan.textContent = t('routersAcrossStreet');
    }
    if (toggles.length >= 3) {
        const routersWithElevatorSpan = toggles[2].querySelector('span:last-child');
        if (routersWithElevatorSpan) routersWithElevatorSpan.textContent = t('routersWithElevator');
    }

    if (buildingId && elements.buildingTitle) {
        elements.buildingTitle.innerHTML = `<h2>${getBuildingName(buildingId)}</h2>`;
    }

    updateInstructionTooltip();
    updateDoorsLanguage();
}

function updateDoorsLanguage() {
    for (const key in autocompletes) {
        const ac = autocompletes[key];
        ac.reloadDoors();
    }
    
    doorSearch?.updateLanguage();

    const startDoorId = elements.startPointInput.dataset.doorId;
    const endDoorId = elements.endPointInput.dataset.doorId;
    if (startDoorId) {
        const door = window.navGraph?.getPoint(startDoorId);
        if (door) autocompletes.startPoint?.selectDoor(door);
    }
    if (endDoorId) {
        const door = window.navGraph?.getPoint(endDoorId);
        if (door) autocompletes.endPoint?.selectDoor(door);
    }
}

function setupEventListeners(canvas) {
    elements.btnReset?.addEventListener('click', () => sceneManager?.resetView());
    elements.btnFullscreen?.addEventListener('click', toggleFullscreen);
    window.addEventListener('resize', () => sceneManager?.resize(window.innerWidth, window.innerHeight));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const instructionBtn = document.getElementById('instructionBtn');
    const instructionTooltip = document.getElementById('instructionTooltip');
    
    instructionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        instructionTooltip.classList.toggle('hidden');
    });
}

function updateInstructionTooltip() {
    const tooltip = document.querySelector('.tooltip_content');

    if (!tooltip) return;

    const key = isMobile ? 'controlsDescriptionMobile' : 'controlsDescriptionPK';
    tooltip.innerHTML = t(key).replace(/\n/g, '<br>');
}

function toggleFullscreen() {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
}

function startAnimation() {
    function animate() {
        sceneManager?.render();
        animationId = requestAnimationFrame(animate);
    }
    animate();
}

// луч определения объектов
function initRaycaster() {
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    if (isMobile) {
        let lastTapTime = 0;
        
        canvas.addEventListener('touchend', (event) => {
            const now = Date.now();
            const timeSinceLastTap = now - lastTapTime;
            
            if (timeSinceLastTap < 500 && timeSinceLastTap > 0) {
                event.preventDefault();
                const touch = event.changedTouches[0];
                if (touch) {
                    processTouchOrClick(touch.clientX, touch.clientY);
                }
                lastTapTime = 0;
            } else {
                lastTapTime = now;
            }
        });
    } 
    else 
        canvas.addEventListener('dblclick', (e) => processTouchOrClick(e.clientX, e.clientY));
}

function getNormalizedMouse(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1
    };
}

function processTouchOrClick(clientX, clientY) {
    const {x, y} = getNormalizedMouse(clientX, clientY);
    mouse.set(x, y);

    sceneManager.camera.updateMatrixWorld();
    raycaster.setFromCamera(mouse, sceneManager.camera);

    for (const { object } of raycaster.intersectObjects(sceneManager.scene.children, true)) {
        if (object.name?.match(/^D\d+_\d+$/) && isObjectOnCurrentFloor(object)) {
            const door = window.navGraph?.getPoint(object.name);
            doorSearch.showDoor(door, false);
            break;
        }
    }
}

function initDoorHover() {
    canvas.addEventListener('mousemove', (event) => {
        const {x, y} = getNormalizedMouse(event.clientX, event.clientY);
        mouse.set(x, y);

        sceneManager.camera.updateMatrixWorld();
        raycaster.setFromCamera(mouse, sceneManager.camera);

        const hovered = raycaster.intersectObjects(sceneManager.scene.children, true)
            .some(({ object }) => object.name?.match(/^D\d+_\d+$/) && isObjectOnCurrentFloor(object));
        
        canvas.style.cursor = hovered ? 'pointer' : 'default';
    });
}

function isObjectOnCurrentFloor(object) {
    const currentFloor = sceneManager.currentFloor;
    if (currentFloor === null) return true;
    
    const objectName = object.name;
    if (!objectName) return false;
    
    const areaMatch = objectName.match(/[PSD](\d+)_/);
    if (!areaMatch) return false;
    
    const areaIndex = parseInt(areaMatch[1]);
    
    return window.navGraph.isAreaOnFloor(areaIndex, currentFloor);
}

function initSearchAndAutocompletes() {
    doorSearch = new DoorSearch();
    
    const roomAc = new DoorAutocomplete(elements.roomSearch, elements.roomSearchDropdown);
    roomAc.reloadDoors();
    autocompletes.roomSearch = roomAc;
    doorSearch.autocomplete = roomAc;
    
    [
        { input: elements.startPointInput, dropdown: elements.startPointDropdown },
        { input: elements.endPointInput, dropdown: elements.endPointDropdown }
    ].forEach(({ input, dropdown }) => {
        const ac = new DoorAutocomplete(input, dropdown);
        ac.reloadDoors();
        autocompletes[input.id] = ac;
    });

    elements.searchBtn?.addEventListener('click', () => doorSearch.handleSearch());
    elements.clearSearchBtn?.addEventListener('click', () => doorSearch.clear());
    elements.roomSearch?.addEventListener('keypress', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const dropdown = elements.roomSearchDropdown;
        if (dropdown?.classList.contains('visible')) return;
        doorSearch.handleSearch();
    });
}

function buildRoute() {
    const startId = elements.startPointInput.dataset.doorId;
    const endId = elements.endPointInput.dataset.doorId;

    sceneManager?.clearPath();
    if (doorSearch) doorSearch.clearDoorHighlight();
    elements.routeInfo?.classList.add('hidden');

    if (!startId || !endId) { 
        showNotFoundMessage(t('selectPointsPrompt'));
        return; 
    }
    elements.routeInfo?.classList.add('hidden');
    
    navigateBetweenDoors(startId, endId);
}

function clearRoute() {
    ['startPointInput', 'endPointInput'].forEach(id => {
        const el = elements[id];
        el.value = ''; 
        el.dataset.doorId = ''; 
    });

    elements.routeInfo?.classList.add('hidden');

    ['startPoint', 'endPoint'].forEach(key => {
        const ac = autocompletes[key];
        ac.resetFilter();
    });

    sceneManager?.clearPath();
}

function showNotFoundMessage(message) {
    const routeInfo = elements.routeInfo;
    if (!routeInfo) return;
    
    routeInfo.textContent = message;
    routeInfo.className = 'route_info error';
    routeInfo.classList.remove('hidden');
}

elements.buildRouteBtn?.addEventListener('click', buildRoute);
elements.clearRouteBtn?.addEventListener('click', clearRoute);

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('beforeunload', () => { if (animationId) cancelAnimationFrame(animationId); });