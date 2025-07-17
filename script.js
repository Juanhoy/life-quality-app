/*****************************************************************
 * * SCRIPT WIDE SCOPE & CONSTANTS
 * *****************************************************************/
"use strict";

// Default state
let currentDimension = "Health";
let currentTab = "goals";
let lifeRolesGlobalFilter = 'all';
let todayPageSelectedDate = new Date();
let roleCardState = {};
let editingResourceId = null;
let currentPageOrigin = 'lifeBalancePage';
let editingFinancialInfo = { type: null, id: null };
let editingSkillInfo = { roleKey: null, index: null };
let editingWishlistItemInfo = { roleKey: null, index: null };

// Editing variables for library items
let editingItem = {
    dimension: null,
    tab: null,
    index: null,
    frequency: null,
};
let editingMissionInfo = {
    type: null, // 'primaryMissions' or 'secondaryMissions'
    id: null
};

// New state for sorting within library tabs
let currentSort = 'default'; // 'default', 'name', 'importance', 'custom'

// To hold Sortable.js instances
let sortableInstances = [];

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
    skills: [],
    resources: [],
    financials: { incomes: [], expenses: [], savings: [], investments: [], debts: [], monthlyIncomes: [], monthlyExpenses: [] },
    wishlist: []
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
    setupVisualizationPage();
    loadFromLocalStorage();
    setupTopNav();
    setupOptions();
    setupManageRolesPage();
    setupLibrarySort();
    setupDataHandlers(); 

    document.getElementById("saveDataBtn").addEventListener("click", saveToLocalStorage);

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

    document.getElementById('saveSkillBtn').addEventListener('click', saveSkill);
    document.getElementById('cancelSkillBtn').addEventListener('click', closeSkillModal);
    document.getElementById('deleteSkillBtn').addEventListener('click', deleteSkill);

    document.getElementById('saveWishlistItemBtn').addEventListener('click', saveWishlistItem);
    document.getElementById('cancelWishlistItemBtn').addEventListener('click', closeWishlistModal);
    document.getElementById('deleteWishlistItemBtn').addEventListener('click', deleteWishlistItem);

    document.getElementById('saveMissionBtn').addEventListener('click', saveMission);
    document.getElementById('cancelMissionBtn').addEventListener('click', closeMissionModal);
    document.getElementById('deleteMissionBtn').addEventListener('click', deleteMission);

    document.body.addEventListener('click', handleGlobalClick);

    if (typeof Sortable === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js';
        script.onload = () => {
            console.log("Sortable.js loaded!");
            renderLibrary(currentDimension, currentTab);
        };
        document.head.appendChild(script);
    }
});

function initializeDashboard() {
    updateLifeQuality();
    showDimensionInputs(currentDimension);
    renderLibrary(currentDimension, currentTab);
    updateUserProfileDisplay();
    setLanguage(localStorage.getItem('appLanguage') || 'en');
}

function handleGlobalClick(event) {
    document.querySelectorAll('.custom-select-dropdown.visible').forEach(dropdown => {
        const container = dropdown.closest('.custom-select-container');
        if (container && !container.contains(event.target)) {
            dropdown.classList.remove('visible');
        }
    });

    document.querySelectorAll(".context-menu").forEach(menu => {
        if (!menu.contains(event.target)) {
             menu.remove();
        }
    });

    const openModal = document.querySelector('.modal-overlay[style*="display: flex"]');
    if (openModal && event.target === openModal) {
        if (event.target === openModal) {
            openModal.style.display = 'none';
        }
    }
}

function showPage(pageId, context = {}) {
    document.querySelectorAll(".page").forEach(page => page.style.display = "none");
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.style.display = "block";

    if (['lifeVisualizationPage', 'lifeBalancePage', 'lifeRolesPage', 'lifeSkillsPage', 'lifeResourcesPage', 'todayPage', 'wishlistPage'].includes(pageId)) {
        currentPageOrigin = pageId;
    } else if (context.originPage) {
        currentPageOrigin = context.originPage;
    }

    switch (pageId) {
        case 'todayPage': renderTodayPage(); break;
        case 'lifeRolesPage': renderLifeRolesPage(); break;
        case 'lifeSkillsPage': renderLifeSkillsPage(); break;
        case 'lifeResourcesPage': renderLifeResourcesPage(); break;
        case 'lifeBalancePage': renderLibrary(currentDimension, currentTab); break;
        case 'manageRolesPage': renderManageRolesPage(); break;
        case 'financialsDetailPage': renderFinancialsPage(); break;
        case 'resourceCategoryDetailPage': renderResourceCategoryPage(context); break;
        case 'itemDetailPage': renderItemDetailPage(context); break;
        case 'expandedRolePage': renderExpandedRolePage(context); break;
        case 'wishlistPage': renderWishlistPage(); break;
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
        nav_life_visualization: "Life Visualization", nav_life_balance: "Life Balance", nav_life_roles: "Life Roles", nav_life_skills: "Life Skills", nav_life_resources: "Life Resources", nav_options: "Options", nav_today: "Today",
        btn_save_data: "Save Data", btn_donate: "Donate", btn_add: "Add", btn_done: "Done", btn_manage_roles: "Manage Roles", btn_upload_image: "Upload Image",
        btn_save: "Save", btn_delete: "Delete", btn_cancel: "Cancel", btn_add_item: "Add Item", btn_add_skill: "Add Skill",
        title_life_quality: "Life Quality", title_manage_roles: "Manage Roles", title_available_roles: "Available Roles", title_active_roles: "Your Active Roles",
        title_edit_profile: "Edit Profile", title_edit_resource: "Edit Resource", title_add_new_resource: "Add New Resource", title_edit: "Edit", title_add_new: "Add New",
        title_life_skills: "Life Skills", title_add_new_skill: "Add New Skill", title_edit_skill: "Edit Skill", title_today_page: "Today's Focus",
        tab_challenges: "Challenges", tab_goals: "Goals", tab_projects: "Projects", tab_routines: "Routines", tab_all: "All",
        subtitle_daily: "Daily", subtitle_weekly: "Weekly", subtitle_monthly: "Monthly",
        ph_add_challenge: "Add a new challenge...", ph_goal_name: "Goal name...", ph_status_done: "% done", ph_project_name: "Project name...", ph_routine_name: "Routine name...",
        ph_search_roles: "Search roles...", ph_create_custom_role: "Create custom role...", ph_life_roles: "Life Roles", ph_associated_skills: "Associated Skills", ph_importance: "Importance", ph_select_goal: "Select Goal",
        label_name: "Name", label_category: "Category", label_description: "Description", label_value: "Value ($)", label_purchase_date: "Purchase Date",
        label_amount: "Amount ($)", label_date: "Date", label_color_theme: "Color Theme", label_language: "Language",
        label_status: "Status", label_importance: "Importance", label_due_date: "Due", label_compliance: "Done Today", yes: "Yes", no: "No",
        label_skill_name: "Skill Name", label_knowledge_level: "Knowledge Level (%)", label_xp_level: "XP Level (%)",
        importance_high: "High", importance_medium: "Medium", importance_low: "Low",
        health: "Health", family: "Family", freedom: "Freedom", community: "Community", management: "Management", learning: "Learning", creation: "Creation", fun: "Fun",
        money: "Money", total_net_worth: "Total Net Worth", monthly_balance: "Monthly Balance", incomes: "Incomes", expenses: "Expenses", savings: "Savings", investments: "Investments", debts: "Debts", monthlyIncomes: "Monthly Incomes", monthlyExpenses: "Monthly Expenses",
        btn_add_income: "Add Income", btn_add_expense: "Add Expense", btn_add_saving: "Add Saving", btn_add_investment: "Add Investment", btn_add_debt: "Add Debt", btn_add_monthlyIncome: "Add Monthly Income", btn_add_monthlyExpense: "Add Monthly Expense",
        res_money: "Money", res_vehicles: "Vehicles", res_studio: "Studio", res_houses: "Houses", res_electronics: "Electronics", res_furniture: "Furniture", res_clothes: "Clothes", res_gym_and_sports: "Gym and Sports", res_musical_instruments: "Musical Instruments", res_wishlist: "Wishlist",
        athlete: "Athlete", artist: "Artist", brother: "Brother", chef: "Chef", citizen: "Citizen", creator: "Creator", designer: "Designer", dj: "DJ", dreamer: "Dreamer",
        engineer: "Engineer", entrepreneur: "Entrepreneur", explorer: "Explorer", father: "Father", friend: "Friend", gardener: "Gardener", healer: "Healer", human: "Human",
        innovator: "Innovator", leader: "Leader", learner: "Learner", lover: "Lover", manager: "Manager", mentor: "Mentor", mother: "Mother", musician: "Musician",
        partner: "Partner", philosopher: "Philosopher", producer: "Producer", professional: "Professional", scientist: "Scientist", sister: "Sister", son: "Son",
        spiritualist: "Spiritual", student: "Student", teacher: "Teacher", traveler: "Traveler", visionary: "Visionary", volunteer: "Volunteer",
        warrior: "Warrior", writer: "Writer", multimedia_artist: "Multimedia Artist",
        no_items_role: "No items for this role.", no_skills_role: "No skills for this role yet.", no_items_category: "No items in this category yet. Click 'Add Item' to start.",
        confirm_delete: "Are you sure you want to delete this item?",
        confirm_delete_role_text: "Are you sure you want to delete the role '{roleName}'? This will remove it from all associated items.",
        confirm_load: "This will overwrite your current data with the version from your last save. Are you sure?",
        wishlist: "Wishlist", btn_add_wish: "Add to Wishlist", title_wishlist: "Life Wishlist", title_add_new_wish: "Add New Wish", title_edit_wish: "Edit Wish",
        no_wishes_role: "No wishes for this role yet.", label_wish_category: "Category", label_estimated_cost: "Est. Cost ($)", wish_cat_object: "Object", wish_cat_travel: "Travel", wish_cat_course: "Course",
        primary_missions: "Primary Missions", secondary_missions: "Secondary Missions", btn_add_mission: "Add Mission", title_add_mission: "Add Mission", title_edit_mission: "Edit Mission", label_mission_name: "Mission Name", label_completion_date: "Completion Date",
        today_daily_routines: "Daily Routines", today_primary_missions: "Primary Missions for Today", today_secondary_missions: "Secondary Missions for Today", no_routines_today: "No daily routines found.", no_missions_today: "No missions scheduled for today.",
        sort_by_name: "Sort by Name", sort_by_importance: "Sort by Importance", sort_by_custom: "Custom Order", sort_default: "Default",
        btn_download_data: "Download Data", btn_load_data: "Load Data", confirm_load_file: "This will overwrite your current data with the contents of the file. Are you sure you want to continue?",
    },
    es: {
        nav_life_visualization: "Visualización", nav_life_balance: "Balance de Vida", nav_life_roles: "Roles de Vida", nav_life_skills: "Habilidades de Vida", nav_life_resources: "Recursos de Vida", nav_options: "Opciones", nav_today: "Hoy",
        btn_save_data: "Guardar Datos", btn_donate: "Donar", btn_add: "Añadir", btn_done: "Hecho", btn_manage_roles: "Gestionar Roles", btn_upload_image: "Subir Imagen",
        btn_save: "Guardar", btn_delete: "Eliminar", btn_cancel: "Cancelar", btn_add_item: "Añadir Objeto", btn_add_skill: "Añadir Habilidad",
        title_life_quality: "Calidad de Vida", title_manage_roles: "Gestionar Roles", title_available_roles: "Roles Disponibles", title_active_roles: "Tus Roles Activos",
        title_edit_profile: "Editar Perfil", title_edit_resource: "Editar Recurso", title_add_new_resource: "Añadir Nuevo Recurso", title_edit: "Editar", title_add_new: "Añadir Nuevo",
        title_life_skills: "Habilidades de Vida", title_add_new_skill: "Añadir Nueva Habilidad", title_edit_skill: "Editar Habilidad", title_today_page: "Enfoque de Hoy",
        tab_challenges: "Retos", tab_goals: "Metas", tab_projects: "Proyectos", tab_routines: "Rutinas", tab_all: "Todos",
        subtitle_daily: "Diarias", subtitle_weekly: "Semanales", subtitle_monthly: "Mensuales",
        ph_add_challenge: "Añadir un nuevo reto...", ph_goal_name: "Nombre de la meta...", ph_status_done: "% completado", ph_project_name: "Nombre del proyecto...", ph_routine_name: "Nombre de la rutina...",
        ph_search_roles: "Buscar roles...", ph_create_custom_role: "Crear rol personalizado...", ph_life_roles: "Roles de Vida", ph_associated_skills: "Habilidades Asociadas", ph_importance: "Importancia", ph_select_goal: "Seleccionar Meta",
        label_name: "Nombre", label_category: "Categoría", label_description: "Descripción", label_value: "Valor ($)", label_purchase_date: "Fecha de Compra",
        label_amount: "Monto ($)", label_date: "Fecha", label_color_theme: "Tema de Color", label_language: "Idioma",
        label_status: "Estado", label_importance: "Importancia", label_due_date: "Vence", label_compliance: "Hecho Hoy", yes: "Sí", no: "No",
        label_skill_name: "Nombre de Habilidad", label_knowledge_level: "Nivel de Conocimiento (%)", label_xp_level: "Nivel de XP (%)",
        importance_high: "Alta", importance_medium: "Media", importance_low: "Baja",
        health: "Salud", family: "Familia", freedom: "Libertad", community: "Comunidad", management: "Gestión", learning: "Aprendizaje", creation: "Creación", fun: "Diversión",
        money: "Dinero", total_net_worth: "Patrimonio Neto Total", monthly_balance: "Balance Mensual", incomes: "Ingresos", expenses: "Gastos", savings: "Ahorros", investments: "Inversiones", debts: "Deudas", monthlyIncomes: "Ingresos Mensuales", monthlyExpenses: "Gastos Mensuales",
        btn_add_income: "Añadir Ingreso", btn_add_expense: "Añadir Gasto", btn_add_saving: "Añadir Ahorro", btn_add_investment: "Añadir Inversión", btn_add_debt: "Añadir Deuda", btn_add_monthlyIncome: "Añadir Ingreso Mensual", btn_add_monthlyExpense: "Añadir Gasto Mensual",
        res_money: "Dinero", res_vehicles: "Vehículos", res_studio: "Estudio", res_houses: "Viviendas", res_electronics: "Electrónica", res_furniture: "Muebles", res_clothes: "Ropa", res_gym_and_sports: "Gimnasio y Deportes", res_musical_instruments: "Instrumentos Musicales", res_wishlist: "Lista de Deseos",
        athlete: "Atleta", artist: "Artista", brother: "Hermano", chef: "Chef", citizen: "Ciudadano", creator: "Creador", designer: "Diseñador", dj: "DJ", dreamer: "Soñador",
        engineer: "Ingeniero", entrepreneur: "Emprendedor", explorer: "Explorador", father: "Padre", friend: "Amigo", gardener: "Jardinero", healer: "Sanador", human: "Humano",
        innovator: "Innovador", leader: "Líder", learner: "Aprendiz", lover: "Amante", manager: "Gerente", mentor: "Mentor", mother: "Madre", musician: "Músico",
        partner: "Pareja", philosopher: "Filósofo", producer: "Productor", professional: "Profesional", scientist: "Científico", sister: "Hermana", son: "Hijo",
        spiritualist: "Espiritual", student: "Estudiante", teacher: "Profesor", traveler: "Viajero", visionary: "Visionario", volunteer: "Voluntario",
        warrior: "Guerrero", writer: "Escritor", multimedia_artist: "Artista Multimedia",
        no_items_role: "No hay objetos para este rol.", no_skills_role: "Aún no hay habilidades para este rol.", no_items_category: "Aún no hay objetos en esta categoría. Haz clic en 'Añadir Objeto' para empezar.",
        confirm_delete: "¿Estás seguro de que quieres eliminar este objeto?",
        confirm_delete_role_text: "¿Estás seguro de que quieres eliminar el rol '{roleName}'? Esto lo eliminará de todos los objetos asociados.",
        confirm_load: "Esto sobreescribirá tus datos actuales con la versión de tu último guardado. ¿Estás seguro?",
        wishlist: "Lista de Deseos", btn_add_wish: "Añadir a Lista", title_wishlist: "Lista de Deseos de Vida", title_add_new_wish: "Añadir Nuevo Deseo", title_edit_wish: "Editar Deseo",
        no_wishes_role: "Aún no hay deseos para este rol.", label_wish_category: "Categoría", label_estimated_cost: "Costo Est. ($)", wish_cat_object: "Objeto", wish_cat_travel: "Viaje", wish_cat_course: "Curso",
        primary_missions: "Misiones Primarias", secondary_missions: "Misiones Secundarias", btn_add_mission: "Añadir Misión", title_add_mission: "Añadir Misión", title_edit_mission: "Editar Misión", label_mission_name: "Nombre de la Misión", label_completion_date: "Fecha de Finalización",
        today_daily_routines: "Rutinas Diarias", today_primary_missions: "Misiones Primarias para Hoy", today_secondary_missions: "Misiones Secundarias para Hoy", no_routines_today: "No se encontraron rutinas diarias.", no_missions_today: "No hay misiones programadas para hoy.",
        sort_by_name: "Ordenar por Nombre", sort_by_importance: "Ordenar por Importancia", sort_by_custom: "Orden Personalizado", sort_default: "Predeterminado",
        btn_download_data: "Descargar Datos", btn_load_data: "Cargar Datos", confirm_load_file: "Esto sobreescribirá tus datos actuales con el contenido del archivo. ¿Estás seguro de que quieres continuar?",
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

    const activePage = [...document.querySelectorAll('.page')].find(p => p.style.display !== 'none' && p.style.display !== '');
    if (activePage) {
        showPage(activePage.id, { ...editingItem });
    }
}


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
        document.getElementById("selectedDimensionTitle").textContent = getTranslation(currentDimObject.key);
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
                document.getElementById("selectedDimensionTitle").textContent = getTranslation(dim.key);
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
            toggleSortable(currentSort === 'custom');
        });
    });
}

