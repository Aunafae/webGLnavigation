class DoorSearch {
    constructor() {
        this.input = elements.roomSearch;
        this.dropdown = elements.roomSearchDropdown;
        this.doorInfo = elements.doorInfo;
        this.autocomplete = null;
        this.highlightedDoor = null;
    }

    showDoor(door, focus = true) {
        this.input.value = this.autocomplete.getDisplayText(door);
        this.input.dataset.doorId = door.id;
        this.showInfo(door);
        this.moveToFloor(door);
        this.highlightDoor(door);

        if (focus) {
            sceneManager.focusOnPoint(door);
        }
    }

    showInfo(door) {        
        const info = door.getInfo(window.currentLanguage);
        this.doorInfo.innerHTML = `
            <div class="door"><strong>${t('floor')}:</strong> ${info.floor ?? '—'}</div>
            <div class="door"><strong>${t('number')}:</strong> ${info.number || '—'}</div>
            <div class="door"><strong>${t('foundDoor')}:</strong> ${info.description || '—'}</div>`;
        this.doorInfo.classList.remove('hidden');
    }

    updateLanguage() {
        const doorId = this.input?.dataset.doorId;
        
        if (doorId) {
            const door = window.navGraph?.getPoint(doorId);
            if (door) {
                this.showInfo(door);
            }
        }
    }

    hideInfo() {
        this.doorInfo?.classList.add('hidden');
    }

    highlightDoor(door) {
        this.clearDoorHighlight();
        this.highlightedDoor = door;
        
        const color = new THREE.Color(0x44aaff);
        const apply = (mat) => {
            mat.emissive = color;
            mat.emissiveIntensity = 0.7;
            mat.needsUpdate = true;
        };
        
        const obj = door.modelObject;
        if (obj) {
            Array.isArray(obj.material) ? obj.material.forEach(apply) : apply(obj.material);
            this.startDoorPulseAnimation(door);
        }
    }

    clearDoorHighlight() {
        const door = this.highlightedDoor;
        if (!door?.modelObject) { 
            this.highlightedDoor = null; 
            return; 
        }
        
        if (door.pulseAnimation) {
            cancelAnimationFrame(door.pulseAnimation);
            door.pulseAnimation = null;
        }

        const remove = (mat) => {
            mat.emissive = new THREE.Color(0x000000);
            mat.emissiveIntensity = 0;
            mat.needsUpdate = true;
        };
        
        const obj = door.modelObject;
        if (obj) {
            Array.isArray(obj.material) ? obj.material.forEach(remove) : remove(obj.material);
        }

        this.highlightedDoor = null;

        if (sceneManager.currentFloor) {
            sceneManager.showFloor(parseInt(sceneManager.currentFloor));
        } else {
            sceneManager.showAllFloors();
        }
    }

    startDoorPulseAnimation(door) {
        let time = 0;
        
        const animate = () => {
            if (this.highlightedDoor !== door) {
                door.pulseAnimation = null;
                return;
            }
            
            time += 0.003;
            const opacity = 0.3 + (Math.sin(time * 10) + 1) / 2 * 0.6;
            const obj = door.modelObject;
            const set = (mat) => { 
                mat.opacity = opacity; 
                mat.transparent = true; 
            };
            
            if (obj) {
                Array.isArray(obj.material) ? obj.material.forEach(set) : set(obj.material);
            }
            door.pulseAnimation = requestAnimationFrame(animate);
        };
        
        animate();
    }

    moveToFloor(door) {
        const doorFloor = door.floor;

        if (doorFloor === null) return;
        
        if (doorFloor != sceneManager.currentFloor) {
            switchToFloor(doorFloor);
        } else {
            const btn = document.querySelector(`.floor_btn[data-floor="${doorFloor}"]`);
            if (btn) setActiveFloorButton(btn);
        }
    }

    clear() {
        this.input.value = '';
        this.input.dataset.doorId = '';
        
        this.clearDoorHighlight();
        this.hideInfo();
        this.autocomplete.resetFilter();
    }

    findByQuery(query) {
        const searchTerm = query.toLowerCase().trim();
        
        let exactNumberMatch = null;
        let exactDescriptionMatch = null;

        window.navGraph.getAllDoors().forEach(door => {
            const number = door.number?.toLowerCase() || '';
            const description = door.getDescription(window.currentLanguage)?.toLowerCase() || '';
            
            if (number === searchTerm) {
                exactNumberMatch = door;
            } else if (description === searchTerm && !exactNumberMatch) {
                exactDescriptionMatch = door;
            }
        });

        return exactNumberMatch || exactDescriptionMatch || null;
    }

    handleSearch() {
        this.clearDoorHighlight();
        this.hideInfo();

        const query = this.input?.value.trim();
        if (!query) {
            this.doorInfo.innerHTML = `<div class="door error">${t('selectPointPrompt')}</div>`;
            this.doorInfo.classList.remove('hidden');
            return; 
        }

        let door = this.input?.dataset.doorId 
            ? window.navGraph?.getPoint(this.input.dataset.doorId)
            : this.findByQuery(query);

        if (door) this.showDoor(door);
        else {
            this.doorInfo.innerHTML = `<div class="door error">${t('doorNotFound')}</div>`;
            this.doorInfo.classList.remove('hidden');
        }
    }
}

window.DoorSearch = DoorSearch;