/*****************************************************************
 * * SCRIPT WIDE SCOPE & CONSTANTS
 * *****************************************************************/
"use strict";

// Default state
let currentDimension = "Health";
let currentTab = "goals";
let roleCardState = {};
let editingResourceId = null;
let currentPageOrigin = 'lifeBalancePage';
let editingFinancialInfo = { type: null, id: null };

// Editing variables for library items
let editingItem = {
    dimension: null,
    tab: null,
    index: null,
    frequency: null,
};

// DOM Element References
const inputsDiv = document.getElementById("inputs");
const inputs = {};

// Data - The single source of truth for the app's state
let dimensionLibraryData = {};

// Default structure for a new user
const defaultAppData = {
    appSettings: {
        userName: "Your Name",
        userImage: "https://i.ibb.co/6n2wz7C/image-50bec5.png",
        userRoles: [
            { key: "son", name: "Son", icon: "fa-child" }, { key: "citizen", name: "Citizen", icon: "fa-flag" },
            { key: "professional", name: "Professional", icon: "fa-user-tie" }, { key: "human", name: "Human", icon: "fa-person" }
        ],
        roleLibrary: [
            { key: "athlete", name: "Athlete", icon: "fa-dumbbell" }, { key: "artist", name: "Artist", icon: "fa-paint-brush" }, { key: "brother", name: "Brother", icon: "fa-users" },
            { key: "chef", name: "Chef", icon: "fa-utensils" }, { key: "citizen", name: "Citizen", icon: "fa-flag" }, { key: "creator", name: "Creator", icon: "fa-lightbulb" },
            { key: "designer", name: "Designer", icon: "fa-pen-nib" }, { key: "dj", name: "DJ", icon: "fa-compact-disc" }, { key: "dreamer", name: "Dreamer", icon: "fa-cloud" },
            { key: "engineer", name: "Engineer", icon: "fa-cogs" }, { key: "entrepreneur", name: "Entrepreneur", icon: "fa-rocket" }, { key: "explorer", name: "Explorer", icon: "fa-compass" },
            { key: "father", name: "Father", icon: "fa-male" }, { key: "friend", name: "Friend", icon: "fa-user-friends" }, { key: "gardener", name: "Gardener", icon: "fa-leaf" },
            { key: "healer", name: "Healer", icon: "fa-heartbeat" }, { key: "human", name: "Human", icon: "fa-person" }, { key: "innovator", name: "Innovator", icon: "fa-flask" },
            { key: "leader", name: "Leader", icon: "fa-crown" }, { key: "learner", name: "Learner", icon: "fa-book" }, { key: "lover", name: "Lover", icon: "fa-heart" },
            { key: "manager", name: "Manager", icon: "fa-briefcase" }, { key: "mentor", name: "Mentor", icon: "fa-chalkboard-teacher" }, { key: "mother", name: "Mother", icon: "fa-female" },
            { key: "musician", name: "Musician", icon: "fa-music" }, { key: "partner", name: "Partner", icon: "fa-handshake" }, { key: "philosopher", name: "Philosopher", icon: "fa-brain" },
            { key: "producer", name: "Producer", icon: "fa-clapperboard" }, { key: "professional", name: "Professional", icon: "fa-user-tie" }, { key: "scientist", name: "Scientist", icon: "fa-microscope" },
            { key: "sister", name: "Sister", icon: "fa-users" }, { key: "son", name: "Son", icon: "fa-child" }, { key: "spiritualist", name: "Spiritualist", icon: "fa-om" },
            { key: "student", name: "Student", icon: "fa-graduation-cap" }, { key: "teacher", name: "Teacher", icon: "fa-school" }, { key: "traveler", name: "Traveler", icon: "fa-plane" },
            { key: "visionary", name: "Visionary", icon: "fa-eye" }, { key: "volunteer", name: "Volunteer", icon: "fa-hands-helping" }, { key: "warrior", name: "Warrior", icon: "fa-shield-alt" },
            { key: "writer", name: "Writer", icon: "fa-pen" }, { key: "multimedia_artist", name: "Multimedia Artist", icon: "fa-layer-group" }
        ]
    },
    Health: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    Family: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    Freedom: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    Community: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    Management: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    Learning: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    Creation: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    Fun: { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] }},
    resources: [],
    financials: { incomes: [], expenses: [], savings: [], investments: [], debts: [] }
};

const dimensions = [
    { key: "health", name: "Health", max: 50 }, { key: "family", name: "Family", max: 12 }, { key: "freedom", name: "Freedom", max: 5 },
    { key: "community", name: "Community", max: 8 }, { key: "management", name: "Management", max: 10 }, { key: "learning", name: "Learning", max: 5 },
    { key: "creation", name: "Creation", max: 5 }, { key: "fun", name: "Fun", max: 5 }
];


/*****************************************************************
 * * INITIALIZATION & MAIN EVENT LISTENERS
 * *****************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    buildDimensionInputs();
    setupLeftNav();
    setupTabSwitching();
    setupAddButtons();
    setupVisualizationPage(); // <-- Called BEFORE loading
    loadFromLocalStorage();
    setupTopNav();
    setupOptions(); 
    setupManageRolesPage();

    document.getElementById("saveDataBtn").addEventListener("click", saveToLocalStorage);
    document.getElementById("loadDataBtn").addEventListener("click", () => {
        if(confirm(getTranslation("confirm_load"))) {
            loadFromLocalStorage(true);
        }
    });

    document.getElementById("profileBtn").addEventListener("click", openProfileModal);
    document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);
    document.getElementById("cancelProfileBtn").addEventListener("click", closeProfileModal);
    document.getElementById("profileImageInput").addEventListener("change", previewProfileImage);

    document.getElementById("saveResourceBtn").addEventListener("click", saveResource);
    document.getElementById("cancelResourceBtn").addEventListener("click", closeResourceModal);
    document.getElementById("deleteResourceBtn").addEventListener("click", deleteResource);
    document.getElementById("resourceImageInput").addEventListener("change", previewResourceImage);

    document.getElementById("saveFinancialItemBtn").addEventListener("click", saveFinancialItem);
    document.getElementById("deleteFinancialItemBtn").addEventListener("click", deleteFinancialItem);
    document.getElementById("cancelFinancialItemBtn").addEventListener("click", closeFinancialItemModal);

    document.getElementById('saveItemDetailBtn').addEventListener('click', saveItemDetail);

    document.body.addEventListener('click', handleGlobalClick);
});

function initializeDashboard() {
    updateLifeQuality();
    showDimensionInputs(currentDimension);
    renderLibrary(currentDimension, currentTab);
    updateUserProfileDisplay();
    setLanguage(localStorage.getItem('appLanguage') || 'en');
}

/**
 * Handles closing pop-ups (modals, selects, context menus)
 * when clicking outside of them.
 */
function handleGlobalClick(event) {
    // Close Custom Select dropdowns
    document.querySelectorAll('.custom-select-dropdown.visible').forEach(dropdown => {
        const container = dropdown.closest('.custom-select-container');
        if (container && !container.contains(event.target)) {
            dropdown.classList.remove('visible');
        }
    });

    // Close Context Menus
    document.querySelectorAll(".context-menu").forEach(menu => {
        if (!menu.contains(event.target)) {
             menu.remove();
        }
    });

    // Close any open modal by clicking on the overlay
    const openModal = document.querySelector('.modal-overlay[style*="display: flex"]');
    if (openModal && event.target === openModal) {
        openModal.style.display = 'none';
    }
}

/**
 * REFACTORED: The single source of truth for page navigation.
 * @param {string} pageId The ID of the page to show.
 * @param {object} context An optional object with data for the page.
 */
function showPage(pageId, context = {}) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.style.display = "block";

    // Call the correct render function based on the page ID
    switch (pageId) {
        case 'lifeRolesPage':
            renderLifeRolesPage();
            break;
        case 'lifeResourcesPage':
            renderLifeResourcesPage();
            break;
        case 'lifeBalancePage':
            renderLibrary(currentDimension, currentTab);
            break;
        case 'manageRolesPage':
            renderManageRolesPage();
            break;
        case 'financialsDetailPage':
            renderFinancialsPage();
            break;
        case 'resourceCategoryDetailPage':
            renderResourceCategoryPage(context);
            break;
        case 'itemDetailPage':
            renderItemDetailPage(context);
            break;
    }
}

/*****************************************************************
 * * OPTIONS & THEME SETUP
 * *****************************************************************/
function setupOptions() {
    const optionsBtn = document.getElementById('optionsBtn');
    const optionsModal = document.getElementById('optionsModal');
    const closeOptionsBtn = document.getElementById('closeOptionsBtn');
    const themeToggle = document.getElementById('themeToggle');
    const languageSelector = document.getElementById('languageSelector');

    optionsBtn.addEventListener('click', () => optionsModal.style.display = 'flex');
    closeOptionsBtn.addEventListener('click', () => optionsModal.style.display = 'none');

    optionsModal.addEventListener('click', (e) => {
        if(e.target === optionsModal) optionsModal.style.display = 'none';
    });

    themeToggle.addEventListener('change', () => {
        setTheme(themeToggle.checked ? 'light' : 'dark');
    });

    languageSelector.addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });

    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    const savedLang = localStorage.getItem('appLanguage') || 'en';

    languageSelector.value = savedLang;
    themeToggle.checked = (savedTheme === 'light');
    setTheme(savedTheme);
    setLanguage(savedLang);
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('appTheme', theme);
    updateChartColors();
}

function updateChartColors(){
    const style = getComputedStyle(document.body);
    const chartGridColor = style.getPropertyValue('--chart-grid-color').trim();
    const chartLabelColor = style.getPropertyValue('--chart-label-color').trim();

    if (chart && chart.options) {
        chart.options.scales.r.grid.color = chartGridColor;
        chart.options.scales.r.angleLines.color = chartGridColor;
        chart.options.scales.r.pointLabels.color = chartLabelColor;
        chart.update();
    }
}

