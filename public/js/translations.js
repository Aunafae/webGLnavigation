const translations = {
    ru: {
        // index
        headerTitle: "🏛️ Навигационная система для ориентирования по корпусам ОГУ",
        buildingsChoice: "Доступные корпуса",
        building: "Корпус",
        buildingDescriptions: {
            "1": "Главный корпус",
            "2": "Академия права",
            "3": "Польский корпус",
            "4": "Художественно-графический факультет",
            "5": "Медицинский институт",
            "6": "Факультет технологии, предпринимательства и сервиса",
            "7": "Исторический факультет",
            "8": "Институт иностранных языков",
            "9": "Социальный факультет",
            "10": "Учебный",
            "11": "ГУ УНПК",
            "12": "АО НАУЧПРИБОР",
            "13": "НИИЛЕГМАШ",
            "14": "КАФЕД",
            "15": "Технологический институт имени Н.Н.Поликарпова",
            "16": "Архитектурно-строительный институт и институт транспорта",
            "17": "Фундаментальная библиотека"
        },
        buildingAddresses: {
            "1": "ул. Комсомольcкая, д. 95",
            "2": "ул. Комсомольская, д. 39а",
            "3": "ул. Комсомольская, д. 41",
            "4": "ул. Комсомольская, д. 95",
            "5": "ул. Октябрьская, д.25",
            "6": "ул. Ленина, д. 6а",
            "7": "пер. Воскресенский, д. 3",
            "8": "ул. Комсосольская, д. 39б",
            "9": "ул. Московская, д. 159а",
            "10": "ул. Комсомольская, д. 41",
            "11": "Наугорское шоссе, д. 29",
            "12": "Наугорское шоссе, д. 40",
            "13": "ул. Московская, д. 65",
            "14": "пер. Артельный, д. 5",
            "15": "ул. Московская, д.34",
            "16": "ул. Московская, д. 77",
            "17": "пл. Каменская, д. 1"
        },
        selectBuildingButton: "Выбрать корпус",
        footer: "Навигационная система для ориентирования по корпусам ОГУ",
        footerTechStack: "Технологии: WebGL 2.0, JavaScript, PHP",
        
        //viewer
        backButton: "← Назад к выбору корпуса",
        buildingTitle: "Загрузка модели",
        connected: "Подключено",
        loadingMessage: "Загрузка 3D модели",
        modelFunction: "Возможности модели",
        showOtherFloors: "Отображение неактивных этажей",
        routersAcrossStreet: "Маршрут через улицу",
        routersWithElevator: "Маршрут с лифтом",
        floors: "Этажи",
        allFloors: "Все",
        searchRoom: "Поиск помещения",
        inputPlaceholder: "Начните вводить номер или название...",
        buildingRoute: "Построение маршрута",
        startPoint: "Откуда: ",
        endPoint: "Куда: ",
        setRoute: "Построить",
        clearRoute: "Удалить",
        hintFindRoom: "Найти",
        hintClearRoom: "Очистить",
        hintReset: "Сбросить вид",
        hintFullscreen: "Полный экран",
        
        initError: "Ошибка инициализации",
        redirecting: "Перенаправление...",
        noFloors: "Этажи не найдены",
        controlsDescriptionPK: "ЛКМ - вращение модели\nСКМ - перемещение модели\nКолёсико - масштабирование модели",
        controlsDescriptionMobile: "ХЗ - вращение модели\nХЗ - перемещение модели\nХЗ - масштабирование модели",
        floor: "Этаж",
        number: "Номер",
        foundDoor: "Описание",
        nothingFound: "Ничего не найдено",
        doorNotFound: "Дверь не найдена. Проверьте номер или описание.",
        routeNotFound: "Маршрут не найден",
        selectPointsPrompt: "Пожалуйста, выберите начальную и конечную точки",
        selectPointPrompt: "Пожалуйста, введите номер или описание двери, или выберите из выпадающего списка"
    },

    en: {
        // index
        headerTitle: "🏛️ Navigation System for OSU Buildings",
        buildingsChoice: "Available Buildings",
        building: "Building",
        buildingDescriptions: {
            "1": "Main Building",
            "2": "Academy of Law",
            "3": "Polish Corps",
            "4": "Art and Graphic Faculty",
            "5": "Medical Institute",
            "6": "Faculty of Technology, Entrepreneurship and Service",
            "7": "Faculty of History",
            "8": "Institute of Foreign Languages",
            "9": "Faculty of Social Sciences",
            "10": "Educational",
            "11": "GU UNPK",
            "12": "AO NAUCHPRIBOR",
            "13": "NIILEGMASH",
            "14": "KAFED",
            "15": "Technological Institute named after N.N. Polikarpov",
            "16": "Architectural and Construction Institute and Institute of Transport",
            "17": "Fundamental Library"
        },
        buildingAddresses: {
            "1": "Komsomolskaya st., 95",
            "2": "Komsomolskaya st., 39a",
            "3": "Komsomolskaya st., 41",
            "4": "Komsomolskaya st., 95",
            "5": "Oktyabrskaya st., 25",
            "6": "Lenina st., 6a",
            "7": "Voskresensky lane, 3",
            "8": "Komsomolskaya st., 39b",
            "9": "Moskovskaya st., 159a",
            "10": "Komsomolskaya st., 41",
            "11": "Naugorskoye highway, 29",
            "12": "Naugorskoye highway, 40",
            "13": "Moskovskaya st., 65",
            "14": "Artelny lane, 5",
            "15": "Moskovskaya st., 34",
            "16": "Moskovskaya st., 77",
            "17": "Kamenskaya square, 1"
        },
        selectBuildingButton: "View Building",
        footer: "Navigation System for OSU Buildings",
        footerTechStack: "Technologies: WebGL 2.0, JavaScript, PHP",
        
        // viewer
        backButton: "Back to building selection",
        buildingTitle: "Loading the model",
        connected: "Connected",
        loadingMessage: "Loading the 3D model",
        modelFunction: "Model function",
        showOtherFloors: "Show other floors",
        routersAcrossStreet: "Route across the street",
        routersWithElevator: "Route with elevator",
        floors: "Floors",
        allFloors: "All",
        searchRoom: "Room search",
        inputPlaceholder: "Start entering the number or name...",
        buildingRoute: "Building a route",
        startPoint: "From: ",
        endPoint: "To: ",
        setRoute: "Build",
        clearRoute: "Delete",
        hintFindRoom: "Find",
        hintClearRoom: "Clear",
        hintReset: "Reset the view",
        hintFullscreen: "Full screen",
        
        initError: "Initialization error",
        redirecting: "Redirecting...",
        noFloors: "Floors not found",
        controlsDescriptionPK: "LMB - rotate model\nMMB - move model\nScroll wheel - zoom model",
        controlsDescriptionMobile: "HZ - rotate model\nHZ - move model\nHZ - zoom model",
        floor: "Floor",
        number: "Number",
        foundDoor: "Description",
        nothingFound: "Nothing found",
        doorNotFound: "The door was not found\nCheck the number or description",
        routeNotFound: "Route not found",
        selectPointsPrompt: "Please select the start and end points",
        selectPointPrompt: "Please enter the number or description of the door, or select from the drop-down list"
    }
};