function setupLibrarySort() {
    const librarySection = document.querySelector('#lifeBalancePage .library-section');
    if (!librarySection) return;

    if (librarySection.querySelector('.sort-icon-container')) {
        return;
    }

    const sortIconContainer = document.createElement('div');
    sortIconContainer.className = 'sort-icon-container';
    sortIconContainer.innerHTML = `<i class="fas fa-sort menu-icon" id="librarySortIcon" style="position: static;"></i>`;
    
    const libraryTabs = librarySection.querySelector('.library-tabs');
    if (libraryTabs) {
        libraryTabs.appendChild(sortIconContainer);
    }

    document.getElementById('librarySortIcon').addEventListener('click', (e) => {
        e.stopPropagation();
        const menuActions = [
            { label: getTranslation('sort_default'), action: () => { currentSort = 'default'; renderLibrary(currentDimension, currentTab); } },
            { label: getTranslation('sort_by_name'), action: () => { currentSort = 'name'; renderLibrary(currentDimension, currentTab); } },
            { label: getTranslation('sort_by_importance'), action: () => { currentSort = 'importance'; renderLibrary(currentDimension, currentTab); } },
            { label: getTranslation('sort_by_custom'), action: () => { currentSort = 'custom'; renderLibrary(currentDimension, currentTab); } }
        ];
        showContextMenu(e.target, menuActions);
    });
}