/*****************************************************************
 * * INTERNATIONALIZATION (i18n)
 * *****************************************************************/
const translations = {
    en: {
        nav_life_visualization: "Life Visualization", nav_life_balance: "Life Balance", nav_life_roles: "Life Roles", nav_life_resources: "Life Resources", nav_options: "Options",
        btn_save_data: "Save Data", btn_load_data: "Load Data", btn_add: "Add", btn_done: "Done", btn_manage_roles: "Manage Roles", btn_upload_image: "Upload Image",
        btn_save: "Save", btn_delete: "Delete", btn_cancel: "Cancel", btn_add_item: "Add Item",
        title_life_quality: "Life Quality", title_manage_roles: "Manage Roles", title_available_roles: "Available Roles", title_active_roles: "Your Active Roles",
        title_edit_profile: "Edit Profile", title_edit_resource: "Edit Resource", title_add_new_resource: "Add New Resource", title_edit: "Edit", title_add_new: "Add New",
        tab_challenges: "Challenges", tab_goals: "Goals", tab_projects: "Projects", tab_routines: "Routines",
        subtitle_daily: "Daily", subtitle_weekly: "Weekly", subtitle_monthly: "Monthly",
        ph_add_challenge: "Add a new challenge...", ph_goal_name: "Goal name...", ph_status_done: "% done", ph_project_name: "Project name...", ph_routine_name: "Routine name...",
        ph_search_roles: "Search roles...", ph_create_custom_role: "Create custom role...",
        label_name: "Name", label_category: "Category", label_description: "Description", label_value: "Value ($)", label_purchase_date: "Purchase Date",
        label_amount: "Amount ($)", label_date: "Date", label_color_theme: "Color Theme", label_language: "Language",
        label_status: "Status", label_importance: "Importance", label_due_date: "Due", label_compliance: "Done Today", yes: "Yes", no: "No",
        health: "Health", family: "Family", freedom: "Freedom", community: "Community", management: "Management", learning: "Learning", creation: "Creation", fun: "Fun",
        money: "Money", total_net_worth: "Total Net Worth", incomes: "Incomes", expenses: "Expenses", savings: "Savings", investments: "Investments", debts: "Debts",
        btn_add_income: "Add Income", btn_add_expense: "Add Expense", btn_add_saving: "Add Saving", btn_add_investment: "Add Investment", btn_add_debt: "Add Debt",
        res_money: "Money", res_vehicles: "Vehicles", res_studio: "Studio", res_houses: "Houses", res_electronics: "Electronics", res_furniture: "Furniture", res_clothes: "Clothes", res_gym_and_sports: "Gym and Sports", res_musical_instruments: "Musical Instruments",
        athlete: "Athlete", artist: "Artist", brother: "Brother", chef: "Chef", citizen: "Citizen", creator: "Creator", designer: "Designer", dj: "DJ", dreamer: "Dreamer",
        engineer: "Engineer", entrepreneur: "Entrepreneur", explorer: "Explorer", father: "Father", friend: "Friend", gardener: "Gardener", healer: "Healer", human: "Human",
        innovator: "Innovator", leader: "Leader", learner: "Learner", lover: "Lover", manager: "Manager", mentor: "Mentor", mother: "Mother", musician: "Musician",
        partner: "Partner", philosopher: "Philosopher", producer: "Producer", professional: "Professional", scientist: "Scientist", sister: "Sister", son: "Son",
        spiritualist: "Spiritualist", student: "Student", teacher: "Teacher", traveler: "Traveler", visionary: "Visionary", volunteer: "Volunteer",
        warrior: "Warrior", writer: "Writer", multimedia_artist: "Multimedia Artist",
        no_items_role: "No items for this role.", no_items_category: "No items in this category yet. Click 'Add Item' to start.",
        confirm_delete: "Are you sure you want to delete this item?",
        confirm_delete_role_text: "Are you sure you want to delete the role '{roleName}'? This will remove it from all associated items.",
        confirm_load: "This will overwrite your current data with the version from your last save. Are you sure?",
    },
    es: {
        nav_life_visualization: "Visualización", nav_life_balance: "Balance de Vida", nav_life_roles: "Roles de Vida", nav_life_resources: "Recursos de Vida", nav_options: "Opciones",
        btn_save_data: "Guardar Datos", btn_load_data: "Cargar Datos", btn_add: "Añadir", btn_done: "Hecho", btn_manage_roles: "Gestionar Roles", btn_upload_image: "Subir Imagen",
        btn_save: "Guardar", btn_delete: "Eliminar", btn_cancel: "Cancelar", btn_add_item: "Añadir Objeto",
        title_life_quality: "Calidad de Vida", title_manage_roles: "Gestionar Roles", title_available_roles: "Roles Disponibles", title_active_roles: "Tus Roles Activos",
        title_edit_profile: "Editar Perfil", title_edit_resource: "Editar Recurso", title_add_new_resource: "Añadir Nuevo Recurso", title_edit: "Editar", title_add_new: "Añadir Nuevo",
        tab_challenges: "Retos", tab_goals: "Metas", tab_projects: "Proyectos", tab_routines: "Rutinas",
        subtitle_daily: "Diarias", subtitle_weekly: "Semanales", subtitle_monthly: "Mensuales",
        ph_add_challenge: "Añadir un nuevo reto...", ph_goal_name: "Nombre de la meta...", ph_status_done: "% completado", ph_project_name: "Nombre del proyecto...", ph_routine_name: "Nombre de la rutina...",
        ph_search_roles: "Buscar roles...", ph_create_custom_role: "Crear rol personalizado...",
        label_name: "Nombre", label_category: "Categoría", label_description: "Descripción", label_value: "Valor ($)", label_purchase_date: "Fecha de Compra",
        label_amount: "Monto ($)", label_date: "Fecha", label_color_theme: "Tema de Color", label_language: "Idioma",
        label_status: "Estado", label_importance: "Importancia", label_due_date: "Vence", label_compliance: "Hecho Hoy", yes: "Sí", no: "No",
        health: "Salud", family: "Familia", freedom: "Libertad", community: "Comunidad", management: "Gestión", learning: "Aprendizaje", creation: "Creación", fun: "Diversión",
        money: "Dinero", total_net_worth: "Patrimonio Neto Total", incomes: "Ingresos", expenses: "Gastos", savings: "Ahorros", investments: "Inversiones", debts: "Deudas",
        btn_add_income: "Añadir Ingreso", btn_add_expense: "Añadir Gasto", btn_add_saving: "Añadir Ahorro", btn_add_investment: "Añadir Inversión", btn_add_debt: "Añadir Deuda",
        res_money: "Dinero", res_vehicles: "Vehículos", res_studio: "Estudio", res_houses: "Viviendas", res_electronics: "Electrónica", res_furniture: "Muebles", res_clothes: "Ropa", res_gym_and_sports: "Gimnasio y Deportes", res_musical_instruments: "Instrumentos Musicales",
        athlete: "Atleta", artist: "Artista", brother: "Hermano", chef: "Chef", citizen: "Ciudadano", creator: "Creador", designer: "Diseñador", dj: "DJ", dreamer: "Soñador",
        engineer: "Ingeniero", entrepreneur: "Emprendedor", explorer: "Explorador", father: "Padre", friend: "Amigo", gardener: "Jardinero", healer: "Sanador", human: "Humano",
        innovator: "Innovador", leader: "Líder", learner: "Aprendiz", lover: "Amante", manager: "Gerente", mentor: "Mentor", mother: "Madre", musician: "Músico",
        partner: "Pareja", philosopher: "Filósofo", producer: "Productor", professional: "Profesional", scientist: "Científico", sister: "Hermana", son: "Hijo",
        spiritualist: "Espiritual", student: "Estudiante", teacher: "Profesor", traveler: "Viajero", visionary: "Visionario", volunteer: "Voluntario",
        warrior: "Guerrero", writer: "Escritor", multimedia_artist: "Artista Multimedia",
        no_items_role: "No hay objetos para este rol.", no_items_category: "Aún no hay objetos en esta categoría. Haz clic en 'Añadir Objeto' para empezar.",
        confirm_delete: "¿Estás seguro de que quieres eliminar este objeto?",
        confirm_delete_role_text: "¿Estás seguro de que quieres eliminar el rol '{roleName}'? Esto lo eliminará de todos los objetos asociados.",
        confirm_load: "Esto sobreescribirá tus datos actuales con la versión de tu último guardado. ¿Estás seguro?",
    }
};

let currentLanguage = 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    const langDict = translations[lang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (langDict[key]) elem.textContent = langDict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (langDict[key]) elem.placeholder = langDict[key];
    });

    updateDynamicText(lang);

    const activePage = [...document.querySelectorAll('.page')].find(p => p.style.display !== 'none');
    if (activePage) {
        showPage(activePage.id);
    }
}

/**
 * NEW: A safe helper function to apply translations to a specific DOM element and its children.
 * This prevents the infinite loops caused by calling setLanguage() inside a render function.
 * @param {HTMLElement} element The parent element to apply translations to.
 */
function applyTranslations(element) {
    const langDict = translations[currentLanguage] || translations.en;
    element.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (langDict[key]) {
            elem.textContent = langDict[key];
        }
    });
    element.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (langDict[key]) {
            elem.placeholder = langDict[key];
        }
    });
}

function getTranslation(key, replacements = {}) {
    let text = (translations[currentLanguage] || translations.en)[key] || key;
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
}