let currentLanguage = 'ru';

function t(key) {
    const value = translations[currentLanguage][key];
    return value !== undefined ? value : key;
}

function updateIndexPageTexts() {
    const arr = [['.title', 'headerTitle'],
        ['.buildings_choice h3', 'buildingsChoice'],
        ['footer p:first-child', 'footer'],
        ['footer p:nth-child(2)', 'footerTechStack']];

    arr.forEach(([selector, key]) => {
        document.querySelector(selector).textContent = t(key);
    });
}

function updateViewerPageTexts() {
    const arrTextContent = [
        ['.back_button', 'backButton'],
        ['#statusText', 'connected'],
        ['#loadingMessage', 'loadingMessage'],
        ['.model_functions h4', 'modelFunction'],
        ['.floors h4', 'floors'],
        ['.search_room h4', 'searchRoom'],
        ['.route_builder h4', 'buildingRoute'],
        ['label[for="startPoint"]', 'startPoint'],
        ['label[for="endPoint"]', 'endPoint'],
        ['#buildRouteBtn', 'setRoute'],
        ['#clearRouteBtn', 'clearRoute']
    ];

    const arrPlaceholder = [
        ['#roomSearch', 'inputPlaceholder'],
        ['#startPoint', 'inputPlaceholder'],
        ['#endPoint', 'inputPlaceholder']
    ];

    const arrTitle = [
        ['#searchBtn', 'hintFindRoom'],
        ['#clearSearchBtn', 'hintClearRoom'],
        ['#btnReset', 'hintReset'],
        ['#btnFullscreen', 'hintFullscreen']
    ];

    const arrDynTextContent = [
        ['.floor_btn.all-floors', 'allFloors'],
        ['.no_floors', 'noFloors'],
        ['#modelFunctionsToggle .toggle-item:nth-child(1) span:last-child', 'showOtherFloors'],
        ['#modelFunctionsToggle .toggle-item:nth-child(2) span:last-child', 'routersAcrossStreet'],
        ['#modelFunctionsToggle .toggle-item:nth-child(3) span:last-child', 'routersWithElevator']
    ];

    arrTextContent.forEach(([selector, key]) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = t(key);
    });

    arrPlaceholder.forEach(([selector, key]) => {
        const el = document.querySelector(selector);
        if (el) el.placeholder = t(key);
    });

    arrTitle.forEach(([selector, key]) => {
        const el = document.querySelector(selector);
        if (el) el.title = t(key);
    });

    arrDynTextContent.forEach(([selector, key]) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = t(key);
    });
}

function setLanguage(lang) {
    if (lang !== 'ru' && lang !== 'en') 
        return;
    
    currentLanguage = lang;
    window.currentLanguage = lang;
    
    if (window.location.pathname.includes('viewer.html')) {
        updateViewerPageTexts();
        const buildingTitle = document.getElementById('buildingTitle');
        buildingTitle.innerHTML = `<h2>${window.getBuildingName(window.buildingId)}</h2>`;
    } else {
        updateIndexPageTexts();
        window.renderBuildings();
    }
    
    localStorage.setItem('preferredLanguage', lang);
}

function loadSavedLanguage() {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'ru' || saved === 'en') 
        currentLanguage = saved;
    else
        currentLanguage = 'ru';

    return currentLanguage;
}

loadSavedLanguage();

window.t = t;
window.setLanguage = setLanguage;
window.currentLanguage = currentLanguage;