function toggleSortable(enable) {
    const activeTabContent = document.querySelector('.tab-content.active');
    if (!activeTabContent) return;

    if (sortableInstances.length > 0) {
        sortableInstances.forEach(instance => instance.destroy());
        sortableInstances = [];
    }
    document.querySelectorAll('.library-list').forEach(list => {
        list.classList.remove('sortable-active');
    });

    if (enable && currentSort === 'custom' && typeof Sortable !== 'undefined') {
        const listElements = activeTabContent.querySelectorAll('.library-list');

        listElements.forEach(listElement => {
            listElement.classList.add('sortable-active');

            const instance = Sortable.create(listElement, {
                animation: 150,
                onEnd: function (evt) {
                    const { oldIndex, newIndex, from: listContainer } = evt;

                    let targetArray;
                    const listId = listContainer.id; 
                    
                    if (currentTab === 'routines') {
                        const frequency = listId.replace('RoutinesList', ''); // daily, weekly, monthly
                        targetArray = dimensionLibraryData[currentDimension].routines[frequency];
                    } else {
                        targetArray = dimensionLibraryData[currentDimension][currentTab];
                    }

                    if (targetArray && oldIndex !== newIndex) {
                        const [movedItem] = targetArray.splice(oldIndex, 1);
                        targetArray.splice(newIndex, 0, movedItem);
                        saveToLocalStorage(false);
                    }
                }
            });
            sortableInstances.push(instance);
        });
    }
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
    let data = dimensionLibraryData[dimension];

    const sortItems = (items) => {
        if (!items) return [];
        if (currentSort === 'name') {
            return [...items].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (currentSort === 'importance') {
            const importanceOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return [...items].sort((a, b) => (importanceOrder[b.importance] || 0) - (importanceOrder[a.importance] || 0));
        }
        return [...items];
    };

    const renderItem = (item, index, type, frequency = null) => {
        const rolesHtml = createRolesHtml(item.lifeRoles);
        const skillsHtml = createSkillsHtml(item.associatedSkills);
        let detailsHtml = '';

        if (item.status !== undefined) detailsHtml += `<span>${getTranslation('label_status')}: ${item.status}%</span>`;
        if (item.importance) detailsHtml += `<span>${getTranslation('label_importance')}: ${getTranslation('importance_' + item.importance.toLowerCase())}</span>`;
        if (item.dueDate) detailsHtml += `<span>${getTranslation('label_due_date')}: ${item.dueDate || "N/A"}</span>`;
        
        let complianceHtml = '';
        if (item.compliance !== undefined) {
            const toggleId = `compliance-toggle-${dimension}-${frequency || type}-${index}`;
            complianceHtml = `
                <div class="compliance-toggle-container">
                    <span class="toggle-label">${getTranslation('label_compliance')}:</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="${toggleId}" ${item.compliance ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
        }

        const div = createLibraryItem(type, item.name, rolesHtml, `<div class="card-details">${detailsHtml}</div>`, skillsHtml, complianceHtml);
        
        div.dataset.originalIndex = index;
        if (frequency) {
            div.dataset.frequency = frequency;
        }

        const context = { dimension, tab: type + 's', index, frequency, originPage: 'lifeBalancePage' };
        
        div.addEventListener('click', (e) => {
            if (e.target.closest('.compliance-toggle-container') || e.target.closest('.menu-icon')) {
                return;
            }
            showPage('itemDetailPage', context);
        });

        const complianceToggle = div.querySelector('.compliance-toggle-container input');
        if (complianceToggle) {
            complianceToggle.addEventListener('change', () => {
                const routine = dimensionLibraryData[dimension].routines[frequency][index];
                routine.compliance = !routine.compliance;
                saveToLocalStorage(false);
            });
        }

        const menuIcon = div.querySelector(".menu-icon");
        if(menuIcon) {
            menuIcon.addEventListener("click", (e) => {
                e.stopPropagation();
                const menuActions = [
                    {label: getTranslation('title_edit'), action: () => showPage('itemDetailPage', context)},
                    {label: getTranslation('btn_delete'), action: () => deleteItem(dimension, type + 's', index, frequency), className: 'delete-btn'}
                ];
                showContextMenu(e.target, menuActions);
            });
        }

        const listId = frequency ? `${frequency}RoutinesList` : `${type}sList`;
        if(document.getElementById(listId)) document.getElementById(listId).appendChild(div);
    };

    if (tab === 'challenges') {
        sortItems(data.challenges).forEach((item) => {
            renderItem(item, data.challenges.indexOf(item), "challenge");
        });
    } else if (tab === 'goals') {
        sortItems(data.goals).forEach((item) => {
            renderItem(item, data.goals.indexOf(item), "goal");
        });
    } else if (tab === 'projects') {
        sortItems(data.projects).forEach((item) => {
            renderItem(item, data.projects.indexOf(item), "project");
        });
    } else if (tab === 'routines' && data.routines) {
        Object.keys(data.routines).forEach(freq => {
            sortItems(data.routines[freq]).forEach((item) => {
                renderItem(item, data.routines[freq].indexOf(item), "routine", freq);
            });
        });
    }
    
    initializeAllCustomSelects();
    toggleSortable(currentSort === 'custom');
}



function createLibraryItem(type, title, roles, details = '', skills = '', compliance = '') {
    const div = document.createElement("div");
    div.className = `library-item ${type}-card`;

    if (type === 'routine') {
        div.innerHTML = `
            <div class="card-actions-container">
                ${compliance}
                <i class="fas fa-ellipsis-h menu-icon"></i>
            </div>
            <div class="card-title">${title}</div>
            ${details}
            ${roles}
            ${skills}`;
    } else {
        div.innerHTML = `
            <i class="fas fa-ellipsis-h menu-icon"></i>
            <div class="card-title">${title}</div>
            ${details}
            ${roles}
            ${skills}`;
    }
    return div;
}

// =================================================================================
// ==================== LIFE ROLES & EXPANDED PAGE LOGIC ===========================
// =================================================================================

function setupManageRolesPage() {
    document.getElementById('manageRolesBtn').addEventListener('click', () => {
        showPage('manageRolesPage');
    });

    document.getElementById('backToRolesPageLink').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('lifeRolesPage');
    });

    document.getElementById('addCustomRoleBtn').addEventListener('click', addCustomRole);
    document.getElementById('roleLibrarySearch').addEventListener('input', filterRoleLibrary);
}

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
            if (typeof dimensionLibraryData[dimName] !== 'object' || ['appSettings', 'resources', 'financials', 'skills', 'wishlist'].includes(dimName)) continue;
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
        
        if (dimensionLibraryData.wishlist) {
            dimensionLibraryData.wishlist = dimensionLibraryData.wishlist.filter(item => item.roleKey !== roleKey);
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

function renderLifeRolesPage() {
    const contentDiv = document.getElementById("lifeRolesContent");
    const pageContainer = document.getElementById("lifeRolesPage");
    if (!contentDiv || !pageContainer) return;

    const oldFilterBar = document.getElementById('lifeRolesFilterBar');
    if (oldFilterBar) oldFilterBar.remove();

    const filterBar = document.createElement('div');
    filterBar.id = 'lifeRolesFilterBar';
    filterBar.className = 'global-filter-bar';
    const filters = ['all', 'challenge', 'goal', 'project', 'routine'];
    const filterLabels = {'all': 'tab_all', 'challenge': 'tab_challenges', 'goal': 'tab_goals', 'project': 'tab_projects', 'routine': 'tab_routines' };
    
    filterBar.innerHTML = filters.map(f =>
        `<button class="btn ${lifeRolesGlobalFilter === f ? 'primary-btn' : 'secondary-btn'}" data-filter="${f}" data-i18n="${filterLabels[f]}"></button>`
    ).join('');
    pageContainer.querySelector('.page-header').insertAdjacentElement('afterend', filterBar);
    applyTranslations(filterBar);

    filterBar.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            lifeRolesGlobalFilter = btn.dataset.filter;
            renderLifeRolesPage();
        });
    });

    contentDiv.innerHTML = '';
    const { userRoles } = dimensionLibraryData.appSettings;

    const itemsByRole = {};
    userRoles.forEach(role => {
        itemsByRole[role.key] = [];
    });

    for (const dimName in dimensionLibraryData) {
        if (['appSettings', 'resources', 'financials', 'skills', 'wishlist'].includes(dimName)) continue;
        const dim = dimensionLibraryData[dimName];

        const processItem = (item, index, category, tab, frequency) => {
            if (lifeRolesGlobalFilter !== 'all' && category !== lifeRolesGlobalFilter) {
                return;
            }

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
    } else if (state.sort === 'name') {
        processedItems.sort((a, b) => a.name.localeCompare(b.name));
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
                <i class="fas fa-expand-arrows-alt" data-action="expand" data-role-key="${role.key}"></i>
            </div>
        </div>
        ${itemsHtml}`;

    return card;
}

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

            if (action === 'expand') {
                showPage('expandedRolePage', { roleKey: roleKey });
                return;
            }

            let menuItems = [];
            if (action === 'filter') {
                menuItems = [
                    { label: getTranslation('tab_all'), action: () => { roleCardState[roleKey].filter = 'all'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_challenges'), action: () => { roleCardState[roleKey].filter = 'challenge'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_goals'), action: () => { roleCardState[roleKey].filter = 'goal'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_projects'), action: () => { roleCardState[roleKey].filter = 'project'; renderLifeRolesPage(); } },
                    { label: getTranslation('tab_routines'), action: () => { roleCardState[roleKey].filter = 'routine'; renderLifeRolesPage(); } }
                ];
            } else if (action === 'sort') {
                menuItems = [
                    { label: getTranslation('sort_default'), action: () => { roleCardState[roleKey].sort = 'default'; renderLifeRolesPage(); } },
                    { label: getTranslation('sort_by_name'), action: () => { roleCardState[roleKey].sort = 'name'; renderLifeRolesPage(); } },
                    { label: getTranslation('sort_by_importance'), action: () => { roleCardState[roleKey].sort = 'importance'; renderLifeRolesPage(); } },
                ];
            }
            showContextMenu(e.target, menuItems);
        });
    });
}
// =================================================================================
// ========================= LIFE SKILLS PAGE LOGIC ================================
// =================================================================================

function renderLifeSkillsPage() {
    const contentDiv = document.getElementById("lifeSkillsContent");
    if (!contentDiv) return;

    contentDiv.innerHTML = '';
    const { userRoles } = dimensionLibraryData.appSettings;

    if (!dimensionLibraryData.skills) {
        dimensionLibraryData.skills = [];
    }

    userRoles.forEach(role => {
        const skillsForRole = dimensionLibraryData.skills.map((skill, index) => ({...skill, originalIndex: index}))
                                                       .filter(skill => skill.roleKey === role.key);
        const roleCard = createSkillCard(role, skillsForRole);
        contentDiv.appendChild(roleCard);
    });
}

function createSkillCard(role, skills) {
    const card = document.createElement('div');
    card.className = 'skill-card';

    let skillsHtml = '<ul class="skill-list">';
    if (skills.length > 0) {
        skills.forEach(skill => {
            skillsHtml += `
                <li class="skill-item" data-skill-index="${skill.originalIndex}">
                    <div>${skill.name}</div>
                    <div class="skill-details">
                        <span>${getTranslation('label_importance')}: ${getTranslation('importance_' + skill.importance.toLowerCase())}</span>
                        <span>${getTranslation('label_knowledge_level')}: ${skill.knowledgeLevel}%</span>
                        <span>${getTranslation('label_xp_level')}: ${skill.xpLevel}%</span>
                    </div>
                </li>
            `;
        });
    } else {
        skillsHtml += `<li class="no-items">${getTranslation('no_skills_role')}</li>`;
    }
    skillsHtml += '</ul>';

    card.innerHTML = `
        <div class="skill-header">
            <h3><i class="fas ${role.icon}"></i> ${getTranslation(role.key)}</h3>
            <button class="btn primary-btn add-skill-btn" data-role-key="${role.key}" data-i18n="btn_add_skill"></button>
        </div>
        ${skillsHtml}
    `;

    card.querySelector('.add-skill-btn').addEventListener('click', (e) => {
        const roleKey = e.currentTarget.dataset.roleKey;
        openSkillModal({ roleKey: roleKey });
    });

    card.querySelectorAll('.skill-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const skillIndex = parseInt(e.currentTarget.dataset.skillIndex, 10);
            openSkillModal({ index: skillIndex });
        });
    });
    
    applyTranslations(card);
    return card;
}