function updateDynamicText(lang) {
    const langDict = translations[lang] || translations.en;
    const navList = document.getElementById("dimensionNavList");
    dimensions.forEach((dim, index) => {
        const translatedName = langDict[dim.key] || dim.name;
        if (navList && navList.children[index]) {
            navList.children[index].textContent = translatedName;
        }
        if (chart && chart.data.labels) {
            chart.data.labels[index] = translatedName;
        }
    });
    if (chart) chart.update();

    const currentDimObject = dimensions.find(d => d.name === currentDimension);
    if (currentDimObject) {
        document.getElementById("selectedDimensionTitle").textContent = langDict[currentDimObject.key];
    }
    updateLifeQuality();
}

function updateUserProfileDisplay() {
    if(dimensionLibraryData.appSettings) {
        const { userName, userImage } = dimensionLibraryData.appSettings;
        document.getElementById('userName').textContent = userName;
        document.getElementById('userImage').src = userImage || 'path_to_user_image.jpg';
    }
}

/*****************************************************************
 * * NAVIGATION & PAGE SETUP
 * *****************************************************************/
function setupLeftNav() {
    const navItems = document.querySelectorAll(".leftcontainer nav ul li");
    navItems.forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("data-target");
            const activePage = document.querySelector('.page[style*="block"]');

            if (!activePage || activePage.id !== targetId) {
                currentPageOrigin = activePage ? activePage.id : 'lifeBalancePage';
            }

            navItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");
            showPage(targetId);
        });
    });
}

function setupTopNav() {
    const navList = document.getElementById("dimensionNavList");
    if (navList) {
        navList.innerHTML = '';
        dimensions.forEach(dim => {
            const li = document.createElement("li");
            li.textContent = dim.name;
            li.dataset.dimension = dim.name;
            if (dim.name === currentDimension) li.classList.add("active");
            li.addEventListener("click", () => {
                currentDimension = dim.name;
                if(document.getElementById('lifeBalancePage').style.display !== 'none') {
                    renderLibrary(currentDimension, currentTab);
                }
                showDimensionInputs(currentDimension);
                updateNavActive(currentDimension);
            });
            navList.appendChild(li);
        });
    }
}

function setupTabSwitching() {
    document.querySelectorAll(".library-tabs li").forEach(tabElem => {
        tabElem.addEventListener("click", function() {
            document.querySelectorAll(".library-tabs li").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
            const selectedTab = this.getAttribute("data-tab");
            document.getElementById("tab-" + selectedTab).classList.add("active");
            currentTab = selectedTab;
            renderLibrary(currentDimension, currentTab);
        });
    });
}

/*****************************************************************
 * * UI UPDATE & RENDERING FUNCTIONS
 * *****************************************************************/
function showDimensionInputs(dimName) { document.querySelectorAll(".dimension-input").forEach(el => el.style.display = (el.dataset.dimension === dimName) ? "grid" : "none"); }
function updateNavActive(dimName) { const navList = document.getElementById("dimensionNavList"); if (!navList) return; Array.from(navList.children).forEach(li => li.classList.toggle("active", li.dataset.dimension === dimName)); }

function renderLibrary(dimension, tab) {
    const lists = ["challengesList", "goalsList", "projectsList", "dailyRoutinesList", "weeklyRoutinesList", "monthlyRoutinesList"];
    lists.forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerHTML = ""; });

    if (!dimensionLibraryData[dimension]) {
        dimensionLibraryData[dimension] = { challenges: [], goals: [], projects: [], routines: { daily: [], weekly: [], monthly: [] } };
    };
    const data = dimensionLibraryData[dimension];

    const renderItem = (item, index, type, frequency = null) => {
        const rolesHtml = createRolesHtml(item.lifeRoles);
        let detailsHtml = '';
        if (item.status !== undefined) detailsHtml += `<span>${getTranslation('label_status')}: ${item.status}%</span>`;
        if (item.importance) detailsHtml += `<span>${getTranslation('label_importance')}: ${item.importance}</span>`;
        if (item.dueDate) detailsHtml += `<span>${getTranslation('label_due_date')}: ${item.dueDate || "N/A"}</span>`;
        if (item.compliance !== undefined) detailsHtml += `<span>${getTranslation('label_compliance')}: ${item.compliance ? getTranslation('yes') : getTranslation('no')}</span>`;

        const div = createLibraryItem(type, item.name, rolesHtml, `<div class="card-details">${detailsHtml}</div>`);

        const context = { dimension, tab: type + 's', index, frequency, originPage: 'lifeBalancePage' };
        div.addEventListener('click', () => showPage('itemDetailPage', context));

        div.querySelector(".menu-icon").addEventListener("click", (e) => {
            e.stopPropagation();
            const menuActions = [
                {label: getTranslation('title_edit'), action: () => showPage('itemDetailPage', context)},
                {label: getTranslation('btn_delete'), action: () => deleteItem(dimension, type + 's', index, frequency), className: 'delete-btn'}
            ];
            showContextMenu(e.target, menuActions);
        });

        const listId = frequency ? `${frequency}RoutinesList` : `${type}sList`;
        if(document.getElementById(listId)) document.getElementById(listId).appendChild(div);
    };

    data.challenges?.forEach((item, index) => renderItem(item, index, "challenge"));
    data.goals?.forEach((item, index) => renderItem(item, index, "goal"));
    data.projects?.forEach((item, index) => renderItem(item, index, "project"));
    if (data.routines) {
        Object.keys(data.routines).forEach(freq => {
            data.routines[freq]?.forEach((item, index) => renderItem(item, index, "routine", freq));
        });
    }
    initializeAllCustomSelects();
}

function createLibraryItem(type, title, roles, details = '') {
    const div = document.createElement("div");
    div.className = `library-item ${type}-card`;
    div.innerHTML = `
        <div class="card-title">${title}</div>
        ${details}
        ${roles}
        <i class="fas fa-ellipsis-h menu-icon"></i>`;
    return div;
}

// =================================================================================
// ==================== LIFE ROLES PAGE & MODAL LOGIC (REFACTORED) =================
// =================================================================================

/**
 * Sets up navigation and event listeners for the new Manage Roles page.
 */
function setupManageRolesPage() {
    document.getElementById('manageRolesBtn').addEventListener('click', () => {
        currentPageOrigin = 'lifeRolesPage';
        showPage('manageRolesPage');
    });

    document.getElementById('backToRolesPageLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('lifeRolesPage');
    });

    document.getElementById('addCustomRoleBtn').addEventListener('click', addCustomRole);
    document.getElementById('roleLibrarySearch').addEventListener('input', filterRoleLibrary);
}

/**
 * Renders the content for the dedicated Manage Roles page.
 */
function renderManageRolesPage() {
    const libraryList = document.getElementById('roleLibraryList');
    const userList = document.getElementById('userRoleList');
    if(!libraryList || !userList) return;

    libraryList.innerHTML = '';
    userList.innerHTML = '';

    const { userRoles, roleLibrary } = dimensionLibraryData.appSettings;
    const userRoleKeys = userRoles.map(r => r.key);

    roleLibrary
        .filter(role => !userRoleKeys.includes(role.key))
        .forEach(role => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="role-name"><i class="fas ${role.icon} fa-fw"></i> ${getTranslation(role.key)}</span><i class="fas fa-plus-circle"></i>`;
            li.querySelector('.fa-plus-circle').addEventListener('click', () => addRoleToUser(role));
            libraryList.appendChild(li);
        });

    userRoles.forEach(role => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="role-name"><i class="fas ${role.icon} fa-fw"></i> ${getTranslation(role.key)}</span><i class="fas fa-trash-alt"></i>`;
        li.querySelector('.fa-trash-alt').addEventListener('click', () => deleteRoleFromUser(role.key));
        userList.appendChild(li);
    });
}

function addRoleToUser(role) {
    const { userRoles } = dimensionLibraryData.appSettings;
    if (!userRoles.some(r => r.key === role.key)) {
        userRoles.push(role);
        saveToLocalStorage();
        renderManageRolesPage();
    }
}

function deleteRoleFromUser(roleKey) {
    const role = dimensionLibraryData.appSettings.userRoles.find(r => r.key === roleKey);
    if (!role) return;

    const translatedRoleName = getTranslation(role.key);
    if (confirm(getTranslation('confirm_delete_role_text', {roleName: translatedRoleName}))) {
        dimensionLibraryData.appSettings.userRoles = dimensionLibraryData.appSettings.userRoles.filter(r => r.key !== roleKey);

        for (const dimName in dimensionLibraryData) {
            if (typeof dimensionLibraryData[dimName] === 'object' && !['appSettings', 'resources', 'financials'].includes(dimName)) {
                const dim = dimensionLibraryData[dimName];
                ['challenges', 'goals', 'projects'].forEach(cat => {
                    dim[cat]?.forEach(item => {
                        if (item.lifeRoles) {
                            item.lifeRoles = item.lifeRoles.filter(rKey => rKey !== roleKey);
                        }
                    });
                });
                if (dim.routines) {
                    Object.values(dim.routines).forEach(freqArray => {
                        freqArray?.forEach(item => {
                            if (item.lifeRoles) {
                                item.lifeRoles = item.lifeRoles.filter(rKey => rKey !== roleKey);
                            }
                        });
                    });
                }
            }
        }

        saveToLocalStorage();
        renderManageRolesPage();
    }
}

function addCustomRole() {
    const input = document.getElementById('newCustomRoleInput');
    const roleName = input.value.trim();
    if (roleName) {
        const roleKey = roleName.toLowerCase().replace(/\s+/g, '_');
        if (dimensionLibraryData.appSettings.roleLibrary.some(r => r.key === roleKey)) {
            alert("A role with this name already exists.");
            return;
        }
        const newRole = { key: roleKey, name: roleName, icon: 'fa-star' };

        dimensionLibraryData.appSettings.roleLibrary.push(newRole);
        addRoleToUser(newRole);
        input.value = '';
    }
}

function filterRoleLibrary() {
    const filterText = document.getElementById('roleLibrarySearch').value.toLowerCase();
    const listItems = document.querySelectorAll('#roleLibraryList li');
    listItems.forEach(li => {
        const roleName = li.querySelector('.role-name').textContent.trim().toLowerCase();
        li.style.display = roleName.includes(filterText) ? 'flex' : 'none';
    });
}

