class DoorAutocomplete {
    constructor(inputElement, dropdownElement) {
        this.input = inputElement;
        this.dropdown = dropdownElement;
        this.allDoors = [];
        this.filteredDoors = [];
        this.init();
    }

    init() {
        this.input.addEventListener('input', () => this.onInput());
        this.input.addEventListener('blur', () => setTimeout(() => this.hide(), 200));
        this.input.addEventListener('focus', () => this.show());
        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) this.hide();
        });
    }

    getDisplayText(door) {
        const floorStr = door.floor !== null ? ` (${t('floor').toLowerCase()} ${door.floor})` : '';
        const description = door.getDescription(window.currentLanguage);
        
        if (door.number && description) 
            return `${door.number} - ${description}${floorStr}`;
        if (door.number) 
            return `${door.number}${floorStr}`;
        if (description) 
            return `${description}${floorStr}`;
        return door.id;
    }

    refresh() {
        if (this.dropdown.classList.contains('visible'))
            this.render();
    }

    reloadDoors() {
        this.allDoors = window.navGraph.getAllDoors();
        this.filteredDoors = [...this.allDoors];
        this.render();

        const selectedId = this.input.dataset.doorId;
        if (selectedId) {
            const selectedDoor = this.allDoors.find(d => d.id === selectedId);
            if (selectedDoor) {
                this.input.value = this.getDisplayText(selectedDoor);
            }
        }
    }

    onInput() {
        this.input.dataset.doorId = '';

        const searchTerm = this.input.value.toLowerCase().trim();
        if (searchTerm != '') {
            this.filteredDoors = this.allDoors.filter(door => {
                const number = (door.number || '').toLowerCase();
                const description = (door.getDescription(window.currentLanguage) || '').toLowerCase();
                const id = door.id.toLowerCase();
                return number.includes(searchTerm) || description.includes(searchTerm) || id.includes(searchTerm);
            });
        } else {
            this.filteredDoors = [...this.allDoors];
        }

        this.render();
        this.show();
    }

    selectDoor(door) {
        this.input.value = this.getDisplayText(door);
        this.input.dataset.doorId = door.id;
        this.hide();
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    show() { this.dropdown.classList.add('visible'); }
    hide() { this.dropdown.classList.remove('visible'); }

    resetFilter() {
        this.filteredDoors = [...this.allDoors];
        this.render();
        this.hide();
    }
    
    render() {
        if (this.filteredDoors.length === 0) {
            this.dropdown.innerHTML = '<div class="autocomplete_item">' + t('nothingFound') + '</div>';
            this.dropdown.classList.add('visible');
            return;
        }

        let html = '';

        this.filteredDoors.forEach(door => {
            const floorStr = door.floor !== null ? ` <span class="door_floor">(${t('floor').toLowerCase()} ${door.floor})</span>` : '';
            const number = door.number || '';
            const description = door.getDescription(window.currentLanguage) || '';
        
            html += `<div class="autocomplete_item" data-id="${door.id}">`;

            if (number && description)
                html += `<span class="door_number">${number}</span> - <span class="door_description">${description}</span>${floorStr}`;
            else if (number)
                html += `<span class="door_number">${number}</span>${floorStr}`;
            else if (description)
                html += `<span class="door_description">${description}</span>${floorStr}`;
            else
                html += door.id + floorStr;

            html += `</div>`;
        });

        this.dropdown.innerHTML = html;
        this.dropdown.querySelectorAll('.autocomplete_item').forEach(item => {
            item.addEventListener('click', () => {
                const doorId = item.dataset.id;
                const door = this.filteredDoors.find(d => d.id === doorId);
                if (door) this.selectDoor(door);
            });
        });
    }
}

window.DoorAutocomplete = DoorAutocomplete;