function openSkillModal(context) {
    const { roleKey, index } = context;
    editingSkillInfo = { roleKey, index };

    const modal = document.getElementById('skillModal');
    const title = document.getElementById('skillModalTitle');
    const deleteBtn = document.getElementById('deleteSkillBtn');

    if (index !== undefined && index !== null) {
        const skill = dimensionLibraryData.skills[index];
        editingSkillInfo.roleKey = skill.roleKey;
        title.textContent = getTranslation("title_edit_skill");
        document.getElementById('skillNameInput').value = skill.name;
        document.getElementById('skillImportanceInput').value = skill.importance;
        document.getElementById('skillKnowledgeInput').value = skill.knowledgeLevel;
        document.getElementById('skillXpInput').value = skill.xpLevel;
        deleteBtn.style.display = 'inline-block';
    } else {
        title.textContent = getTranslation("title_add_new_skill");
        document.getElementById('skillNameInput').value = '';
        document.getElementById('skillImportanceInput').value = 'High';
        document.getElementById('skillKnowledgeInput').value = '';
        document.getElementById('skillXpInput').value = '';
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeSkillModal() {
    document.getElementById('skillModal').style.display = 'none';
}

function saveSkill() {
    const { roleKey, index } = editingSkillInfo;
    const skillData = {
        roleKey: roleKey,
        name: document.getElementById('skillNameInput').value,
        importance: document.getElementById('skillImportanceInput').value,
        knowledgeLevel: parseInt(document.getElementById('skillKnowledgeInput').value) || 0,
        xpLevel: parseInt(document.getElementById('skillXpInput').value) || 0
    };

    if (!skillData.name) {
        alert('Please enter a name for the skill.');
        return;
    }

    if (index !== undefined && index !== null) {
        dimensionLibraryData.skills[index] = skillData;
    } else {
        if (!dimensionLibraryData.skills) dimensionLibraryData.skills = [];
        dimensionLibraryData.skills.push(skillData);
    }

    saveToLocalStorage();
    renderLifeSkillsPage();
    closeSkillModal();
}

function deleteSkill() {
    const { index } = editingSkillInfo;
    if (index !== undefined && index !== null) {
        if (confirm(getTranslation('confirm_delete'))) {
            dimensionLibraryData.skills.splice(index, 1);
            saveToLocalStorage();
            renderLifeSkillsPage();
            closeSkillModal();
        }
    }
}


// =================================================================================
// ==================== EXPANDED ROLE PAGE LOGIC ===================================
// =================================================================================

function renderExpandedRolePage(context) {
    const { roleKey } = context;
    const role = dimensionLibraryData.appSettings.userRoles.find(r => r.key === roleKey);
    if (!role) {
        showPage('lifeRolesPage');
        return;
    }

    const page = document.getElementById('expandedRolePage');
    const titleEl = document.getElementById('expandedRoleTitle');
    titleEl.innerHTML = `<i class="fas ${role.icon}"></i> ${getTranslation(role.key)}`;

    document.getElementById('backToRolesFromExpandedLink').onclick = (e) => {
        e.preventDefault();
        showPage('lifeRolesPage');
    };

    const tabs = page.querySelectorAll('.library-tabs li');
    const tabContents = page.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const targetId = 'tab-' + this.dataset.tab;
            tabContents.forEach(content => {
                content.style.display = content.id === targetId ? 'flex' : 'none';
                content.classList.toggle('active', content.id === targetId);
            });
        });
    });
    tabs[0].click();

    const allItems = { goals: [], challenges: [], projects: [], routines: [] };
    for (const dimName in dimensionLibraryData) {
        if (['appSettings', 'resources', 'financials', 'skills', 'wishlist'].includes(dimName)) continue;
        const dim = dimensionLibraryData[dimName];
        ['goals', 'challenges', 'projects'].forEach(cat => {
            dim[cat]?.forEach((item, index) => {
                if (item.lifeRoles?.includes(roleKey)) {
                    allItems[cat].push({ ...item, dimension: dimName, tab: cat, originalIndex: index });
                }
            });
        });
        if (dim.routines) {
            Object.entries(dim.routines).forEach(([freq, items]) => {
                items?.forEach((item, index) => {
                     if (item.lifeRoles?.includes(roleKey)) {
                        allItems.routines.push({ ...item, dimension: dimName, tab: 'routines', originalIndex: index, frequency: freq });
                    }
                });
            });
        }
    }
    const allSkills = dimensionLibraryData.skills
        .map((skill, index) => ({ ...skill, originalIndex: index }))
        .filter(skill => skill.roleKey === roleKey);
        
    renderExpandedItemList(allItems.goals, page.querySelector('#expanded-goals-list'), 'goal');
    renderExpandedItemList(allItems.challenges, page.querySelector('#expanded-challenges-list'), 'challenge');
    renderExpandedItemList(allItems.projects, page.querySelector('#expanded-projects-list'), 'project');
    renderExpandedItemList(allItems.routines, page.querySelector('#expanded-routines-list'), 'routine');
    renderExpandedItemList(allSkills, page.querySelector('#expanded-skills-list'), 'skill');

    initializeAllCustomSelects();
    
    document.getElementById('expandedAddGoalBtn').onclick = () => handleExpandedFormSubmit('goal', roleKey);
    document.getElementById('expandedAddChallengeBtn').onclick = () => handleExpandedFormSubmit('challenge', roleKey);
    document.getElementById('expandedAddProjectBtn').onclick = () => handleExpandedFormSubmit('project', roleKey);
    document.getElementById('expandedAddRoutineBtn').onclick = () => handleExpandedFormSubmit('routine', roleKey);
    document.getElementById('expandedAddSkillBtn').onclick = () => handleExpandedFormSubmit('skill', roleKey);
    
    applyTranslations(page);
}

function renderExpandedItemList(items, container, type) {
    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = `<p class="no-items">${getTranslation('no_items_role')}</p>`;
        return;
    }

    items.forEach(item => {
        let card;
        if (type === 'skill') {
            card = document.createElement('div');
            card.className = 'skill-item';
            card.innerHTML = `<div>${item.name}</div><div class="skill-details"><span>${getTranslation('label_importance')}: ${getTranslation('importance_' + item.importance.toLowerCase())}</span></div>`;
            card.addEventListener('click', () => openSkillModal({ index: item.originalIndex }));
        } else {
            const context = { dimension: item.dimension, tab: item.tab, index: item.originalIndex, frequency: item.frequency, originPage: 'expandedRolePage' };
            card = createLibraryItem(type, item.name, createRolesHtml(item.lifeRoles), '', createSkillsHtml(item.associatedSkills));
            card.addEventListener('click', () => showPage('itemDetailPage', context));
        }
        container.appendChild(card);
    });
}


function handleExpandedFormSubmit(type, roleKey) {
    let newItem = {};
    let feedbackEl;

    if (type === 'goal') {
        newItem = {
            name: document.getElementById('expandedNewGoalInput').value.trim(),
            status: parseInt(document.getElementById('expandedNewGoalStatusInput').value) || 0,
            dueDate: document.getElementById('expandedNewGoalDueDateInput').value,
            importance: getCustomSelectValue('expandedNewGoalImportanceContainer'),
            lifeRoles: [roleKey]
        };
        feedbackEl = document.getElementById('goalFeedback');
        if (newItem.name) dimensionLibraryData[currentDimension].goals.push(newItem);
    } else if (type === 'challenge') {
        newItem = {
            name: document.getElementById('expandedNewChallengeInput').value.trim(),
            importance: getCustomSelectValue('expandedNewChallengeImportanceContainer'),
            lifeRoles: [roleKey]
        };
        feedbackEl = document.getElementById('challengeFeedback');
        if (newItem.name) dimensionLibraryData[currentDimension].challenges.push(newItem);
    } else if (type === 'project') {
        newItem = {
            name: document.getElementById('expandedNewProjectInput').value.trim(),
            status: parseInt(document.getElementById('expandedNewProjectStatusInput').value) || 0,
            dueDate: document.getElementById('expandedNewProjectDueDateInput').value,
            importance: getCustomSelectValue('expandedNewProjectImportanceContainer'),
            goalAssociation: getCustomSelectValue('expandedNewProjectGoalContainer'),
            associatedSkills: getCustomSelectValue('expandedNewProjectSkillsContainer'),
            lifeRoles: [roleKey]
        };
        feedbackEl = document.getElementById('projectFeedback');
        if (newItem.name) dimensionLibraryData[currentDimension].projects.push(newItem);
    } else if (type === 'routine') {
        newItem = {
            name: document.getElementById('expandedNewRoutineInput').value.trim(),
            frequency: document.getElementById('expandedNewRoutineFrequency').value,
            importance: getCustomSelectValue('expandedNewRoutineImportanceContainer'),
            goalAssociation: getCustomSelectValue('expandedNewRoutineGoalContainer'),
            associatedSkills: getCustomSelectValue('expandedNewRoutineSkillsContainer'),
            lifeRoles: [roleKey],
            compliance: false
        };
        feedbackEl = document.getElementById('routineFeedback');
        if (newItem.name) dimensionLibraryData[currentDimension].routines[newItem.frequency].push(newItem);
    } else if (type === 'skill') {
        newItem = {
            name: document.getElementById('expandedNewSkillName').value.trim(),
            importance: document.getElementById('expandedNewSkillImportance').value,
            knowledgeLevel: parseInt(document.getElementById('expandedNewSkillKnowledge').value) || 0,
            xpLevel: parseInt(document.getElementById('expandedNewSkillXp').value) || 0,
            roleKey: roleKey
        };
        feedbackEl = document.getElementById('skillFeedback');
        if (newItem.name) dimensionLibraryData.skills.push(newItem);
    }

    if (!newItem.name) {
        alert("Please enter a name.");
        return;
    }

    saveToLocalStorage(false);
    feedbackEl.textContent = `"${newItem.name}" has been added!`;
    setTimeout(() => { feedbackEl.textContent = ''; }, 3000);

    renderExpandedRolePage({ roleKey });
}