/**
 * OPTIMIZED: Renders the Life Roles page efficiently.
 */
function renderLifeRolesPage() {
    const contentDiv = document.getElementById("lifeRolesContent");
    if (!contentDiv) return;

    contentDiv.innerHTML = '';
    const { userRoles } = dimensionLibraryData.appSettings;

    const itemsByRole = {};
    userRoles.forEach(role => {
        itemsByRole[role.key] = [];
    });

    for (const dimName in dimensionLibraryData) {
        if (['appSettings', 'resources', 'financials'].includes(dimName)) continue;
        const dim = dimensionLibraryData[dimName];

        const processItem = (item, index, category, tab, frequency) => {
            if (item.lifeRoles && Array.isArray(item.lifeRoles)) {
                item.lifeRoles.forEach(roleKey => {
                    if (itemsByRole[roleKey]) {
                        itemsByRole[roleKey].push({ ...item, category, dimension: dimName, tab, originalIndex: index, frequency });
                    }
                });
            }
        };

        ['challenges', 'goals', 'projects'].forEach(cat => {
            dim[cat]?.forEach((item, index) => processItem(item, index, cat.slice(0, -1), cat, null));
        });
        if (dim.routines) {
            Object.entries(dim.routines).forEach(([freq, items]) => {
                items?.forEach((item, index) => processItem(item, index, 'routine', 'routines', freq));
            });
        }
    }

    const fragment = document.createDocumentFragment();
    userRoles.forEach(role => {
        const roleCard = createRoleCard(role, itemsByRole[role.key]);
        fragment.appendChild(roleCard);
    });
    contentDiv.appendChild(fragment);

    setupRoleCardInteractions(contentDiv);
}

/**
 * Creates a role card with interactive sorting and filtering.
 */
function createRoleCard(role, itemsForRole) {
    const card = document.createElement('div');
    card.className = 'role-card';

    if (!roleCardState[role.key]) {
        roleCardState[role.key] = { filter: 'all', sort: 'default' };
    }
    const state = roleCardState[role.key];

    let processedItems = [...itemsForRole];

    if (state.filter !== 'all') {
        processedItems = processedItems.filter(item => item.category === state.filter);
    }

    const importanceMap = { High: 3, Medium: 2, Low: 1, default: 0 };
    if (state.sort === 'dueDate') {
        processedItems.sort((a, b) => (new Date(a.dueDate) || 0) - (new Date(b.dueDate) || 0));
    } else if (state.sort === 'importance') {
        processedItems.sort((a, b) => (importanceMap[b.importance] || importanceMap.default) - (importanceMap[a.importance] || importanceMap.default));
    }

    let itemsHtml = '<ul>';
    if (processedItems.length > 0) {
        processedItems.forEach(item => {
            const categoryClass = `${item.category.split(' ')[0]}-item`;
            itemsHtml += `<li class="${categoryClass}" data-dimension="${item.dimension}" data-tab="${item.tab}" data-index="${item.originalIndex}" data-frequency="${item.frequency || 'null'}">
                            ${item.name} <span class="item-category">${getTranslation(item.category)}</span>
                          </li>`;
        });
    } else {
        itemsHtml += `<li class="no-items">${getTranslation('no_items_role')}</li>`;
    }
    itemsHtml += '</ul>';

    card.innerHTML = `
        <div class="role-header">
            <i class="fas ${role.icon}"></i>
            <h3>${getTranslation(role.key)}</h3>
            <div class="role-header-actions">
                <i class="fas fa-filter" data-action="filter" data-role-key="${role.key}"></i>
                <i class="fas fa-sort-amount-down" data-action="sort" data-role-key="${role.key}"></i>
            </div>
        </div>
        ${itemsHtml}`;

    return card;
}

/**
 * Sets up click listeners for role cards, including filter/sort actions.
 */
function setupRoleCardInteractions(container) {
    container.querySelectorAll('.role-card ul li[data-dimension]').forEach(li => {
        li.addEventListener('click', (e) => {
            const { dimension, tab, index, frequency } = e.currentTarget.dataset;
            const context = { dimension, tab, index: parseInt(index, 10), frequency: (frequency === 'null' ? null : frequency), originPage: 'lifeRolesPage' };
            showPage('itemDetailPage', context);
        });
    });

    container.querySelectorAll('.role-header-actions .fas').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.dataset.action;
            const roleKey = e.target.dataset.roleKey;

            let menuItems = [];
            if (action === 'filter') {
                menuItems = [
                    { label: 'Show All', action: () => { roleCardState[roleKey].filter = 'all'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_challenges'), action: () => { roleCardState[roleKey].filter = 'challenge'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_goals'), action: () => { roleCardState[roleKey].filter = 'goal'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_projects'), action: () => { roleCardState[roleKey].filter = 'project'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_routines'), action: () => { roleCardState[roleKey].filter = 'routine'; renderLifeRolesPage(); } }
                ];
            } else if (action === 'sort') {
                menuItems = [
                    { label: 'Default', action: () => { roleCardState[roleKey].sort = 'default'; renderLifeRolesPage(); } },
                    { label: 'By Due Date', action: () => { roleCardState[roleKey].sort = 'dueDate'; renderLifeRolesPage(); } },
                    { label: 'By Importance', action: () => { roleCardState[roleKey].sort = 'importance'; renderLifeRolesPage(); } }
                ];
            }
            showContextMenu(e.target, menuItems);
        });
    });
}
// =================================================================================
// ==================== END OF LIFE ROLES LOGIC ====================================
// =================================================================================


/**
 * Renders the main page for Life Resources.
 */
function renderLifeResourcesPage() {
    const contentDiv = document.getElementById("resourcesContent");
    if (!contentDiv) return;
    contentDiv.innerHTML = '';

    const resources = dimensionLibraryData.resources || [];
    const categories = resources.reduce((acc, resource) => {
        const category = resource.category || "Uncategorized";
        if (!acc[category]) { acc[category] = { count: 0, key: category.toLowerCase().replace(/ & /g, '_and_').replace(/ /g, '_') }; }
        acc[category].count++;
        return acc;
    }, {});

    const defaultCategories = [
        { key: 'money', name: 'Money'}, { key: 'vehicles', name: 'Vehicles'}, { key: 'studio', name: 'Studio'}, { key: 'houses', name: 'Houses'},
        { key: 'electronics', name: 'Electronics'}, { key: 'furniture', name: 'Furniture'}, { key: 'clothes', name: 'Clothes'},
        { key: 'gym_and_sports', name: 'Gym and Sports'}, { key: 'musical_instruments', name: 'Musical Instruments'}
    ];

    defaultCategories.forEach(cat => {
        if(!categories[cat.name]) {
            categories[cat.name] = { count: 0, key: cat.key };
        }
    });

    const categoryIcons = { "Money": "fa-wallet", "Vehicles": "fa-car", "Studio": "fa-mountain-sun", "Houses": "fa-home", "Electronics": "fa-laptop", "Furniture": "fa-couch", "Clothes": "fa-shirt", "Gym and Sports": "fa-baseball", "Musical Instruments": "fa-guitar", "Default": "fa-box" };

    for(const categoryName in categories) {
        const card = document.createElement('div');
        card.className = 'resource-category-card';
        const translationKey = "res_" + categories[categoryName].key;
        card.innerHTML = `<div class="resource-icon"><i class="fas ${categoryIcons[categoryName] || categoryIcons['Default']}"></i></div><h3>${getTranslation(translationKey)}</h3><p class="resource-stat-label">${categories[categoryName].count} items</p>`;

        if (categoryName === 'Money') {
            card.addEventListener('click', () => {
                currentPageOrigin = 'lifeResourcesPage';
                showPage('financialsDetailPage');
            });
        } else {
            card.addEventListener('click', () => {
                currentPageOrigin = 'lifeResourcesPage';
                showPage('resourceCategoryDetailPage', { categoryName: categoryName, translationKey: translationKey });
            });
        }
        contentDiv.appendChild(card);
    }
}

/**
 * Renders the page for a specific resource category.
 */
function renderResourceCategoryPage(context) {
    const { categoryName, translationKey } = context;
    const page = document.getElementById('resourceCategoryDetailPage');

    page.innerHTML = `<div class="page-header"><h2 class="breadcrumb"><a href="#" id="backBtn"><i class="fas fa-arrow-left"></i> <span data-i18n="nav_life_resources"></span></a> / <span>${getTranslation(translationKey)}</span></h2><button id="addNewResourceItemBtn" class="primary-btn"><i class="fas fa-plus"></i> <span data-i18n="btn_add_item"></span></button></div><div id="resourceItemGrid" class="inventory-grid"></div>`;

    const itemGrid = page.querySelector('#resourceItemGrid');
    const items = dimensionLibraryData.resources.filter(r => (r.category || 'Uncategorized') === categoryName);

    if(items.length === 0) {
        itemGrid.innerHTML = `<p data-i18n="no_items_category"></p>`;
    } else {
        items.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'resource-item-card';
            card.dataset.id = resource.id;
            card.innerHTML = `<img src="${resource.imageData || 'https://via.placeholder.com/250x150'}" alt="${resource.name}" class="resource-item-card-image"><div class="resource-item-card-content"><h3>${resource.name}</h3><p>${resource.description || 'No description'}</p></div>`;
            card.addEventListener('click', () => openResourceModal(resource.id));
            itemGrid.appendChild(card);
        });
    }

    page.querySelector('#backBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(currentPageOrigin || 'lifeResourcesPage');
    });
    page.querySelector('#addNewResourceItemBtn').addEventListener('click', () => openResourceModal(null, categoryName));

    applyTranslations(page);
}

/**
 * Renders the page for financial details.
 */
function renderFinancialsPage() {
    const page = document.getElementById('financialsDetailPage');
    const financials = dimensionLibraryData.financials;
    const assetValue = (dimensionLibraryData.resources || [])
        .filter(r => r.category && r.category !== 'Money')
        .reduce((sum, item) => sum + (item.value || 0), 0);

    const calculateSum = (type) => financials[type].reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalIncomes = calculateSum('incomes');
    const totalExpenses = calculateSum('expenses');
    const totalSavings = calculateSum('savings');
    const totalInvestments = calculateSum('investments');
    const totalDebts = calculateSum('debts');

    const totalBalance = (totalIncomes + totalSavings + totalInvestments + assetValue) - (totalExpenses + totalDebts);

    page.innerHTML = `
        <div class="page-header"><h2 class="breadcrumb"><a href="#" id="backBtn"><i class="fas fa-arrow-left"></i> <span data-i18n="nav_life_resources"></span></a> / <span data-i18n="money"></span></h2></div>
        <div class="total-balance-card ${totalBalance >= 0 ? 'positive' : 'negative'}">
            <h3 data-i18n="total_net_worth"></h3>
            <p class="balance-amount">$${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div class="financials-grid">
            <div class="financial-column" data-type="incomes"><h3><i class="fas fa-arrow-down"></i> <span data-i18n="incomes"></span></h3><ul></ul><button class="secondary-btn add-financial-btn" data-i18n="btn_add_income"></button></div>
            <div class="financial-column" data-type="expenses"><h3><i class="fas fa-arrow-up"></i> <span data-i18n="expenses"></span></h3><ul></ul><button class="secondary-btn add-financial-btn" data-i18n="btn_add_expense"></button></div>
            <div class="financial-column" data-type="savings"><h3><i class="fas fa-piggy-bank"></i> <span data-i18n="savings"></span></h3><ul></ul><button class="secondary-btn add-financial-btn" data-i18n="btn_add_saving"></button></div>
            <div class="financial-column" data-type="investments"><h3><i class="fas fa-chart-line"></i> <span data-i18n="investments"></span></h3><ul></ul><button class="secondary-btn add-financial-btn" data-i18n="btn_add_investment"></button></div>
            <div class="financial-column" data-type="debts"><h3><i class="fas fa-file-invoice-dollar"></i> <span data-i18n="debts"></span></h3><ul></ul><button class="secondary-btn add-financial-btn" data-i18n="btn_add_debt"></button></div>
        </div>`;

    for (const type in financials) {
        const column = page.querySelector(`.financial-column[data-type="${type}"]`);
        const ul = column.querySelector('ul');
        financials[type].forEach(item => {
            const li = document.createElement('li');
            li.dataset.id = item.id;
            li.innerHTML = `<span class="financial-item-name">${item.name}</span><span class="financial-item-amount">$${item.amount.toLocaleString()}</span>`;
            li.addEventListener('click', () => openFinancialItemModal(type, item.id));
            ul.appendChild(li);
        });
        column.querySelector('.add-financial-btn').addEventListener('click', () => openFinancialItemModal(type));
    }

    page.querySelector('#backBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(currentPageOrigin || 'lifeResourcesPage');
    });

    applyTranslations(page);
}

/*****************************************************************
 * * CONTEXT MENUS & CUSTOM SELECTS
 * *****************************************************************/
function showContextMenu(target, menuItems) {
    handleGlobalClick(new MouseEvent('click'));
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menuItems.forEach(item => {
        const button = document.createElement("button");
        button.textContent = item.label;
        if(item.className) button.className = item.className;
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            item.action();
            handleGlobalClick(new MouseEvent('click'));
        });
        menu.appendChild(button);
    });
    document.body.appendChild(menu);
    const rect = target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.left = `${rect.left + window.scrollX - menu.offsetWidth + rect.width}px`;
}

function createCustomSelect(container, options, config = {}) { if (!container || typeof container.innerHTML === 'undefined') { console.error("Invalid container provided to createCustomSelect", container); return; } const { placeholder = 'Select...', initialValue = null, isMultiSelect = false } = config; const type = isMultiSelect ? 'checkbox' : 'radio'; const name = container.id; container.innerHTML = ` <button type="button" class="custom-select-button" aria-haspopup="listbox"> <span class="button-text">${placeholder}</span> <i class="fas fa-chevron-down"></i> </button> <div class="custom-select-dropdown" role="listbox"> ${options.map(opt => ` <label> <input type="${type}" name="${name}" value="${opt.value}"> <span class="custom-radio"></span> <span class="role-name">${opt.text}</span> </label> `).join('')} </div>`; const button = container.querySelector('.custom-select-button'); const dropdown = container.querySelector('.custom-select-dropdown'); const allOptions = container.querySelectorAll(`input`); const updateButtonText = () => { const selected = Array.from(allOptions).filter(o => o.checked); const buttonText = container.querySelector('.button-text'); if (selected.length === 0) { buttonText.textContent = placeholder; } else if (isMultiSelect) { if (selected.length === 1) buttonText.textContent = selected[0].parentElement.querySelector('.role-name').textContent; else buttonText.textContent = `${selected.length} Roles Selected`; } else { buttonText.textContent = selected[0].parentElement.querySelector('.role-name').textContent; } }; allOptions.forEach(opt => { if (isMultiSelect) { if (Array.isArray(initialValue) && initialValue.includes(opt.value)) opt.checked = true; } else { if (opt.value === String(initialValue)) opt.checked = true; } opt.addEventListener('change', () => { updateButtonText(); if (!isMultiSelect) dropdown.classList.remove('visible'); }); }); button.addEventListener('click', (e) => { e.stopPropagation(); const isVisible = dropdown.classList.contains('visible'); document.querySelectorAll('.custom-select-dropdown.visible').forEach(d => d.classList.remove('visible')); if (!isVisible) dropdown.classList.add('visible'); }); updateButtonText(); }
function getCustomSelectValue(containerId) { const container = document.getElementById(containerId); if (!container) return null; const isMultiSelect = !!container.querySelector('input[type="checkbox"]'); if (isMultiSelect) { return Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value); } const singleSelected = container.querySelector('input:checked'); return singleSelected ? singleSelected.value : null; }

/*****************************************************************
 * * DATA & FORM HANDLING
 * *****************************************************************/
function initializeAllCustomSelects() {
    const roleOptions = dimensionLibraryData.appSettings.userRoles.map(r => ({
        value: r.key,
        text: getTranslation(r.key)
    }));

    document.querySelectorAll('[id*="RolesContainer"]').forEach(container => {
        createCustomSelect(container, roleOptions, { placeholder: 'Life Roles', isMultiSelect: true });
    });

    const importanceOptions = [ { value: 'High', text: 'High' }, { value: 'Medium', text: 'Medium' }, { value: 'Low', text: 'Low' } ];
    document.querySelectorAll('[id*="ImportanceContainer"]').forEach(container => {
        createCustomSelect(container, importanceOptions, { placeholder: 'Importance', initialValue: 'Medium' });
    });

    const goals = dimensionLibraryData[currentDimension]?.goals || [];
    const goalOptions = [{ value: '', text: 'Select Goal' }, ...goals.map((g, idx) => ({ value: idx.toString(), text: g.name }))];
    document.querySelectorAll('[id*="GoalContainer"]').forEach(container => {
        createCustomSelect(container, goalOptions, { placeholder: 'Select Goal', initialValue: '' });
    });
}
function buildDimensionInputs() { dimensions.forEach(dim => { const container = document.createElement("div"); container.className = "dimension-input"; container.dataset.dimension = dim.name; container.innerHTML = `<span class="dimension-name">${dim.name}</span><input class="dimension-score" type="number" value="0" min="0" max="100" data-name="${dim.name}" placeholder="0%">`; inputsDiv.appendChild(container); inputs[dim.name] = container.querySelector('input'); inputs[dim.name].addEventListener("input", updateLifeQuality); }); }

function createRolesHtml(rolesArray) {
    if (!rolesArray || rolesArray.length === 0) return '';
    return `<div class="card-roles">${rolesArray.map(roleKey => `<span class="life-role-tag">${getTranslation(roleKey)}</span>`).join(' ')}</div>`;
}

/*****************************************************************
 * * CRUD OPERATIONS (LIBRARY ITEMS)
 * *****************************************************************/