// =================================================================================
// ==================== END OF EXPANDED ROLE PAGE LOGIC ============================
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
        { key: 'money', name: 'Money'}, { key: 'wishlist', name: 'Wishlist'},
        { key: 'vehicles', name: 'Vehicles'}, { key: 'studio', name: 'Studio'}, { key: 'houses', name: 'Houses'},
        { key: 'electronics', name: 'Electronics'}, { key: 'furniture', name: 'Furniture'}, { key: 'clothes', name: 'Clothes'},
        { key: 'gym_and_sports', name: 'Gym and Sports'}, { key: 'musical_instruments', name: 'Musical Instruments'}
    ];

    defaultCategories.forEach(cat => {
        if(!categories[cat.name]) {
            categories[cat.name] = { count: 0, key: cat.key };
        }
    });

    const categoryIcons = {
        "Money": "fa-wallet", "Wishlist": "fa-star", "Vehicles": "fa-car", "Studio": "fa-mountain-sun", "Houses": "fa-home",
        "Electronics": "fa-laptop", "Furniture": "fa-couch", "Clothes": "fa-shirt", "Gym and Sports": "fa-baseball",
        "Musical Instruments": "fa-guitar", "Default": "fa-box"
    };

    for(const categoryName in categories) {
        const card = document.createElement('div');
        card.className = 'resource-category-card';
        const translationKey = "res_" + categories[categoryName].key;
        let itemCount = categories[categoryName].count;
        
        if (categoryName === 'Wishlist') {
            itemCount = (dimensionLibraryData.wishlist || []).length;
        }
        if (categoryName === 'Money') {
            const { incomes = [], expenses = [], savings = [], investments = [], debts = [], monthlyIncomes = [], monthlyExpenses = [] } = dimensionLibraryData.financials;
            itemCount = incomes.length + expenses.length + savings.length + investments.length + debts.length + monthlyIncomes.length + monthlyExpenses.length;
        }

        card.innerHTML = `<div class="resource-icon"><i class="fas ${categoryIcons[categoryName] || categoryIcons['Default']}"></i></div><h3>${getTranslation(translationKey)}</h3><p class="resource-stat-label">${itemCount} items</p>`;

        if (categoryName === 'Money') {
            card.addEventListener('click', () => {
                showPage('financialsDetailPage');
            });
        } else if (categoryName === 'Wishlist') {
             card.addEventListener('click', () => {
                showPage('wishlistPage');
            });
        } else {
            card.addEventListener('click', () => {
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

    page.innerHTML = `<div class="page-header"><h2 class="breadcrumb"><a href="#" id="backBtn"><i class="fas fa-arrow-left"></i> <span data-i18n="nav_life_resources"></span></a> / <span>${getTranslation(translationKey)}</span></h2><button id="addNewResourceItemBtn" class="btn primary-btn"><i class="fas fa-plus"></i> <span data-i18n="btn_add_item"></span></button></div><div id="resourceItemGrid" class="inventory-grid"></div>`;
    
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
        showPage(currentPageOrigin);
    });
    page.querySelector('#addNewResourceItemBtn').addEventListener('click', () => openResourceModal(null, categoryName));

    applyTranslations(page);
}

/**
 * Renders the page for financial details.
 */
function renderFinancialsPage() {
    const page = document.getElementById('financialsDetailPage');
    if (!page) return;

    const financials = dimensionLibraryData.financials || {};
    const calculateSum = (type) => (Array.isArray(financials[type]) ? financials[type] : []).reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const totalIncomes = calculateSum('incomes');
    const totalExpenses = calculateSum('expenses');
    const totalSavings = calculateSum('savings');
    const totalInvestments = calculateSum('investments');
    const totalDebts = calculateSum('debts');
    const totalMonthlyIncomes = calculateSum('monthlyIncomes');
    const totalMonthlyExpenses = calculateSum('monthlyExpenses');
    
    const assetValue = (dimensionLibraryData.resources || [])
        .filter(r => r.category && r.category !== 'Money' && r.value)
        .reduce((sum, item) => sum + item.value, 0);

    const totalBalance = (totalIncomes + totalSavings + totalInvestments + assetValue) - (totalExpenses + totalDebts);
    const monthlyBalance = totalMonthlyIncomes - totalMonthlyExpenses;

    page.innerHTML = `
        <div class="page-header">
            <h2 class="breadcrumb"><a href="#" id="backBtn"><i class="fas fa-arrow-left"></i> <span data-i18n="nav_life_resources"></span></a> / <span data-i18n="res_money"></span></h2>
        </div>
        <div class="total-balance-card ${totalBalance >= 0 ? 'positive' : 'negative'}">
            <h3 data-i18n="total_net_worth"></h3>
            <p class="balance-amount">$${totalBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div class="total-balance-card ${monthlyBalance >= 0 ? 'positive' : 'negative'}" style="margin-top: 20px; border-left-color: #ff9800;">
            <h3 data-i18n="monthly_balance"></h3>
            <p class="balance-amount">$${monthlyBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>

        <div class="financials-grid">
            <div class="financial-column" data-type="monthlyIncomes"><h3><i class="fas fa-calendar-day"></i> <span data-i18n="monthlyIncomes"></span></h3><ul></ul><button class="btn secondary-btn add-financial-btn" data-i18n="btn_add_monthlyIncome"></button></div>
            <div class="financial-column" data-type="monthlyExpenses"><h3><i class="fas fa-calendar-times"></i> <span data-i18n="monthlyExpenses"></span></h3><ul></ul><button class="btn secondary-btn add-financial-btn" data-i18n="btn_add_monthlyExpense"></button></div>
            <div class="financial-column" data-type="incomes"><h3><i class="fas fa-arrow-down"></i> <span data-i18n="incomes"></span></h3><ul></ul><button class="btn secondary-btn add-financial-btn" data-i18n="btn_add_income"></button></div>
            <div class="financial-column" data-type="expenses"><h3><i class="fas fa-arrow-up"></i> <span data-i18n="expenses"></span></h3><ul></ul><button class="btn secondary-btn add-financial-btn" data-i18n="btn_add_expense"></button></div>
            <div class="financial-column" data-type="savings"><h3><i class="fas fa-piggy-bank"></i> <span data-i18n="savings"></span></h3><ul></ul><button class="btn secondary-btn add-financial-btn" data-i18n="btn_add_saving"></button></div>
            <div class="financial-column" data-type="investments"><h3><i class="fas fa-chart-line"></i> <span data-i18n="investments"></span></h3><ul></ul><button class="btn secondary-btn add-financial-btn" data-i18n="btn_add_investment"></button></div>
            <div class="financial-column" data-type="debts"><h3><i class="fas fa-file-invoice-dollar"></i> <span data-i18n="debts"></span></h3><ul></ul><button class="btn secondary-btn add-financial-btn" data-i18n="btn_add_debt"></button></div>
        </div>`;

    for (const type in financials) {
        if (page.querySelector(`.financial-column[data-type="${type}"]`)) {
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
    }

    page.querySelector('#backBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(currentPageOrigin);
    });

    applyTranslations(page);
}


/*****************************************************************
 * * WISHLIST PAGE
 * *****************************************************************/

function renderWishlistPage() {
    const page = document.getElementById("wishlistPage");
    if (!page) return;

    page.innerHTML = `
        <div class="page-header">
            <h2 class="breadcrumb">
                <a href="#" id="backBtn"><i class="fas fa-arrow-left"></i> <span data-i18n="nav_life_resources"></span></a> / <span data-i18n="title_wishlist"></span>
            </h2>
        </div>
        <div id="wishlistContent" class="roles-grid"></div>
    `;

    page.querySelector('#backBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showPage(currentPageOrigin);
    });

    const contentDiv = page.querySelector("#wishlistContent");
    const { userRoles } = dimensionLibraryData.appSettings;

    if (!dimensionLibraryData.wishlist) {
        dimensionLibraryData.wishlist = [];
    }

    userRoles.forEach(role => {
        const wishesForRole = dimensionLibraryData.wishlist
            .map((wish, index) => ({...wish, originalIndex: index}))
            .filter(wish => wish.roleKey === role.key);
        const roleCard = createWishlistCard(role, wishesForRole);
        contentDiv.appendChild(roleCard);
    });

    applyTranslations(page);
}


function createWishlistCard(role, wishes) {
    const card = document.createElement('div');
    card.className = 'wish-card';

    let wishesHtml = '<ul class="wish-list">';
    if (wishes.length > 0) {
        wishes.forEach(wish => {
            wishesHtml += `
                <li class="wish-item" data-wish-index="${wish.originalIndex}">
                    <div>${wish.name} (${getTranslation('wish_cat_' + wish.category.toLowerCase())})</div>
                    <div class="wish-details">
                        <span>${getTranslation('label_importance')}: ${getTranslation('importance_' + wish.importance.toLowerCase())}</span>
                        <span>${getTranslation('label_estimated_cost')}: $${wish.cost.toLocaleString()}</span>
                    </div>
                </li>
            `;
        });
    } else {
        wishesHtml += `<li class="no-items">${getTranslation('no_wishes_role')}</li>`;
    }
    wishesHtml += '</ul>';

    card.innerHTML = `
        <div class="skill-header">
            <h3><i class="fas ${role.icon}"></i> ${getTranslation(role.key)}</h3>
            <button class="btn primary-btn add-wish-btn" data-role-key="${role.key}"><i class="fas fa-plus"></i> <span data-i18n="btn_add_wish"></span></button>
        </div>
        ${wishesHtml}
    `;

    card.querySelector('.add-wish-btn').addEventListener('click', (e) => {
        const roleKey = e.currentTarget.dataset.roleKey;
        openWishlistModal({ roleKey: roleKey });
    });

    card.querySelectorAll('.wish-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const wishIndex = parseInt(e.currentTarget.dataset.wishIndex, 10);
            openWishlistModal({ index: wishIndex });
        });
    });

    return card;
}


function openWishlistModal(context) {
    const { roleKey, index } = context;
    editingWishlistItemInfo = { roleKey, index };

    const modal = document.getElementById('wishlistItemModal');
    const title = document.getElementById('wishlistItemModalTitle');
    const deleteBtn = document.getElementById('deleteWishlistItemBtn');

    if (index !== undefined && index !== null) {
        const item = dimensionLibraryData.wishlist[index];
        editingWishlistItemInfo.roleKey = item.roleKey;
        title.textContent = getTranslation("title_edit_wish");
        document.getElementById('wishlistItemNameInput').value = item.name;
        document.getElementById('wishlistItemCategoryInput').value = item.category;
        document.getElementById('wishlistItemCostInput').value = item.cost;
        document.getElementById('wishlistItemImportanceInput').value = item.importance;
        deleteBtn.style.display = 'inline-block';
    } else {
        title.textContent = getTranslation("title_add_new_wish");
        document.getElementById('wishlistItemNameInput').value = '';
        document.getElementById('wishlistItemCategoryInput').value = 'Object';
        document.getElementById('wishlistItemCostInput').value = '';
        document.getElementById('wishlistItemImportanceInput').value = 'Medium';
        deleteBtn.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeWishlistModal() {
    document.getElementById('wishlistItemModal').style.display = 'none';
}

function saveWishlistItem() {
    const { roleKey, index } = editingWishlistItemInfo;
    const wishData = {
        roleKey: roleKey,
        name: document.getElementById('wishlistItemNameInput').value,
        category: document.getElementById('wishlistItemCategoryInput').value,
        cost: parseFloat(document.getElementById('wishlistItemCostInput').value) || 0,
        importance: document.getElementById('wishlistItemImportanceInput').value,
        id: `wish_${new Date().getTime()}`
    };

    if (!wishData.name) {
        alert('Please enter a name for the wish.');
        return;
    }

    if (index !== undefined && index !== null) {
        wishData.id = dimensionLibraryData.wishlist[index].id;
        dimensionLibraryData.wishlist[index] = wishData;
    } else {
        if (!dimensionLibraryData.wishlist) dimensionLibraryData.wishlist = [];
        dimensionLibraryData.wishlist.push(wishData);
    }

    saveToLocalStorage();
    renderWishlistPage();
    closeWishlistModal();
}

function deleteWishlistItem() {
    const { index } = editingWishlistItemInfo;
    if (index !== undefined && index !== null) {
        if (confirm(getTranslation('confirm_delete'))) {
            dimensionLibraryData.wishlist.splice(index, 1);
            saveToLocalStorage();
            renderWishlistPage();
            closeWishlistModal();
        }
    }
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

function createCustomSelect(container, options, config = {}) { if (!container || typeof container.innerHTML === 'undefined') { console.error("Invalid container provided to createCustomSelect", container); return; } const { placeholder = 'Select...', initialValue = null, isMultiSelect = false } = config; const type = isMultiSelect ? 'checkbox' : 'radio'; const name = container.id; container.innerHTML = ` <button type="button" class="custom-select-button" aria-haspopup="listbox"> <span class="button-text">${placeholder}</span> <i class="fas fa-chevron-down"></i> </button> <div class="custom-select-dropdown" role="listbox"> ${options.map(opt => ` <label> <input type="${type}" name="${name}" value="${opt.value}"> <span class="custom-radio"></span> <span class="role-name">${opt.text}</span> </label> `).join('')} </div>`; const button = container.querySelector('.custom-select-button'); const dropdown = container.querySelector('.custom-select-dropdown'); const allOptions = container.querySelectorAll(`input`); const updateButtonText = () => { const selected = Array.from(allOptions).filter(o => o.checked); const buttonText = container.querySelector('.button-text'); if (selected.length === 0) { buttonText.textContent = placeholder; } else if (isMultiSelect) { if (selected.length === 1) buttonText.textContent = selected[0].parentElement.querySelector('.role-name').textContent; else buttonText.textContent = `${selected.length} Selected`; } else { buttonText.textContent = selected[0].parentElement.querySelector('.role-name').textContent; } }; allOptions.forEach(opt => { if (isMultiSelect) { if (Array.isArray(initialValue) && initialValue.includes(opt.value)) opt.checked = true; } else { if (opt.value === String(initialValue)) opt.checked = true; } opt.addEventListener('change', () => { updateButtonText(); if (!isMultiSelect) dropdown.classList.remove('visible'); }); }); button.addEventListener('click', (e) => { e.stopPropagation(); const isVisible = dropdown.classList.contains('visible'); document.querySelectorAll('.custom-select-dropdown.visible').forEach(d => d.classList.remove('visible')); if (!isVisible) dropdown.classList.add('visible'); }); updateButtonText(); }
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
        createCustomSelect(container, roleOptions, { placeholder: getTranslation('ph_life_roles'), isMultiSelect: true });
    });

    const importanceOptions = [
        { value: 'High', text: getTranslation('importance_high') },
        { value: 'Medium', text: getTranslation('importance_medium') },
        { value: 'Low', text: getTranslation('importance_low') }
    ];
    document.querySelectorAll('[id*="ImportanceContainer"]').forEach(container => {
        createCustomSelect(container, importanceOptions, { placeholder: getTranslation('ph_importance'), initialValue: 'Medium' });
    });

    const goals = dimensionLibraryData[currentDimension]?.goals || [];
    const goalOptions = [{ value: '', text: getTranslation('ph_select_goal') }, ...goals.map((g, idx) => ({ value: idx.toString(), text: g.name }))];
    document.querySelectorAll('[id*="GoalContainer"]').forEach(container => {
        createCustomSelect(container, goalOptions, { placeholder: getTranslation('ph_select_goal'), initialValue: '' });
    });

    const skillOptions = (dimensionLibraryData.skills || []).map((skill, index) => ({
        value: index.toString(),
        text: skill.name
    }));
    document.querySelectorAll('[id*="SkillsContainer"]').forEach(container => {
        createCustomSelect(container, skillOptions, { placeholder: getTranslation('ph_associated_skills'), isMultiSelect: true });
    });
}
function buildDimensionInputs() { dimensions.forEach(dim => { const container = document.createElement("div"); container.className = "dimension-input"; container.dataset.dimension = dim.name; container.innerHTML = `<span class="dimension-name">${dim.name}</span><input class="dimension-score" type="number" value="0" min="0" max="100" data-name="${dim.name}" placeholder="0%">`; inputsDiv.appendChild(container); inputs[dim.name] = container.querySelector('input'); inputs[dim.name].addEventListener("input", updateLifeQuality); }); }