function setupAddButtons() {
    const addConfigs = {
        "addChallengeBtn":    { type: 'challenge', inputs: { name: 'newChallengeInput' }, selects: { lifeRoles: 'newChallengeRolesContainer', importance: 'newChallengeImportanceContainer' } },
        "addGoalBtn":         { type: 'goal', inputs: { name: 'newGoalInput', status: 'newGoalStatusInput', dueDate: 'newGoalDueDateInput' }, selects: { lifeRoles: 'newGoalRolesContainer', importance: 'newGoalImportanceContainer' } },
        "addProjectBtn":      { type: 'project', inputs: { name: 'newProjectInput', status: 'newProjectStatusInput', dueDate: 'newProjectDueDateInput' }, selects: { importance: 'newProjectImportanceContainer', goalAssociation: 'newProjectGoalContainer', lifeRoles: 'newProjectRolesContainer' } },
        "addDailyRoutineBtn":   { type: 'routine', frequency: 'daily', inputs: { name: 'newDailyRoutineInput' }, selects: { goalAssociation: 'newDailyRoutineGoalContainer', lifeRoles: 'newDailyRoutineRolesContainer', importance: 'newDailyRoutineImportanceContainer' }, defaults: { compliance: false } },
        "addWeeklyRoutineBtn":  { type: 'routine', frequency: 'weekly', inputs: { name: 'newWeeklyRoutineInput' }, selects: { goalAssociation: 'newWeeklyRoutineGoalContainer', lifeRoles: 'newWeeklyRoutineRolesContainer', importance: 'newWeeklyRoutineImportanceContainer' }, defaults: { compliance: false } },
        "addMonthlyRoutineBtn": { type: 'routine', frequency: 'monthly', inputs: { name: 'newMonthlyRoutineInput' }, selects: { goalAssociation: 'newMonthlyRoutineGoalContainer', lifeRoles: 'newMonthlyRoutineRolesContainer', importance: 'newMonthlyRoutineImportanceContainer' }, defaults: { compliance: false } },
    };
    for(const btnId in addConfigs) { document.getElementById(btnId)?.addEventListener("click", () => createItem(addConfigs[btnId])); }
}
function createItem(config) { const itemData = { ...config.defaults }; let isValid = true; for (const prop in config.inputs) { const input = document.getElementById(config.inputs[prop]); if (prop === 'name' && input.value.trim() === '') { alert(`Please enter a name.`); isValid = false; break; } itemData[prop] = input.type === 'number' ? parseFloat(input.value) || 0 : input.value; input.value = ''; } if (!isValid) return; for (const prop in config.selects) { itemData[prop] = getCustomSelectValue(config.selects[prop]); } const targetArray = config.frequency ? dimensionLibraryData[currentDimension].routines[config.frequency] : dimensionLibraryData[currentDimension][config.type + 's']; targetArray.push(itemData); saveToLocalStorage(); renderLibrary(currentDimension, currentTab); }
function deleteItem(dimension, tab, index, frequency) { if (confirm(getTranslation('confirm_delete'))) { if (tab === "routines") { dimensionLibraryData[dimension].routines[frequency].splice(index, 1); } else { dimensionLibraryData[dimension][tab].splice(index, 1); } saveToLocalStorage(); renderLibrary(dimension, tab); } }

/**
 * REFACTORED: Renders the item detail page based on a context object.
 */
function renderItemDetailPage(context) {
    const { dimension, tab, index, frequency, originPage } = context;

    editingItem = { dimension, tab, index, frequency };
    currentPageOrigin = originPage;

    let item;
    if (tab === 'routines' && frequency) {
        item = dimensionLibraryData[dimension]?.routines[frequency]?.[index];
    } else {
        item = dimensionLibraryData[dimension]?.[tab]?.[index];
    }

    if (!item) { return; }

    const titleEl = document.getElementById('itemDetailTitle');
    const formContainer = document.getElementById('itemDetailFormContainer');
    const backLink = document.getElementById('backToOriginLink');

    let formHtml = '<div id="itemDetailFields">';
    formHtml += `<label><span>${getTranslation('label_name')}</span><input type="text" id="detailNameInput" value="${item.name || ''}"></label>`;
    if (item.status !== undefined) {
        formHtml += `<label><span>${getTranslation('label_status')}</span><input type="number" id="detailStatusInput" value="${item.status || 0}"></label>`;
    }
    if (item.dueDate !== undefined) {
        formHtml += `<label><span>${getTranslation('label_due_date')}</span><input type="date" id="detailDueDateInput" value="${item.dueDate || ''}"></label>`;
    }
    if (item.importance !== undefined) {
        formHtml += `<label><span>${getTranslation('label_importance')}</span><div class="custom-select-container" id="detailImportanceContainer"></div></label>`;
    }
    if (item.lifeRoles !== undefined) {
        formHtml += `<label><span>Life Roles</span><div class="custom-select-container" id="detailLifeRolesContainer"></div></label>`;
    }
    if (item.compliance !== undefined) {
        formHtml += `<label><span>${getTranslation('label_compliance')}</span><div class="custom-select-container" id="detailComplianceContainer"></div></label>`;
    }
    formHtml += '</div>';

    titleEl.textContent = `Edit ${item.name}`;
    formContainer.innerHTML = formHtml;

    backLink.onclick = (e) => {
        e.preventDefault();
        showPage(currentPageOrigin);
    };

    if (item.importance !== undefined) {
        const importanceOptions = [ { value: 'High', text: 'High' }, { value: 'Medium', text: 'Medium' }, { value: 'Low', text: 'Low' } ];
        createCustomSelect(document.getElementById('detailImportanceContainer'), importanceOptions, { placeholder: 'Importance', initialValue: item.importance });
    }
    if (item.lifeRoles !== undefined) {
        const roleOptions = dimensionLibraryData.appSettings.userRoles.map(r => ({ value: r.key, text: getTranslation(r.key) }));
        createCustomSelect(document.getElementById('detailLifeRolesContainer'), roleOptions, { placeholder: 'Life Roles', isMultiSelect: true, initialValue: item.lifeRoles });
    }
    if (item.compliance !== undefined) {
        const complianceOptions = [ { value: 'true', text: getTranslation('yes') }, { value: 'false', text: getTranslation('no') } ];
        createCustomSelect(document.getElementById('detailComplianceContainer'), complianceOptions, { placeholder: 'Compliance', initialValue: String(item.compliance) });
    }
}


function saveItemDetail() {
    const { dimension, tab, index, frequency } = editingItem;
    if (!dimension || !tab || index === null) return;

    let item;
     if (tab === 'routines' && frequency) {
        item = dimensionLibraryData[dimension].routines[frequency][index];
    } else {
        item = dimensionLibraryData[dimension][tab][index];
    }

    if (!item) { return; }

    const newName = document.getElementById('detailNameInput')?.value;
    if (newName) item.name = newName;

    if (item.status !== undefined) {
        item.status = parseFloat(document.getElementById('detailStatusInput')?.value) || 0;
    }
    if (item.dueDate !== undefined) {
        item.dueDate = document.getElementById('detailDueDateInput')?.value;
    }
    if (item.importance !== undefined) {
        item.importance = getCustomSelectValue('detailImportanceContainer');
    }
    if (item.lifeRoles !== undefined) {
        item.lifeRoles = getCustomSelectValue('detailLifeRolesContainer');
    }
    if (item.compliance !== undefined) {
        item.compliance = getCustomSelectValue('detailComplianceContainer') === 'true';
    }

    saveToLocalStorage();
    showPage(currentPageOrigin);
}

/*****************************************************************
 * * IMAGE UPLOADING & CRUD (RESOURCES & FINANCIALS)
 * *****************************************************************/

// This helper function calls our Netlify Function
async function uploadImage(base64File) {
    // Show a loading indicator to the user
    document.body.style.cursor = 'wait';

    try {
        const response = await fetch('/.netlify/functions/upload-image', {
            method: 'POST',
            body: JSON.stringify({ file: base64File }),
        });

        // If the response is not OK, we'll try to get a useful error message
        if (!response.ok) {
            // To solve the "body already consumed" error, we CLONE the response.
            // We can read the body of the clone, leaving the original response body available.
            const responseClone = response.clone();
            let errorMsg = `Image upload failed with status: ${response.status}`;
            
            try {
                // Try to parse a JSON error from the cloned response
                const err = await responseClone.json();
                errorMsg = err.error || JSON.stringify(err);
            } catch (e) {
                // If the error response wasn't JSON, get the raw text from the original response
                errorMsg = await response.text();
            }
            throw new Error(errorMsg);
        }

        const { secure_url } = await response.json();
        return secure_url;
    } catch (error) {
        // The alert will now show the true, underlying error message!
        console.error("Full upload error:", error);
        alert(`Error: ${error.message}`);
        return null;
    } finally {
        // Hide the loading indicator
        document.body.style.cursor = 'default';
    }
}


function openResourceModal(resourceId = null, category = null) {
    const modal = document.getElementById('resourceModal');
    const title = document.getElementById('resourceModalTitle');
    const deleteBtn = document.getElementById('deleteResourceBtn');
    const imagePreview = document.getElementById('resourceImagePreview');
    const categoryInput = document.getElementById('resourceCategoryInput');

    if (resourceId) {
        editingResourceId = resourceId;
        const resource = dimensionLibraryData.resources.find(r => r.id === resourceId);
        title.textContent = getTranslation('title_edit_resource');
        document.getElementById('resourceNameInput').value = resource.name;
        categoryInput.value = resource.category;
        document.getElementById('resourceDescriptionInput').value = resource.description;
        document.getElementById('resourceValueInput').value = resource.value;
        document.getElementById('resourceDateInput').value = resource.purchaseDate;
        imagePreview.src = resource.imageData || 'https://via.placeholder.com/150';
        deleteBtn.style.display = 'inline-block';
        categoryInput.disabled = true;
    } else {
        editingResourceId = null;
        title.textContent = getTranslation('title_add_new_resource');
        document.getElementById('resourceModalFields').querySelectorAll('input, textarea').forEach(el => { if(el.id !== 'resourceCategoryInput') el.value = ''; });
        categoryInput.value = category || '';
        imagePreview.src = 'https://via.placeholder.com/150';
        deleteBtn.style.display = 'none';
        categoryInput.disabled = !!category;
        if(!category) categoryInput.disabled = false;
    }
    modal.style.display = 'flex';
}
function closeResourceModal() { document.getElementById('resourceModal').style.display = 'none'; }
function saveResource() {
    // The image URL is already on the preview element's src
    const imagePreview = document.getElementById('resourceImagePreview');

    const resourceData = {
        name: document.getElementById('resourceNameInput').value,
        category: document.getElementById('resourceCategoryInput').value,
        description: document.getElementById('resourceDescriptionInput').value,
        value: parseFloat(document.getElementById('resourceValueInput').value) || 0,
        purchaseDate: document.getElementById('resourceDateInput').value,
        imageData: imagePreview.src
    };

    if (!resourceData.name || !resourceData.category) {
        alert('Please enter a name and category for the resource.');
        return;
    }

    if (editingResourceId) {
        const index = dimensionLibraryData.resources.findIndex(r => r.id === editingResourceId);
        dimensionLibraryData.resources[index] = { ...dimensionLibraryData.resources[index], ...resourceData };
    } else {
        resourceData.id = `res_${new Date().getTime()}`;
        if(!dimensionLibraryData.resources) dimensionLibraryData.resources = [];
        dimensionLibraryData.resources.push(resourceData);
    }

    saveToLocalStorage();
    showPage('resourceCategoryDetailPage', { categoryName: resourceData.category, translationKey: "res_" + resourceData.category.toLowerCase().replace(/ & /g, '_and_').replace(/ /g, '_') });
    closeResourceModal();
}