function createRolesHtml(rolesArray) {
    if (!rolesArray || rolesArray.length === 0) return '';
    return `<div class="card-roles">${rolesArray.map(roleKey => `<span class="life-role-tag">${getTranslation(roleKey)}</span>`).join(' ')}</div>`;
}

function createSkillsHtml(skillIndexArray) {
    if (!skillIndexArray || skillIndexArray.length === 0) return '';
    const allSkills = dimensionLibraryData.skills || [];
    return `<div class="card-skills">${skillIndexArray.map(skillIndex => {
        const skill = allSkills[skillIndex];
        return skill ? `<span class="skill-tag">${skill.name}</span>` : '';
    }).join(' ')}</div>`;
}

/*****************************************************************
 * * CRUD OPERATIONS (LIBRARY ITEMS)
 * *****************************************************************/
function setupAddButtons() {
    const addConfigs = {
        "addChallengeBtn":    { type: 'challenge', inputs: { name: 'newChallengeInput' }, selects: { lifeRoles: 'newChallengeRolesContainer', importance: 'newChallengeImportanceContainer' } },
        "addGoalBtn":         { type: 'goal', inputs: { name: 'newGoalInput', status: 'newGoalStatusInput', dueDate: 'newGoalDueDateInput' }, selects: { lifeRoles: 'newGoalRolesContainer', importance: 'newGoalImportanceContainer' } },
        "addProjectBtn":      { type: 'project', inputs: { name: 'newProjectInput', status: 'newProjectStatusInput', dueDate: 'newProjectDueDateInput' }, selects: { importance: 'newProjectImportanceContainer', goalAssociation: 'newProjectGoalContainer', lifeRoles: 'newProjectRolesContainer', associatedSkills: 'newProjectSkillsContainer' } },
        "addDailyRoutineBtn":   { type: 'routine', frequency: 'daily', inputs: { name: 'newDailyRoutineInput' }, selects: { goalAssociation: 'newDailyRoutineGoalContainer', lifeRoles: 'newDailyRoutineRolesContainer', importance: 'newDailyRoutineImportanceContainer', associatedSkills: 'newDailyRoutineSkillsContainer' }, defaults: { compliance: false } },
        "addWeeklyRoutineBtn":  { type: 'routine', frequency: 'weekly', inputs: { name: 'newWeeklyRoutineInput' }, selects: { goalAssociation: 'newWeeklyRoutineGoalContainer', lifeRoles: 'newWeeklyRoutineRolesContainer', importance: 'newWeeklyRoutineImportanceContainer', associatedSkills: 'newWeeklyRoutineSkillsContainer' }, defaults: { compliance: false } },
        "addMonthlyRoutineBtn": { type: 'routine', frequency: 'monthly', inputs: { name: 'newMonthlyRoutineInput' }, selects: { goalAssociation: 'newMonthlyRoutineGoalContainer', lifeRoles: 'newMonthlyRoutineRolesContainer', importance: 'newMonthlyRoutineImportanceContainer', associatedSkills: 'newMonthlyRoutineSkillsContainer' }, defaults: { compliance: false } },
    };
    for(const btnId in addConfigs) { document.getElementById(btnId)?.addEventListener("click", () => createItem(addConfigs[btnId])); }
}
function createItem(config) {
    const itemData = { ...config.defaults };
    let isValid = true;
    for (const prop in config.inputs) {
        const input = document.getElementById(config.inputs[prop]);
        if (prop === 'name' && input.value.trim() === '') {
            alert(`Please enter a name.`);
            isValid = false;
            break;
        }
        itemData[prop] = input.type === 'number' ? parseFloat(input.value) || 0 : input.value;
        input.value = '';
    }
    if (!isValid) return;
    for (const prop in config.selects) {
        itemData[prop] = getCustomSelectValue(config.selects[prop]);
    }

    if (config.type === 'project') {
        itemData.primaryMissions = [];
        itemData.secondaryMissions = [];
    }

    const targetArray = config.frequency ? dimensionLibraryData[currentDimension].routines[config.frequency] : dimensionLibraryData[currentDimension][config.type + 's'];
    targetArray.push(itemData);
    saveToLocalStorage();
    renderLibrary(currentDimension, currentTab);
}
function deleteItem(dimension, tab, index, frequency) { if (confirm(getTranslation('confirm_delete'))) { if (tab === "routines") { dimensionLibraryData[dimension].routines[frequency].splice(index, 1); } else { dimensionLibraryData[dimension][tab].splice(index, 1); } saveToLocalStorage(); renderLibrary(dimension, currentTab); } }

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

    const page = document.getElementById('itemDetailPage');
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
    if (item.goalAssociation !== undefined) {
        formHtml += `<label><span>${getTranslation('ph_select_goal')}</span><div class="custom-select-container" id="detailGoalContainer"></div></label>`;
    }
    if (item.associatedSkills !== undefined) {
        formHtml += `<label><span>${getTranslation('ph_associated_skills')}</span><div class="custom-select-container" id="detailSkillsContainer"></div></label>`;
    }
    if (item.lifeRoles !== undefined) {
        formHtml += `<label><span>${getTranslation('ph_life_roles')}</span><div class="custom-select-container" id="detailLifeRolesContainer"></div></label>`;
    }
    if (item.compliance !== undefined) {
        formHtml += `<label><span>${getTranslation('label_compliance')}</span><div class="custom-select-container" id="detailComplianceContainer"></div></label>`;
    }
    formHtml += '</div>';

    titleEl.textContent = `Edit ${item.name}`;
    formContainer.innerHTML = formHtml;
    
    const oldMissionsContainer = page.querySelector('.missions-container');
    if(oldMissionsContainer) oldMissionsContainer.remove();

    if (tab === 'projects') {
        renderProjectMissions(page, item);
    }

    backLink.onclick = (e) => {
        e.preventDefault();
        showPage(currentPageOrigin);
    };

    if (item.importance !== undefined) {
        const importanceOptions = [ { value: 'High', text: getTranslation('importance_high') }, { value: 'Medium', text: getTranslation('importance_medium') }, { value: 'Low', text: getTranslation('importance_low') } ];
        createCustomSelect(document.getElementById('detailImportanceContainer'), importanceOptions, { placeholder: getTranslation('ph_importance'), initialValue: item.importance });
    }
    if (item.lifeRoles !== undefined) {
        const roleOptions = dimensionLibraryData.appSettings.userRoles.map(r => ({ value: r.key, text: getTranslation(r.key) }));
        createCustomSelect(document.getElementById('detailLifeRolesContainer'), roleOptions, { placeholder: getTranslation('ph_life_roles'), isMultiSelect: true, initialValue: item.lifeRoles });
    }
    if (item.goalAssociation !== undefined) {
        const goals = dimensionLibraryData[dimension]?.goals || [];
        const goalOptions = [{ value: '', text: 'None' }, ...goals.map((g, idx) => ({ value: idx.toString(), text: g.name }))];
        createCustomSelect(document.getElementById('detailGoalContainer'), goalOptions, { placeholder: getTranslation('ph_select_goal'), initialValue: item.goalAssociation });
    }
    if (item.associatedSkills !== undefined) {
        const skillOptions = (dimensionLibraryData.skills || []).map((skill, index) => ({ value: index.toString(), text: skill.name }));
        createCustomSelect(document.getElementById('detailSkillsContainer'), skillOptions, { placeholder: getTranslation('ph_associated_skills'), isMultiSelect: true, initialValue: item.associatedSkills });
    }
    if (item.compliance !== undefined) {
        const complianceOptions = [ { value: 'true', text: getTranslation('yes') }, { value: 'false', text: getTranslation('no') } ];
        createCustomSelect(document.getElementById('detailComplianceContainer'), complianceOptions, { placeholder: getTranslation('label_compliance'), initialValue: String(item.compliance) });
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
    if (item.goalAssociation !== undefined) {
        item.goalAssociation = getCustomSelectValue('detailGoalContainer');
    }
    if (item.associatedSkills !== undefined) {
        item.associatedSkills = getCustomSelectValue('detailSkillsContainer');
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

async function uploadImage(base64File) {
    document.body.style.cursor = 'wait';
    try {
        const response = await fetch('/.netlify/functions/upload-image', {
            method: 'POST',
            body: JSON.stringify({ file: base64File }),
        });
        if (!response.ok) {
            const responseClone = response.clone();
            let errorMsg = `Image upload failed with status: ${response.status}`;
            try {
                const err = await responseClone.json();
                errorMsg = err.error || JSON.stringify(err);
            } catch (e) {
                errorMsg = await response.text();
            }
            throw new Error(errorMsg);
        }
        const { secure_url } = await response.json();
        return secure_url;
    } catch (error) {
        console.error("Full upload error:", error);
        alert(`Error: ${error.message}`);
        return null;
    } finally {
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
        document.getElementById('resourceImagePreview').src = base64;
        const finalUrl = await uploadImage(base64);
        if (finalUrl) {
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
    
    let typeNameForButton;
    if (type === 'monthlyIncomes') typeNameForButton = 'monthlyIncome';
    else if (type === 'monthlyExpenses') typeNameForButton = 'monthlyExpense';
    else typeNameForButton = type.slice(0, -1);

    if (id) {
        const item = dimensionLibraryData.financials[type].find(i => i.id === id);
        let typeNameForTitle = typeNameForButton.replace(/([A-Z])/g, ' $1');
        title.textContent = `${getTranslation('title_edit')} ${typeNameForTitle}`;
        nameInput.value = item.name;
        amountInput.value = item.amount;
        dateInput.value = item.date;
        deleteBtn.style.display = 'inline-block';
    } else {
        title.textContent = getTranslation('btn_add_' + typeNameForButton);
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
const chart = new Chart(document.getElementById("radarChart").getContext("2d"), { type: "radar", data: { labels: dimensions.map(d => d.name), datasets: [{ label: "Dimension Score (%)", data: dimensions.map(() => 0), backgroundColor: "rgba(0, 170, 255, 0.2)", borderColor: "rgba(0, 170, 255, 1)", borderWidth: 2, pointBackgroundColor: "rgba(0, 170, 255, 1)" }] }, options: { responsive: true, maintainAspectRatio: false, onClick: (evt, elems) => { if (elems.length > 0) { const dim = dimensions[elems[0].index]; currentDimension = dim.name; document.getElementById("selectedDimensionTitle").textContent = getTranslation(dim.key); showDimensionInputs(currentDimension); updateNavActive(currentDimension); renderLibrary(currentDimension, currentTab); } }, plugins: { legend: { display: false }, dragData: { round: 0, onDrag: (e, d, i, v) => { inputs[dimensions[i].name].value = v; updateLifeQuality(); showDimensionInputs(dimensions[i].name); } } }, scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: "rgba(255, 255, 255, 0.1)" }, angleLines: { color: "rgba(255, 255, 255, 0.1)" }, pointLabels: { color: "#e0e0e0", font: { size: 12 } } } } } });
function updateLifeQuality() { let totalObtained = 0; dimensions.forEach(dim => { totalObtained += (parseFloat(inputs[dim.name].value) || 0) / 100 * dim.max; }); const lifeQuality = totalObtained; document.getElementById("lifeQualityText").textContent = `Life Quality: ${lifeQuality.toFixed(1)}%`; const progressBar = document.getElementById("progressBar"); progressBar.style.width = `${lifeQuality}%`; const color = getColor(lifeQuality); progressBar.style.background = color; updateChart(color, lifeQuality); }
function updateChart(color, lifeQuality) { chart.data.datasets[0].data = dimensions.map(dim => parseFloat(inputs[dim.name].value) || 0); chart.data.datasets[0].borderColor = color; chart.data.datasets[0].pointBackgroundColor = color; chart.data.datasets[0].backgroundColor = color.replace(')', ', 0.2)').replace('rgb', 'rgba'); chart.update(); }
function getColor(value) { if (value >= 70) return "rgb(76, 175, 80)"; if (value >= 40) return "rgb(255, 152, 0)"; return "rgb(244, 67, 54)"; }

/*****************************************************************
 * * LOCAL STORAGE & DATA MIGRATION
 * *****************************************************************/
function saveToLocalStorage(showAlert = true) {
    const allData = {
        dimensionScores: dimensions.reduce((acc, dim) => ({ ...acc, [dim.name]: { score: parseFloat(inputs[dim.name].value) || 0 } }), {}),
        libraryData: dimensionLibraryData,
        visualizationData: [],
    };

    const visArtboard = document.getElementById('visArtboard');
    if (visArtboard) {
        visArtboard.querySelectorAll('.image-container').forEach(container => {
            const img = container.querySelector('img');
            if (img && img.src) {
                allData.visualizationData.push({
                    src: img.src,
                    left: container.style.left,
                    top: container.style.top,
                    width: container.style.width,
                    height: container.style.height,
                });
            }
        });
    }

    localStorage.setItem("lifeQualityAppData", JSON.stringify(allData));
    if (showAlert) {
        console.log("Data saved!");
        alert("Your data has been saved!");
    }
}

function migrateRoleData(data) {
    if (!data.libraryData?.appSettings?.userRoles) return;

    const userRoles = data.libraryData.appSettings.userRoles;
    const roleNameToKeyMap = Object.fromEntries(userRoles.map(r => [r.name, r.key]));

    for (const dimName in data.libraryData) {
        if (typeof data.libraryData[dimName] !== 'object' || ['appSettings', 'resources', 'financials', 'skills', 'wishlist'].includes(dimName)) continue;

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

function applyLoadedData(parsedData) {
    if (!parsedData) return;

    if(parsedData.dimensionScores) {
        dimensions.forEach(dim => {
            if (parsedData.dimensionScores[dim.name] && inputs[dim.name]) {
                inputs[dim.name].value = parsedData.dimensionScores[dim.name].score;
            }
        });
    }

    const loadedLibrary = parsedData.libraryData || {};
    
    if (!loadedLibrary.resources) loadedLibrary.resources = [];
    if (!loadedLibrary.skills) loadedLibrary.skills = [];
    if (!loadedLibrary.wishlist) loadedLibrary.wishlist = [];
    if (!loadedLibrary.financials) loadedLibrary.financials = { incomes: [], expenses: [], savings: [], investments: [], debts: [], monthlyIncomes: [], monthlyExpenses: [] };
    const financialKeys = ['incomes', 'expenses', 'savings', 'investments', 'debts', 'monthlyIncomes', 'monthlyExpenses'];
    financialKeys.forEach(key => {
        if (!loadedLibrary.financials[key]) loadedLibrary.financials[key] = [];
    });
    if(!loadedLibrary.appSettings) loadedLibrary.appSettings = defaultAppData.appSettings;
    
    Object.values(loadedLibrary).forEach(dim => {
        if(dim && Array.isArray(dim.projects)) {
            dim.projects.forEach(proj => {
                if(!proj.primaryMissions) proj.primaryMissions = [];
                if(!proj.secondaryMissions) proj.secondaryMissions = [];
            });
        }
    });

    dimensionLibraryData = loadedLibrary;

    const visArtboard = document.getElementById('visArtboard');
    if (visArtboard) {
        visArtboard.innerHTML = '';
        if (parsedData.visualizationData && Array.isArray(parsedData.visualizationData)) {
            parsedData.visualizationData.forEach(imgData => {
                addImageToArtboard(imgData.src, imgData);
            });
        }
    }

    initializeDashboard();
}

function loadFromLocalStorage() {
    const dataString = localStorage.getItem("lifeQualityAppData");
    if (!dataString) {
        dimensionLibraryData = JSON.parse(JSON.stringify(defaultAppData));
        initializeDashboard();
        return;
    }
    const parsed = JSON.parse(dataString);
    migrateRoleData(parsed);
    applyLoadedData(parsed);
    console.log("Data loaded from Local Storage!");
}

function setupDataHandlers() {
    const downloadBtn = document.getElementById('downloadDataBtn');
    const loadBtn = document.getElementById('loadDataBtn');
    const fileUploader = document.getElementById('fileUploader');

    if (downloadBtn) downloadBtn.addEventListener('click', downloadData);
    if (loadBtn) loadBtn.addEventListener('click', () => fileUploader.click());
    if (fileUploader) fileUploader.addEventListener('change', handleFileUpload);
}

function downloadData() {
    const allData = {
        dimensionScores: dimensions.reduce((acc, dim) => ({ ...acc, [dim.name]: { score: parseFloat(inputs[dim.name].value) || 0 } }), {}),
        libraryData: dimensionLibraryData,
        visualizationData: [],
    };

    const visArtboard = document.getElementById('visArtboard');
    if (visArtboard) {
        visArtboard.querySelectorAll('.image-container').forEach(container => {
            const img = container.querySelector('img');
            if (img && img.src) {
                allData.visualizationData.push({
                    src: img.src,
                    left: container.style.left,
                    top: container.style.top,
                    width: container.style.width,
                    height: container.style.height,
                });
            }
        });
    }

    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livia-app-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data && data.libraryData && data.dimensionScores) {
                if (confirm(getTranslation('confirm_load_file'))) {
                    migrateRoleData(data);
                    applyLoadedData(data);
                    saveToLocalStorage(false);
                    alert("Data loaded successfully!");
                }
            } else {
                alert("Invalid or corrupted data file.");
            }
        } catch (error) {
            alert("Error reading or parsing the file. Please ensure it's a valid JSON backup file.");
            console.error("File load error:", error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
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
        document.getElementById('profileImagePreview').src = base64;
        const finalUrl = await uploadImage(base64);
        if (finalUrl) {
            document.getElementById('profileImagePreview').src = finalUrl;
        }
    };
    reader.readAsDataURL(file);
}


/*****************************************************************
 * * LIFE VISUALIZATION PAGE LOGIC
 * *****************************************************************/

let addImageToArtboard = () => {};

function setupVisualizationPage() {
    const viewport = document.getElementById('visViewport');
    const artboard = document.getElementById('visArtboard');
    const uploadBtn = document.getElementById('uploadImageBtn');
    const imageUploader = document.getElementById('imageUploader');

    if (!viewport || !artboard || !uploadBtn || !imageUploader) {
        return;
    }

    let scale = 0.3;
    let panX = 50;
    let panY = 50;
    let isPanning = false;
    let isSpacePressed = false;
    let panStart = { x: 0, y: 0 };
    let currentlySelected = null;

    function applyTransform() {
        artboard.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        const gridSize = 100 * scale;
        viewport.style.backgroundSize = `${gridSize}px ${gridSize}px`;
        viewport.style.backgroundPosition = `${panX % gridSize}px ${panY % gridSize}px`;
    }

    function deselectAll() {
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
            currentlySelected = null;
        }
    }

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

    addImageToArtboard = (src, savedData = null) => {
        const container = document.createElement('div');
        container.className = 'image-container';

        const img = document.createElement('img');
        img.src = src;
        img.className = 'visualization-image';

        container.innerHTML += `
            <div class="resize-handle top-left"></div>
            <div class="resize-handle top-right"></div>
            <div class="resize-handle bottom-left"></div>
            <div class="resize-handle bottom-right"></div>
        `;
        container.prepend(img);

        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const menuActions = [{ label: "Delete Image", action: () => container.remove(), className: 'delete-btn' }];
            showContextMenu(e.target, menuActions);
        });

        let isDragging = false;

        img.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.stopPropagation();

            deselectAll();
            container.classList.add('selected');
            currentlySelected = container;

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

        container.querySelectorAll('.resize-handle').forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();

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

        if (savedData) {
            container.style.width = savedData.width;
            container.style.height = savedData.height;
            container.style.left = savedData.left;
            container.style.top = savedData.top;
        } else {
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
        const activeEl = document.activeElement;
        const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
        
        if (e.code === 'Space' && !isInputFocused) {
            e.preventDefault();
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
                addImageToArtboard(base64);
                const finalUrl = await uploadImage(base64);
                if (finalUrl) {
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

    applyTransform();
}

/*****************************************************************
 * * PROJECT MISSIONS
 * *****************************************************************/
function renderProjectMissions(pageContainer, project) {
    const container = document.createElement('div');
    container.className = 'missions-container';

    container.innerHTML = `
        <div class="mission-section">
            <div class="mission-header">
                <h4 data-i18n="primary_missions"></h4>
                <button class="btn secondary-btn add-mission-btn" data-mission-type="primaryMissions"><i class="fas fa-plus"></i> <span data-i18n="btn_add_mission"></span></button>
            </div>
            <ul class="mission-list" id="primaryMissionsList"></ul>
        </div>
        <div class="mission-section">
            <div class="mission-header">
                 <h4 data-i18n="secondary_missions"></h4>
                 <button class="btn secondary-btn add-mission-btn" data-mission-type="secondaryMissions"><i class="fas fa-plus"></i> <span data-i18n="btn_add_mission"></span></button>
            </div>
            <ul class="mission-list" id="secondaryMissionsList"></ul>
        </div>
    `;
    
    pageContainer.appendChild(container);
    applyTranslations(container);

    const primaryList = container.querySelector('#primaryMissionsList');
    (project.primaryMissions || []).forEach(mission => {
        primaryList.appendChild(createMissionElement(mission, 'primaryMissions'));
    });

    const secondaryList = container.querySelector('#secondaryMissionsList');
    (project.secondaryMissions || []).forEach(mission => {
        secondaryList.appendChild(createMissionElement(mission, 'secondaryMissions'));
    });

    container.querySelectorAll('.add-mission-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const missionType = btn.dataset.missionType;
            openMissionModal(missionType);
        });
    });
}

function createMissionElement(mission, type) {
    const li = document.createElement('li');
    li.className = `mission-item ${mission.completed ? 'completed' : ''}`;
    li.innerHTML = `
        <div class="mission-info">
            <input type="checkbox" ${mission.completed ? 'checked' : ''} />
            <span class="mission-name">${mission.name}</span>
        </div>
        <div class="mission-details">
            <span class="mission-role">${getTranslation(mission.lifeRole)}</span>
            <span class="mission-date">${mission.completionDate}</span>
            <div class="mission-actions">
                <i class="fas fa-edit"></i>
                <i class="fas fa-trash"></i>
            </div>
        </div>
    `;

    li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        mission.completed = e.target.checked;
        saveToLocalStorage(false);
        li.classList.toggle('completed', mission.completed);
    });

    li.querySelector('.fa-edit').addEventListener('click', () => openMissionModal(type, mission.id));
    li.querySelector('.fa-trash').addEventListener('click', () => deleteMission(type, mission.id));

    return li;
}

function openMissionModal(missionType, missionId = null) {
    editingMissionInfo = { type: missionType, id: missionId };
    
    const modal = document.getElementById('missionModal');
    const title = document.getElementById('missionModalTitle');
    const deleteBtn = document.getElementById('deleteMissionBtn');
    
    const roleOptions = dimensionLibraryData.appSettings.userRoles.map(r => ({ value: r.key, text: getTranslation(r.key) }));
    
    if (missionId) {
        const project = dimensionLibraryData[editingItem.dimension][editingItem.tab][editingItem.index];
        const mission = project[missionType].find(m => m.id === missionId);
        title.textContent = getTranslation('title_edit_mission');
        document.getElementById('missionNameInput').value = mission.name;
        document.getElementById('missionDateInput').value = mission.completionDate;
        createCustomSelect(document.getElementById('missionRoleContainer'), roleOptions, { placeholder: getTranslation('ph_life_roles'), initialValue: mission.lifeRole });
        deleteBtn.style.display = 'inline-block';
    } else {
        title.textContent = getTranslation('title_add_mission');
        document.getElementById('missionNameInput').value = '';
        document.getElementById('missionDateInput').value = new Date().toISOString().split('T')[0];
        createCustomSelect(document.getElementById('missionRoleContainer'), roleOptions, { placeholder: getTranslation('ph_life_roles') });
        deleteBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

function closeMissionModal() {
    document.getElementById('missionModal').style.display = 'none';
}

function saveMission() {
    const { type, id } = editingMissionInfo;
    const project = dimensionLibraryData[editingItem.dimension][editingItem.tab][editingItem.index];

    const missionData = {
        name: document.getElementById('missionNameInput').value.trim(),
        completionDate: document.getElementById('missionDateInput').value,
        lifeRole: getCustomSelectValue('missionRoleContainer'),
    };

    if (!missionData.name || !missionData.lifeRole) {
        alert("Please provide a name and a life role for the mission.");
        return;
    }

    if (id) {
        const missionIndex = project[type].findIndex(m => m.id === id);
        if (missionIndex > -1) {
            project[type][missionIndex] = { ...project[type][missionIndex], ...missionData };
        }
    } else {
        missionData.id = `mission_${new Date().getTime()}`;
        missionData.completed = false;
        project[type].push(missionData);
    }
    
    saveToLocalStorage();
    renderItemDetailPage(editingItem); 
    closeMissionModal();
}

function deleteMission(type, missionId) {
    if (confirm(getTranslation('confirm_delete'))) {
        const { dimension, tab, index } = editingItem;
        const project = dimensionLibraryData[dimension][tab][index];
        project[type] = project[type].filter(m => m.id !== (missionId || editingMissionInfo.id));
        saveToLocalStorage();
        renderItemDetailPage(editingItem);
    }
}


/*****************************************************************
 * * TODAY PAGE LOGIC
 * *****************************************************************/

function renderTodayPage() {
    const page = document.getElementById('todayPage');
    if (!page) return;

    todayPageSelectedDate.setHours(0, 0, 0, 0);

    const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
    const dateString = todayPageSelectedDate.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    page.innerHTML = `
        <div class="page-header">
            <h2 data-i18n="title_today_page"></h2>
        </div>
        <div class="today-container">
            <div id="calendar-container"></div>
            <div class="today-lists">
                <div class="today-list-section">
                    <h3 data-i18n="today_daily_routines"></h3>
                    <div id="today-routines-list" class="library-list"></div>
                </div>
                <div class="today-list-section">
                    <h3>${getTranslation('primary_missions')} - ${dateString}</h3>
                    <div id="today-primary-missions-list" class="library-list"></div>
                </div>
                 <div class="today-list-section">
                    <h3>${getTranslation('secondary_missions')} - ${dateString}</h3>
                    <div id="today-secondary-missions-list" class="library-list"></div>
                </div>
            </div>
        </div>
    `;

    applyTranslations(page);
    renderCalendar(document.getElementById('calendar-container'));
    renderTodayLists();
}

function renderTodayLists() {
    const routinesListDiv = document.getElementById('today-routines-list');
    const primaryMissionsListDiv = document.getElementById('today-primary-missions-list');
    const secondaryMissionsListDiv = document.getElementById('today-secondary-missions-list');
    
    [routinesListDiv, primaryMissionsListDiv, secondaryMissionsListDiv].forEach(div => div.innerHTML = '');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (todayPageSelectedDate.getTime() === today.getTime()) {
        const dailyRoutines = [];
        Object.entries(dimensionLibraryData).forEach(([dimName, dimData]) => {
            if (dimData.routines && Array.isArray(dimData.routines.daily)) {
                dimData.routines.daily.forEach((routine, index) => {
                    dailyRoutines.push({
                        ...routine,
                        context: { dimension: dimName, tab: 'routines', index, frequency: 'daily', originPage: 'todayPage' }
                    });
                });
            }
        });

        if (dailyRoutines.length > 0) {
            dailyRoutines.forEach(item => {
                const { context } = item;
                const toggleId = `today-compliance-${context.dimension}-${context.index}`;
                const complianceHtml = `
                    <div class="compliance-toggle-container">
                        <span class="toggle-label">${getTranslation('label_compliance')}:</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="${toggleId}" ${item.compliance ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>`;

                const itemDiv = createLibraryItem('routine', item.name, createRolesHtml(item.lifeRoles), '', '', complianceHtml);
                itemDiv.addEventListener('click', () => showPage('itemDetailPage', context));

                const toggleContainer = itemDiv.querySelector('.compliance-toggle-container');
                if (toggleContainer) {
                    toggleContainer.addEventListener('click', (e) => e.stopPropagation());
                    
                    const complianceToggle = toggleContainer.querySelector('input');
                    complianceToggle.addEventListener('change', () => {
                        const routineToUpdate = dimensionLibraryData[context.dimension].routines[context.frequency][context.index];
                        routineToUpdate.compliance = !routineToUpdate.compliance;
                        saveToLocalStorage(false);
                    });
                }
                routinesListDiv.appendChild(itemDiv);
            });
        } else {
            routinesListDiv.innerHTML = `<p class="no-items" data-i18n="no_routines_today"></p>`;
        }
    } else {
        routinesListDiv.innerHTML = `<p class="no-items">Daily routines are only displayed for the current date.</p>`;
    }


    const selectedDateStr = todayPageSelectedDate.toISOString().split('T')[0];
    const primaryMissions = [];
    const secondaryMissions = [];

    Object.entries(dimensionLibraryData).forEach(([dimName, dimData]) => {
        if (dimData.projects && Array.isArray(dimData.projects)) {
            dimData.projects.forEach((project, projIndex) => {
                const context = { dimension: dimName, tab: 'projects', index: projIndex, originPage: 'todayPage' };
                project.primaryMissions?.forEach(mission => {
                    if (mission.completionDate === selectedDateStr) {
                        primaryMissions.push({ ...mission, project_name: project.name, context });
                    }
                });
                project.secondaryMissions?.forEach(mission => {
                    if (mission.completionDate === selectedDateStr) {
                        secondaryMissions.push({ ...mission, project_name: project.name, context });
                    }
                });
            });
        }
    });

    if (primaryMissions.length > 0) {
        primaryMissions.forEach(mission => {
            primaryMissionsListDiv.appendChild(createTodayMissionElement(mission));
        });
    } else {
        primaryMissionsListDiv.innerHTML = `<p class="no-items" data-i18n="no_missions_today"></p>`;
    }
    
    if (secondaryMissions.length > 0) {
        secondaryMissions.forEach(mission => {
            secondaryMissionsListDiv.appendChild(createTodayMissionElement(mission));
        });
    } else {
        secondaryMissionsListDiv.innerHTML = `<p class="no-items" data-i18n="no_missions_today"></p>`;
    }

    applyTranslations(document.getElementById('todayPage'));
}

function createTodayMissionElement(mission) {
    const li = document.createElement('li');
    li.className = `mission-item ${mission.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
        <div class="mission-info">
            <input type="checkbox" ${mission.completed ? 'checked' : ''} />
            <span class="mission-name">${mission.name}</span>
        </div>
        <div class="mission-details">
            <span class="project-tag">${mission.project_name}</span>
            <span class="mission-role">${getTranslation(mission.lifeRole)}</span>
        </div>
    `;

    li.addEventListener('click', (e) => {
        if (e.target.type !== 'checkbox') {
            showPage('itemDetailPage', mission.context);
        }
    });

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
        const { dimension, index: projIndex } = mission.context;
        const project = dimensionLibraryData[dimension].projects[projIndex];
        
        let missionToUpdate = project.primaryMissions.find(m => m.id === mission.id);
        if (!missionToUpdate) {
            missionToUpdate = project.secondaryMissions.find(m => m.id === mission.id);
        }

        if (missionToUpdate) {
            missionToUpdate.completed = checkbox.checked;
            saveToLocalStorage(false);
            li.classList.toggle('completed', checkbox.checked);
        }
    });

    return li;
}