function deleteResource() {
    if (!editingResourceId) return;
    if (confirm(getTranslation('confirm_delete'))) {
        const resource = dimensionLibraryData.resources.find(r => r.id === editingResourceId);
        const category = resource.category;
        dimensionLibraryData.resources = dimensionLibraryData.resources.filter(r => r.id !== editingResourceId);
        saveToLocalStorage();
        showPage('resourceCategoryDetailPage', { categoryName: category, translationKey: "res_" + category.toLowerCase().replace(/ & /g, '_and_').replace(/ /g, '_') });
        closeResourceModal();
    }
}

function previewResourceImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64 = e.target.result;
        // Show a temporary preview
        document.getElementById('resourceImagePreview').src = base64;
        // Upload and get the permanent URL
        const finalUrl = await uploadImage(base64);
        if (finalUrl) {
            // Update the preview src to the permanent URL
            document.getElementById('resourceImagePreview').src = finalUrl;
        }
    };
    reader.readAsDataURL(file);
}

function openFinancialItemModal(type, id = null) {
    const modal = document.getElementById('financialItemModal');
    const title = document.getElementById('financialModalTitle');
    const deleteBtn = document.getElementById('deleteFinancialItemBtn');

    const nameInput = document.getElementById('financialNameInput');
    const amountInput = document.getElementById('financialAmountInput');
    const dateInput = document.getElementById('financialDateInput');

    editingFinancialInfo = { type, id };
    const typeName = type.slice(0, -1);

    if (id) {
        const item = dimensionLibraryData.financials[type].find(i => i.id === id);
        title.textContent = `${getTranslation('title_edit')} ${getTranslation(typeName)}`;
        nameInput.value = item.name;
        amountInput.value = item.amount;
        dateInput.value = item.date;
        deleteBtn.style.display = 'inline-block';
    } else {
        title.textContent = `${getTranslation('title_add_new')} ${getTranslation(typeName)}`;
        nameInput.value = '';
        amountInput.value = '';
        dateInput.value = new Date().toISOString().split('T')[0];
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
}
function closeFinancialItemModal() {
    document.getElementById('financialItemModal').style.display = 'none';
}
function saveFinancialItem() {
    const { type, id } = editingFinancialInfo;
    const name = document.getElementById('financialNameInput').value;
    const amount = parseFloat(document.getElementById('financialAmountInput').value);
    const date = document.getElementById('financialDateInput').value;

    if (!name || isNaN(amount)) {
        alert('Please enter a valid name and amount.');
        return;
    }

    if (id) {
        const item = dimensionLibraryData.financials[type].find(i => i.id === id);
        item.name = name;
        item.amount = amount;
        item.date = date;
    } else {
        const newItem = {
            id: `${type.slice(0,3)}_${new Date().getTime()}`,
            name,
            amount,
            date
        };
        dimensionLibraryData.financials[type].push(newItem);
    }

    saveToLocalStorage();
    renderFinancialsPage();
    closeFinancialItemModal();
}
function deleteFinancialItem() {
    const { type, id } = editingFinancialInfo;
    if (confirm(getTranslation('confirm_delete'))) {
        dimensionLibraryData.financials[type] = dimensionLibraryData.financials[type].filter(i => i.id !== id);
        saveToLocalStorage();
        renderFinancialsPage();
        closeFinancialItemModal();
    }
}

/*****************************************************************
 * * CHART & LIFE QUALITY CALCULATIONS
 * *****************************************************************/
const chart = new Chart(document.getElementById("radarChart").getContext("2d"), { type: "radar", data: { labels: dimensions.map(d => d.name), datasets: [{ label: "Dimension Score (%)", data: dimensions.map(() => 0), backgroundColor: "rgba(0, 170, 255, 0.2)", borderColor: "rgba(0, 170, 255, 1)", borderWidth: 2, pointBackgroundColor: "rgba(0, 170, 255, 1)" }] }, options: { responsive: true, maintainAspectRatio: false, onClick: (evt, elems) => { if (elems.length > 0) { currentDimension = dimensions[elems[0].index].name; showDimensionInputs(currentDimension); updateNavActive(currentDimension); renderLibrary(currentDimension, currentTab); } }, plugins: { legend: { display: false }, dragData: { round: 0, onDrag: (e, d, i, v) => { inputs[dimensions[i].name].value = v; updateLifeQuality(); showDimensionInputs(dimensions[i].name); } } }, scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: "rgba(255, 255, 255, 0.1)" }, angleLines: { color: "rgba(255, 255, 255, 0.1)" }, pointLabels: { color: "#e0e0e0", font: { size: 12 } } } } } });
function updateLifeQuality() { let totalObtained = 0; dimensions.forEach(dim => { totalObtained += (parseFloat(inputs[dim.name].value) || 0) / 100 * dim.max; }); const lifeQuality = totalObtained; document.getElementById("lifeQualityText").textContent = `Life Quality: ${lifeQuality.toFixed(1)}%`; const progressBar = document.getElementById("progressBar"); progressBar.style.width = `${lifeQuality}%`; const color = getColor(lifeQuality); progressBar.style.background = color; updateChart(color, lifeQuality); }
function updateChart(color, lifeQuality) { chart.data.datasets[0].data = dimensions.map(dim => parseFloat(inputs[dim.name].value) || 0); chart.data.datasets[0].borderColor = color; chart.data.datasets[0].pointBackgroundColor = color; chart.data.datasets[0].backgroundColor = color.replace(')', ', 0.2)').replace('rgb', 'rgba'); chart.update(); }
function getColor(value) { if (value >= 70) return "rgb(76, 175, 80)"; if (value >= 40) return "rgb(255, 152, 0)"; return "rgb(244, 67, 54)"; }

/*****************************************************************
 * * LOCAL STORAGE & DATA MIGRATION
 * *****************************************************************/
function saveToLocalStorage() {
    // This function is now much simpler! It just saves the whole object.
    // The image data is now stored as simple URLs from Cloudinary.
    const allData = {
        dimensionScores: dimensions.reduce((acc, dim) => ({ ...acc, [dim.name]: { score: parseFloat(inputs[dim.name].value) || 0 } }), {}),
        libraryData: dimensionLibraryData,
        visualizationData: [], // This will be rebuilt below
    };

    const visArtboard = document.getElementById('visArtboard');
    if (visArtboard) {
        visArtboard.querySelectorAll('.image-container').forEach(container => {
            const img = container.querySelector('img');
            if (img && img.src) {
                allData.visualizationData.push({
                    src: img.src, // This is now a Cloudinary URL
                    left: container.style.left,
                    top: container.style.top,
                    width: container.style.width,
                    height: container.style.height,
                });
            }
        });
    }

    localStorage.setItem("lifeQualityAppData", JSON.stringify(allData));
    console.log("Data saved!");
    alert("Your data has been saved!");
}

/**
 * A helper function to clean up old data where role names were saved instead of keys.
 */
function migrateRoleData(data) {
    if (!data.libraryData?.appSettings?.userRoles) return;

    const userRoles = data.libraryData.appSettings.userRoles;
    const roleNameToKeyMap = Object.fromEntries(userRoles.map(r => [r.name, r.key]));

    for (const dimName in data.libraryData) {
        if (typeof data.libraryData[dimName] !== 'object' || ['appSettings', 'resources', 'financials'].includes(dimName)) continue;

        const dim = data.libraryData[dimName];
        const processLifeRoles = (item) => {
            if (item.lifeRoles && Array.isArray(item.lifeRoles)) {
                item.lifeRoles = item.lifeRoles
                    .map(roleIdentifier => roleNameToKeyMap[roleIdentifier] || roleIdentifier)
                    .filter(key => key);
            }
        };

        ['challenges', 'goals', 'projects'].forEach(cat => {
            dim[cat]?.forEach(processLifeRoles);
        });
        if (dim.routines) {
            Object.values(dim.routines).forEach(freqArray => {
                freqArray?.forEach(processLifeRoles);
            });
        }
    }
}


function loadFromLocalStorage() {
    const data = localStorage.getItem("lifeQualityAppData");
    if (!data) {
        dimensionLibraryData = JSON.parse(JSON.stringify(defaultAppData));
        initializeDashboard();
        return;
    }

    const parsed = JSON.parse(data);

    // This function is kept for backwards compatibility if old data exists
    migrateRoleData(parsed);

    if(parsed.dimensionScores) {
        dimensions.forEach(dim => {
            if (parsed.dimensionScores[dim.name] && inputs[dim.name]) {
                inputs[dim.name].value = parsed.dimensionScores[dim.name].score;
            }
        });
    }

    const loadedLibrary = parsed.libraryData || {};
    if (!loadedLibrary.resources) loadedLibrary.resources = [];
    if (!loadedLibrary.financials) {
        loadedLibrary.financials = { incomes: [], expenses: [], savings: [], investments: [], debts: [] };
    }
    const financialKeys = ['incomes', 'expenses', 'savings', 'investments', 'debts'];
    financialKeys.forEach(key => {
        if (!loadedLibrary.financials[key]) {
            loadedLibrary.financials[key] = [];
        }
    });
    if(!loadedLibrary.appSettings) {
        loadedLibrary.appSettings = defaultAppData.appSettings;
    }
    
    dimensionLibraryData = loadedLibrary;

    const visArtboard = document.getElementById('visArtboard');
    if (visArtboard) {
        visArtboard.innerHTML = ''; // Clear any existing images
        if (parsed.visualizationData && Array.isArray(parsed.visualizationData)) {
            parsed.visualizationData.forEach(imgData => {
                // The src is now a URL, so we can use it directly
                addImageToArtboard(imgData.src, imgData);
            });
        }
    }

    initializeDashboard();
    console.log("Data loaded!");
}