function renderCalendar(container) {
    if (!container) return;
    container.innerHTML = ''; 

    const missionsByDate = {};
    Object.values(dimensionLibraryData).forEach(dimData => {
        if (dimData.projects && Array.isArray(dimData.projects)) {
            dimData.projects.forEach(project => {
                [...(project.primaryMissions || []), ...(project.secondaryMissions || [])].forEach(mission => {
                    if (mission.completionDate) {
                        missionsByDate[mission.completionDate] = true;
                    }
                });
            });
        }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = todayPageSelectedDate.getMonth();
    const year = todayPageSelectedDate.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); 

    const locale = currentLanguage === 'es' ? 'es-ES' : 'en-US';
    const monthName = firstDay.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
        <button id="cal-prev" class="btn secondary-btn">&lt;</button>
        <span class="calendar-month-year">${monthName}</span>
        <button id="cal-next" class="btn secondary-btn">&gt;</button>
    `;
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    const daysOfWeek = currentLanguage === 'es' ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        grid.innerHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    for (let i = 0; i < startDayOfWeek; i++) {
        grid.innerHTML += '<div></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        const thisDate = new Date(year, month, day);
        const thisDateStr = thisDate.toISOString().split('T')[0];

        if (thisDateStr === today.toISOString().split('T')[0]) dayCell.classList.add('is-today');
        if (thisDateStr === todayPageSelectedDate.toISOString().split('T')[0]) dayCell.classList.add('is-selected');
        if (missionsByDate[thisDateStr]) dayCell.classList.add('has-mission');
        
        dayCell.addEventListener('click', () => {
            todayPageSelectedDate = new Date(year, month, day);
            renderTodayPage();
        });
        grid.appendChild(dayCell);
    }
    container.appendChild(grid);

    document.getElementById('cal-prev').addEventListener('click', () => {
        todayPageSelectedDate.setMonth(todayPageSelectedDate.getMonth() - 1);
        renderTodayPage();
    });
    document.getElementById('cal-next').addEventListener('click', () => {
        todayPageSelectedDate.setMonth(todayPageSelectedDate.getMonth() + 1);
        renderTodayPage();
    });
}