function openProfileModal() {
    const { userName, userImage } = dimensionLibraryData.appSettings;
    document.getElementById('profileNameInput').value = userName;
    document.getElementById('profileImagePreview').src = userImage || 'https://via.placeholder.com/150';
    document.getElementById('profileModal').style.display = 'flex';
}
function closeProfileModal() { document.getElementById('profileModal').style.display = 'none'; }
function saveProfile() {
    dimensionLibraryData.appSettings.userName = document.getElementById('profileNameInput').value;
    // The image src is already the permanent Cloudinary URL
    dimensionLibraryData.appSettings.userImage = document.getElementById('profileImagePreview').src;
    updateUserProfileDisplay();
    saveToLocalStorage();
    closeProfileModal();
}
function previewProfileImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64 = e.target.result;
        // Show a temporary local preview for responsiveness
        document.getElementById('profileImagePreview').src = base64;

        // Upload to get the permanent URL
        const finalUrl = await uploadImage(base64);
        if (finalUrl) {
            // Now update the src to the permanent URL from Cloudinary
            document.getElementById('profileImagePreview').src = finalUrl;
        } else {
           // Handle upload failure, maybe revert to a default image
           // For now, we'll just leave the local preview
        }
    };
    reader.readAsDataURL(file);
}


/*****************************************************************
 * * LIFE VISUALIZATION PAGE LOGIC
 * *****************************************************************/

// This is defined outside the function so it can be accessed by loadFromLocalStorage
let addImageToArtboard = () => {};

function setupVisualizationPage() {
    const viewport = document.getElementById('visViewport');
    const artboard = document.getElementById('visArtboard');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const imageUploader = document.getElementById('imageUploader');

    if (!viewport || !artboard || !uploadBtn || !imageUploader) {
        return;
    }

    // --- State Management ---
    let scale = 0.3;
    let panX = 50;
    let panY = 50;
    let isPanning = false;
    let isSpacePressed = false;
    let panStart = { x: 0, y: 0 };
    let currentlySelected = null;

    // --- Core Functions ---

    /**
     * Applies transforms and updates the dynamic grid.
     */
    function applyTransform() {
        artboard.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        const gridSize = 100 * scale;
        viewport.style.backgroundSize = `${gridSize}px ${gridSize}px`;
        viewport.style.backgroundPosition = `${panX % gridSize}px ${panY % gridSize}px`;
    }

    /**
     * Deselects any currently selected image.
     */
    function deselectAll() {
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
            currentlySelected = null;
        }
    }

    /**
     * Handles zooming with Ctrl + Mouse Wheel.
     */
    function handleZoom(event) {
        if (!event.ctrlKey) return;
        event.preventDefault();
        const viewportRect = viewport.getBoundingClientRect();
        const mouseX = event.clientX - viewportRect.left;
        const mouseY = event.clientY - viewportRect.top;
        const scaleAmount = -event.deltaY * 0.001;
        const newScale = Math.max(0.05, Math.min(4, scale + scaleAmount));
        panX = mouseX - (mouseX - panX) * (newScale / scale);
        panY = mouseY - (mouseY - panY) * (newScale / scale);
        scale = newScale;
        applyTransform();
    }

    /**
     * MODIFIED: Now accepts an optional 'savedData' object to recreate images from storage.
     * @param {string} src - The image source (could be a local preview or a Cloudinary URL).
     * @param {object|null} savedData - Object containing position and size data.
     */
    addImageToArtboard = (src, savedData = null) => {
        const container = document.createElement('div');
        container.className = 'image-container';

        const img = document.createElement('img');
        img.src = src;
        img.className = 'visualization-image';

        // Add the handles
        container.innerHTML += `
            <div class="resize-handle top-left"></div>
            <div class="resize-handle top-right"></div>
            <div class="resize-handle bottom-left"></div>
            <div class="resize-handle bottom-right"></div>
        `;
        container.prepend(img);

        // --- Deletion Logic ---
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const menuActions = [{ label: "Delete Image", action: () => container.remove(), className: 'delete-btn' }];
            showContextMenu(e.target, menuActions);
        });

        // --- State variables for this specific image ---
        let isDragging = false;

        // --- Combined Dragging and Selection Logic ---
        img.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only for left-click
            e.preventDefault();
            e.stopPropagation();

            // Select the image
            deselectAll();
            container.classList.add('selected');
            currentlySelected = container;

            // Start dragging
            isDragging = true;
            container.classList.add('dragging');
            const originalPos = { x: parseFloat(container.style.left) || 0, y: parseFloat(container.style.top) || 0 };
            const dragStart = { x: e.clientX, y: e.clientY };

            function onMouseMove(moveEvent) {
                if (!isDragging) return;
                const dx = (moveEvent.clientX - dragStart.x) / scale;
                const dy = (moveEvent.clientY - dragStart.y) / scale;
                container.style.left = `${originalPos.x + dx}px`;
                container.style.top = `${originalPos.y + dy}px`;
            }

            function onMouseUp() {
                isDragging = false;
                container.classList.remove('dragging');
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            }

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // --- Resizing Logic ---
        container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop the drag event from firing

                let isResizing = true;
                container.classList.add('resizing');

                const resizeStart = { x: e.clientX, y: e.clientY };
                const originalSize = { width: container.offsetWidth, height: container.offsetHeight };
                const originalContainerPos = { x: parseFloat(container.style.left) || 0, y: parseFloat(container.style.top) || 0 };
                const aspectRatio = originalSize.width / originalSize.height;
                const isTop = handle.classList.contains('top-left') || handle.classList.contains('top-right');
                const isLeft = handle.classList.contains('top-left') || handle.classList.contains('bottom-left');

                function onResizeMouseMove(moveEvent) {
                    if (!isResizing) return;

                    const dx = (moveEvent.clientX - resizeStart.x) / scale;

                    let newWidth, newHeight, newLeft, newTop;

                    if (isLeft) {
                        newWidth = originalSize.width - dx;
                        newLeft = originalContainerPos.x + dx;
                    } else {
                        newWidth = originalSize.width + dx;
                        newLeft = originalContainerPos.x;
                    }
                    
                    if (isTop) {
                        newHeight = newWidth / aspectRatio;
                        newTop = originalContainerPos.y + (originalSize.height - newHeight);
                    } else {
                        newHeight = newWidth / aspectRatio;
                        newTop = originalContainerPos.y;
                    }


                    if (newWidth > 20 && newHeight > 20) {
                        container.style.width = `${newWidth}px`;
                        container.style.height = `${newHeight}px`;
                        container.style.left = `${newLeft}px`;
                        container.style.top = `${newTop}px`;
                    }
                }

                function onResizeMouseUp() {
                    isResizing = false;
                    container.classList.remove('resizing');
                    window.removeEventListener('mousemove', onResizeMouseMove);
                    window.removeEventListener('mouseup', onResizeMouseUp);
                }

                window.addEventListener('mousemove', onResizeMouseMove);
                window.addEventListener('mouseup', onResizeMouseUp);
            });
        });

        // --- Initial Position & Size ---
        if (savedData) {
            // Load from saved data
            container.style.width = savedData.width;
            container.style.height = savedData.height;
            container.style.left = savedData.left;
            container.style.top = savedData.top;
        } else {
            // Set default size for new images
            img.onload = () => {
                 const defaultWidth = 350;
                 const aspectRatio = img.naturalWidth / img.naturalHeight;
                 const defaultHeight = defaultWidth / aspectRatio;

                 container.style.width = `${defaultWidth}px`;
                 container.style.height = `${defaultHeight}px`;

                 const viewportRect = viewport.getBoundingClientRect();
                 const initialX = (viewportRect.width / 2 - panX) / scale - (defaultWidth / 2);
                 const initialY = (viewportRect.height / 2 - panY) / scale - (defaultHeight / 2);

                 container.style.left = `${initialX}px`;
                 container.style.top = `${initialY}px`;
            };
        }

        artboard.appendChild(container);
    }

    // --- Event Listeners Setup ---
    viewport.addEventListener('mousedown', (e) => {
        if (e.target === viewport || e.target === artboard) {
            deselectAll();
        }
        if (isSpacePressed) {
            isPanning = true;
            viewport.classList.add('panning');
            panStart = { x: e.clientX, y: e.clientY };
        }
    });

    window.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            viewport.classList.remove('panning');
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            panX += dx;
            panY += dy;
            panStart = { x: e.clientX, y: e.clientY };
            applyTransform();
        }
    });

    viewport.addEventListener('wheel', handleZoom, { passive: false });

    window.addEventListener('keydown', (e) => {
        // First, check if the user is typing in an input field.
        const activeEl = document.activeElement;
        const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        
        // Only prevent the default action if the spacebar is pressed AND an input is NOT focused.
        if (e.code === 'Space' && !isInputFocused) {
            e.preventDefault(); // Stop the page from scrolling
            if (!isSpacePressed) {
                isSpacePressed = true;
                viewport.style.cursor = 'grab';
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = false;
            viewport.style.cursor = 'default';
        }
    });

    uploadBtn.addEventListener('click', () => imageUploader.click());
    imageUploader.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target.result;
                // Add to artboard immediately with local preview
                addImageToArtboard(base64);
                // Upload and replace src with permanent URL
                const finalUrl = await uploadImage(base64);
                if (finalUrl) {
                    // Find the last image added and update its src
                    const lastImage = artboard.querySelector('.image-container:last-child img');
                    if (lastImage) {
                        lastImage.src = finalUrl;
                    }
                }
            };
            reader.readAsDataURL(file);
            imageUploader.value = '';
        }
    });

    // --- Initial Setup ---
    applyTransform();
}