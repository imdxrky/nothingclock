document.addEventListener('DOMContentLoaded', () => { // Ensure all code is within this
    const currentViewTitle = document.getElementById('current-view-title');
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    // Clock View
    const digitalTimeMain = document.getElementById('digital-time-main');
    const locationTimeCards = document.querySelectorAll('#clock-section .location-times .location-card');

    // World Clock View
    const worldClockListEl = document.getElementById('world-clock-list');
    const worldClockSearch = document.getElementById('world-clock-search');
    const dotMapContainer = document.getElementById('dot-map-container');
    const mapTooltipElement = document.getElementById('map-tooltip');

    let currentHoveredDot = null;

    // Variables for smooth tooltip movement
    let tooltipTargetX = 0;
    let tooltipTargetY = 0;
    let tooltipCurrentX = 0;
    let tooltipCurrentY = 0;
    const easingFactor = 0.2; 
    let animationFrameId = null;

    // --- Add City Modal Elements ---
    const addCityModal = document.getElementById('add-city-modal');
    const closeAddCityModalBtn = document.getElementById('close-add-city-modal-btn');
    const addCitySearchInput = document.getElementById('add-city-search');
    const availableCitiesListEl = document.getElementById('available-cities-list');
    const addCitySharedBtns = document.querySelectorAll('.add-city-shared-btn');

    // --- Ringtone Modal Elements ---
    const selectRingtoneButton = document.getElementById('select-ringtone'); // Button on timer view
    const selectRingtoneModal = document.getElementById('select-ringtone-modal');
    const closeRingtoneModalBtn = document.getElementById('close-ringtone-modal-btn');
    const ringtoneListEl = document.getElementById('ringtone-list');
    const saveRingtoneBtn = document.getElementById('save-ringtone-btn');
    const testRingtoneBtn = document.getElementById('test-ringtone-btn');
    
    let currentSelectedRingtone = localStorage.getItem('timerRingtone') || 'placeholder.mp3';
    let tempSelectedRingtoneInModal = currentSelectedRingtone;
    let ringtoneAudio = null;

    const MAP_COLS = 100;
    const MAP_ROWS = 28;

    const allAvailableCities = [ // Your city list from previous step
        // North America
        { name: 'Vancouver', timezone: 'America/Vancouver', id: 'vancouver', mapCol: 4, mapRow: 6 },
        { name: 'Los Angeles', timezone: 'America/Los_Angeles', id: 'los-angeles', mapCol: 5, mapRow: 9 },
        { name: 'Denver', timezone: 'America/Denver', id: 'denver', mapCol: 12, mapRow: 8 },
        { name: 'Chicago', timezone: 'America/Chicago', id: 'chicago', mapCol: 18, mapRow: 7 },
        { name: 'New York', timezone: 'America/New_York', id: 'new-york', mapCol: 22, mapRow: 7 },
        { name: 'Toronto', timezone: 'America/Toronto', id: 'toronto', mapCol: 21, mapRow: 6 },
        { name: 'Mexico City', timezone: 'America/Mexico_City', id: 'mexico-city', mapCol: 14, mapRow: 13 },
        { name: 'Honolulu', timezone: 'Pacific/Honolulu', id: 'honolulu', mapCol: 0, mapRow: 13 },
        // South America
        { name: 'Bogota', timezone: 'America/Bogota', id: 'bogota', mapCol: 22, mapRow: 15 },
        { name: 'Lima', timezone: 'America/Lima', id: 'lima', mapCol: 21, mapRow: 18 },
        { name: 'Santiago', timezone: 'America/Santiago', id: 'santiago', mapCol: 23, mapRow: 22 },
        { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', id: 'buenos-aires', mapCol: 28, mapRow: 22 },
        { name: 'Sao Paulo', timezone: 'America/Sao_Paulo', id: 'sao-paulo', mapCol: 31, mapRow: 20 },
        { name: 'Rio de Janeiro', timezone: 'America/Sao_Paulo', id: 'rio-de-janeiro', mapCol: 33, mapRow: 20 },
        // Europe
        { name: 'Reykjavik', timezone: 'Atlantic/Reykjavik', id: 'reykjavik', mapCol: 29, mapRow: 3 },
        { name: 'Lisbon', timezone: 'Europe/Lisbon', id: 'lisbon', mapCol: 32, mapRow: 9 },
        { name: 'Madrid', timezone: 'Europe/Madrid', id: 'madrid', mapCol: 34, mapRow: 9 },
        { name: 'London', timezone: 'Europe/London', id: 'london', mapCol: 36, mapRow: 6 },
        { name: 'Paris', timezone: 'Europe/Paris', id: 'paris', mapCol: 37, mapRow: 7 },
        { name: 'Brussels', timezone: 'Europe/Brussels', id: 'brussels', mapCol: 38, mapRow: 6 },
        { name: 'Amsterdam', timezone: 'Europe/Amsterdam', id: 'amsterdam', mapCol: 38, mapRow: 5 },
        { name: 'Berlin', timezone: 'Europe/Berlin', id: 'berlin', mapCol: 41, mapRow: 6 },
        { name: 'Zurich', timezone: 'Europe/Zurich', id: 'zurich', mapCol: 39, mapRow: 7 },
        { name: 'Rome', timezone: 'Europe/Rome', id: 'rome', mapCol: 41, mapRow: 9 },
        { name: 'Athens', timezone: 'Europe/Athens', id: 'athens', mapCol: 45, mapRow: 9 },
        { name: 'Prague', timezone: 'Europe/Prague', id: 'prague', mapCol: 42, mapRow: 7 },
        { name: 'Vienna', timezone: 'Europe/Vienna', id: 'vienna', mapCol: 43, mapRow: 7 },
        { name: 'Bratislava', timezone: 'Europe/Bratislava', id: 'bratislava', mapCol: 43, mapRow: 7 },
        { name: 'Budapest', timezone: 'Europe/Budapest', id: 'budapest', mapCol: 44, mapRow: 7 },
        { name: 'Warsaw', timezone: 'Europe/Warsaw', id: 'warsaw', mapCol: 45, mapRow: 6 },
        { name: 'Oslo', timezone: 'Europe/Oslo', id: 'oslo', mapCol: 40, mapRow: 4 },
        { name: 'Stockholm', timezone: 'Europe/Stockholm', id: 'stockholm', mapCol: 43, mapRow: 4 },
        { name: 'Helsinki', timezone: 'Europe/Helsinki', id: 'helsinki', mapCol: 46, mapRow: 4 },
        { name: 'Kyiv', timezone: 'Europe/Kyiv', id: 'kyiv', mapCol: 48, mapRow: 6 },
        { name: 'Moscow', timezone: 'Europe/Moscow', id: 'moscow', mapCol: 52, mapRow: 5 },
        { name: 'Istanbul', timezone: 'Europe/Istanbul', id: 'istanbul', mapCol: 48, mapRow: 9 },
        // Africa
        { name: 'Casablanca', timezone: 'Africa/Casablanca', id: 'casablanca', mapCol: 32, mapRow: 10 },
        { name: 'Cairo', timezone: 'Africa/Cairo', id: 'cairo', mapCol: 49, mapRow: 11 },
        { name: 'Lagos', timezone: 'Africa/Lagos', id: 'lagos', mapCol: 38, mapRow: 15 },
        { name: 'Nairobi', timezone: 'Africa/Nairobi', id: 'nairobi', mapCol: 52, mapRow: 16 },
        { name: 'Johannesburg', timezone: 'Africa/Johannesburg', id: 'johannesburg', mapCol: 48, mapRow: 21 },
        { name: 'Cape Town', timezone: 'Africa/Johannesburg', id: 'cape-town', mapCol: 44, mapRow: 22 },
        // Asia & Middle East
        { name: 'Tehran', timezone: 'Asia/Tehran', id: 'tehran', mapCol: 56, mapRow: 10 },
        { name: 'Dubai', timezone: 'Asia/Dubai', id: 'dubai', mapCol: 58, mapRow: 12 },
        { name: 'New Delhi', timezone: 'Asia/Kolkata', id: 'new-delhi', mapCol: 65, mapRow: 11 },
        { name: 'Mumbai', timezone: 'Asia/Kolkata', id: 'mumbai', mapCol: 64, mapRow: 14 },
        { name: 'Bangkok', timezone: 'Asia/Bangkok', id: 'bangkok', mapCol: 72, mapRow: 14 },
        { name: 'Ho Chi Minh City', timezone: 'Asia/Ho_Chi_Minh', id: 'ho-chi-minh-city', mapCol: 75, mapRow: 15 },
        { name: 'Singapore', timezone: 'Asia/Singapore', id: 'singapore', mapCol: 73, mapRow: 16 },
        { name: 'Jakarta', timezone: 'Asia/Jakarta', id: 'jakarta', mapCol: 75, mapRow: 17 },
        { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', id: 'hong-kong', mapCol: 78, mapRow: 13 },
        { name: 'Manila', timezone: 'Asia/Manila', id: 'manila', mapCol: 81, mapRow: 14 },
        { name: 'Shanghai', timezone: 'Asia/Shanghai', id: 'shanghai', mapCol: 81, mapRow: 11 },
        { name: 'Beijing', timezone: 'Asia/Shanghai', id: 'beijing', mapCol: 79, mapRow: 8 },
        { name: 'Seoul', timezone: 'Asia/Seoul', id: 'seoul', mapCol: 83, mapRow: 9 },
        { name: 'Tokyo', timezone: 'Asia/Tokyo', id: 'tokyo', mapCol: 86, mapRow: 9 },
        // Oceania
        { name: 'Perth', timezone: 'Australia/Perth', id: 'perth', mapCol: 78, mapRow: 22 },
        { name: 'Sydney', timezone: 'Australia/Sydney', id: 'sydney', mapCol: 84, mapRow: 22 },
        { name: 'Melbourne', timezone: 'Australia/Melbourne', id: 'melbourne', mapCol: 82, mapRow: 23 },
        { name: 'Auckland', timezone: 'Pacific/Auckland', id: 'auckland', mapCol: 88, mapRow: 23 },
    ].sort((a, b) => a.name.localeCompare(b.name));
    let selectedCityIds = JSON.parse(localStorage.getItem('selectedWorldCityIds')) || ['new-york', 'london', 'tokyo', 'prague', 'sydney', 'cairo', 'los-angeles'];
    let selectedWorldCities = [];
    
    let worldClockInterval;
    let dotElements = []; 
    let mapRendered = false;

    const timerHoursInput = document.getElementById('timer-hours');
    const timerMinutesInput = document.getElementById('timer-minutes');
    const timerSecondsInput = document.getElementById('timer-seconds');
    const timerCountdownDisplay = document.getElementById('timer-countdown');
    const timerStartStopButton = document.getElementById('timer-start-stop');
    const timerResetButton = document.getElementById('timer-reset');
    const timerProgressCircle = document.querySelector('#timers-section .timer-progress-circle');
    const timerCircleRadius = 45; 
    const timerCircleCircumference = 2 * Math.PI * timerCircleRadius;

    let timerInterval;
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let isTimerRunning = false;

    // --- Smooth Tooltip Functions ---
    function updateSmoothTooltipPosition() {
        if (!mapTooltipElement || !mapTooltipElement.classList.contains('visible')) { // Added null check for mapTooltipElement
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            return;
        }
        let dx = tooltipTargetX - tooltipCurrentX;
        let dy = tooltipTargetY - tooltipCurrentY;
        tooltipCurrentX += dx * easingFactor;
        tooltipCurrentY += dy * easingFactor;
        mapTooltipElement.style.transform = `translate3d(${tooltipCurrentX}px, ${tooltipCurrentY}px, 0)`;
        animationFrameId = requestAnimationFrame(updateSmoothTooltipPosition);
    }

    function setTooltipInitialPosition(event) {
        if (!mapTooltipElement) return;
        const tooltipRect = mapTooltipElement.getBoundingClientRect();
        let x = event.clientX;
        let y = event.clientY;
        //const offsetX = -tooltipRect.width / 2;
        const offsetY = -tooltipRect.height - 15; 
        tooltipTargetX = x + offsetX;
        tooltipTargetY = y + offsetY;
        if (tooltipTargetX < 0) tooltipTargetX = 0;
        if (tooltipTargetX + tooltipRect.width > window.innerWidth) tooltipTargetX = window.innerWidth - tooltipRect.width;
        if (tooltipTargetY < 0) tooltipTargetY = 0;
        if (tooltipTargetY + tooltipRect.height > window.innerHeight) tooltipTargetY = window.innerHeight - tooltipRect.height;
        tooltipCurrentX = tooltipTargetX;
        tooltipCurrentY = tooltipTargetY;
        mapTooltipElement.style.transform = `translate3d(${tooltipCurrentX}px, ${tooltipCurrentY}px, 0)`;
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(updateSmoothTooltipPosition);
        }
    }

    // --- View Switching ---
    function switchView(targetViewId) {
        let targetTitle = '';
        navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.dataset.view === targetViewId) {
                nav.classList.add('active');
                targetTitle = nav.textContent.trim().split('\n').pop() || nav.dataset.view.replace('-section','').replace('-', ' ');
            }
        });

        views.forEach(view => {
            if (view.id === targetViewId) {
                view.classList.add('active-view');
            } else {
                view.classList.remove('active-view');
            }
        });
        if(currentViewTitle) currentViewTitle.textContent = targetTitle.charAt(0).toUpperCase() + targetTitle.slice(1); // Null check

        if (targetViewId !== 'world-clock-section' && worldClockInterval) clearInterval(worldClockInterval);
        
        if (targetViewId === 'clock-section') updateMainClock();
        if (targetViewId === 'world-clock-section') {
            if (!mapRendered && dotMapContainer) { // Null check for dotMapContainer
                renderDotMap();
                mapRendered = true;
            }
            updateMapHighlightsAndTooltips(); 
            initWorldClock();
        }
        if (targetViewId === 'timers-section' && !isTimerRunning) setInitialTimerDisplay();
    }

    if (navItems.length > 0) { // Null check for navItems
        navItems.forEach(item => item.addEventListener('click', () => switchView(item.dataset.view) ));
    }


    // --- Main Clock Update ---
    function updateMainClock() {
        if (!digitalTimeMain) return;
        const isClockSectionActive = document.getElementById('clock-section').classList.contains('active-view');
        
        if (isClockSectionActive) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
            digitalTimeMain.textContent = timeString;
            refreshMainViewLocationCardTimes(); 
        }
    }
    
    // --- World Map Data & Rendering ---
    const dotMapData = [ /* Your 100x28 dotMapData array here - unchanged from previous step */
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ];

    function renderDotMap() {
        if (!dotMapContainer) return;
        dotMapContainer.innerHTML = '';
        dotElements = []; 
        dotMapContainer.style.gridTemplateColumns = `repeat(${MAP_COLS}, 1fr)`;

        dotMapData.forEach((row, rowIndex) => {
            const rowDots = [];
            row.forEach((dotState, colIndex) => {
                const dotElement = document.createElement('span');
                dotElement.classList.add('map-dot');
                dotElement.dataset.row = rowIndex;
                dotElement.dataset.col = colIndex;
                if (dotState === 1) {
                    dotElement.classList.add('land');
                }
                dotMapContainer.appendChild(dotElement);
                rowDots.push(dotElement);
            });
            dotElements.push(rowDots);
        });
        updateMapHighlightsAndTooltips();
    }
    
    function updateMapHighlightsAndTooltips() {
        if (!dotMapContainer) return; // Added null check

        // Ensure dotElements is populated if map was rendered but array is empty
        if (dotElements.length === 0 && mapRendered && dotMapContainer.firstChild) {
            const tempDotElementsGrid = [];
            for (let r = 0; r < MAP_ROWS; r++) {
                const rowDots = [];
                for (let c = 0; c < MAP_COLS; c++) {
                    const dot = dotMapContainer.querySelector(`.map-dot[data-row='${r}'][data-col='${c}']`);
                    if (dot) rowDots.push(dot);
                }
                if (rowDots.length > 0) tempDotElementsGrid.push(rowDots);
            }
            dotElements = tempDotElementsGrid;
            if(dotElements.length === 0 && mapRendered) { // Check if still empty after trying to populate
                console.error("Failed to re-populate dotElements even though map is rendered.");
                return; // Exit if we can't get dot elements
            }
        } else if (dotElements.length === 0 && !mapRendered) {
            // If map not rendered and no elements, it's fine, renderDotMap will handle it
            return;
        }


        const allDotsInDOM = dotMapContainer.querySelectorAll('.map-dot');
        allDotsInDOM.forEach(dot => dot.classList.remove('highlight-city'));

        selectedWorldCities.forEach(city => {
            if (city.mapCol !== undefined && city.mapRow !== undefined &&
                city.mapRow < MAP_ROWS && city.mapCol < MAP_COLS) {
                
                const cityDotInDOM = dotMapContainer.querySelector(`.map-dot[data-row='${city.mapRow}'][data-col='${city.mapCol}']`);
                if (cityDotInDOM && cityDotInDOM.classList.contains('land')) {
                    cityDotInDOM.classList.add('highlight-city');
                }
            }
        });
        
        const freshDotElementsGrid = [];
        const currentDotsForCloning = Array.from(dotMapContainer.querySelectorAll('.map-dot'));
        let currentDotIndex = 0;

        for (let r = 0; r < MAP_ROWS; r++) {
            const rowDots = [];
            for (let c = 0; c < MAP_COLS; c++) {
                const originalDot = currentDotsForCloning[currentDotIndex++];
                if (!originalDot) continue; 
                
                const new_dot = originalDot.cloneNode(true);
                if (originalDot.parentNode) { 
                    originalDot.parentNode.replaceChild(new_dot, originalDot);
                } else {
                    dotMapContainer.appendChild(new_dot); 
                }
                rowDots.push(new_dot); 
                
                if (new_dot.classList.contains('land')) { 
                    new_dot.onmouseenter = (e) => handleDotHover(e.currentTarget, true, e);
                    new_dot.onmouseleave = (e) => handleDotHover(e.currentTarget, false, e);
                }
            }
            if(rowDots.length > 0) freshDotElementsGrid.push(rowDots);
        }
        if (freshDotElementsGrid.length > 0) {
            dotElements = freshDotElementsGrid; 
        }
    }
    
    function handleDotHover(dotElement, isHovering, event) {
        if (!mapTooltipElement) return;

        const row = parseInt(dotElement.dataset.row);
        const col = parseInt(dotElement.dataset.col);
        const cityAtDot = selectedWorldCities.find(c => c.mapRow === row && c.mapCol === col);

        if (isHovering && cityAtDot && dotElement.classList.contains('highlight-city')) {
            currentHoveredDot = dotElement;
            const now = new Date();
            mapTooltipElement.textContent = `${cityAtDot.name}: ${formatWorldTime(now, cityAtDot.timezone, true)}`;
            
            if (event) {
                mapTooltipElement.classList.add('visible'); 
                setTooltipInitialPosition(event);
            }
        } else {
            currentHoveredDot = null;
            mapTooltipElement.classList.remove('visible');
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }
    }

    if (dotMapContainer) {
        dotMapContainer.addEventListener('mousemove', (event) => {
            if (mapTooltipElement && mapTooltipElement.classList.contains('visible') && currentHoveredDot) { // Null check mapTooltipElement
                const elementsUnderMouse = document.elementsFromPoint(event.clientX, event.clientY);
                if (elementsUnderMouse.includes(currentHoveredDot)) { 
                    const tooltipRect = mapTooltipElement.getBoundingClientRect();
                    let x = event.clientX;
                    let y = event.clientY;

                    //const offsetX = -tooltipRect.width / 2;
                    const offsetY = -tooltipRect.height - 15; 

                    tooltipTargetX = x + offsetX;
                    tooltipTargetY = y + offsetY;

                    if (tooltipTargetX < 0) tooltipTargetX = 0;
                    if (tooltipTargetX + tooltipRect.width > window.innerWidth) tooltipTargetX = window.innerWidth - tooltipRect.width;
                    if (tooltipTargetY < 0) tooltipTargetY = 0;
                    if (tooltipTargetY + tooltipRect.height > window.innerHeight) tooltipTargetY = window.innerHeight - tooltipRect.height;

                    if (!animationFrameId) {
                        animationFrameId = requestAnimationFrame(updateSmoothTooltipPosition);
                    }
                }
            }
        });
    }

    function formatWorldTime(date, timeZone, includeAmPm = true) {
        try {
            const options = { timeZone: timeZone, hour: 'numeric', minute: '2-digit', hour12: includeAmPm, };
            if (!includeAmPm) options.hour12 = false;
            let timeStr = new Intl.DateTimeFormat('en-US', options).format(date);
            if(!includeAmPm) timeStr = timeStr.replace(/ AM$| PM$/, '');
            return timeStr;
        } catch (e) { return "N/A"; }
    }
    
    function displayWorldClocks(filter = '') {
        if (!worldClockListEl) return;
        worldClockListEl.innerHTML = '';
        const now = new Date();
        const filteredSelectedCities = selectedWorldCities.filter(city => city.name.toLowerCase().includes(filter.toLowerCase()));

        if (selectedCityIds.length === 0) {
            worldClockListEl.innerHTML = `<p style="text-align: center; color: var(--text-color-dim); margin-top: 10px;">No cities. Click "Add City".</p>`; return;
        }
        if (filteredSelectedCities.length === 0 && filter !== '') {
             worldClockListEl.innerHTML = `<p style="text-align: center; color: var(--text-color-dim); margin-top: 10px;">No match for "${filter}".</p>`; return;
        }
        
        filteredSelectedCities.forEach((city, index) => {
            const cityTime = formatWorldTime(now, city.timezone, true);
            const li = document.createElement('li');
            li.dataset.cityId = city.id;
            li.innerHTML = `<div class="wc-city-time"><div class="wc-time">${cityTime}</div><div class="wc-city">${city.name}</div></div><button class="remove-city-btn" title="Remove ${city.name}" data-city-id="${city.id}">×</button>`;
            li.style.animationDelay = `${index * 0.05}s`;
            worldClockListEl.appendChild(li);
        });
    }

    function initWorldClock() {
        if (worldClockListEl) displayWorldClocks(worldClockSearch ? worldClockSearch.value : ''); // Null check worldClockSearch
        if (worldClockInterval) clearInterval(worldClockInterval);
        worldClockInterval = setInterval(() => {
            if (document.getElementById('world-clock-section').classList.contains('active-view') && worldClockListEl) {
                 displayWorldClocks(worldClockSearch ? worldClockSearch.value : ''); // Null check
            }
        }, 15000);
    }

    function initSelectedWorldCities() {
        selectedWorldCities = selectedCityIds.map(id => allAvailableCities.find(c => c.id === id)).filter(Boolean);
    }

    function saveSelectedWorldCities() {
        localStorage.setItem('selectedWorldCityIds', JSON.stringify(selectedCityIds));
    }

    if (worldClockSearch) worldClockSearch.addEventListener('input', (e) => displayWorldClocks(e.target.value));

    if (worldClockListEl) {
        worldClockListEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-city-btn')) {
                const cityIdToRemove = e.target.dataset.cityId;
                selectedCityIds = selectedCityIds.filter(id => id !== cityIdToRemove);
                initSelectedWorldCities();
                saveSelectedWorldCities();
                displayWorldClocks(worldClockSearch ? worldClockSearch.value : ''); // Null check
                updateMapHighlightsAndTooltips();
                if (addCityModal && addCityModal.classList.contains('show')) populateAvailableCitiesList(addCitySearchInput ? addCitySearchInput.value : ''); // Null check
            }
        });
    }

    if (addCitySharedBtns.length > 0) { // Null check
        addCitySharedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (addCityModal) { // Null check
                    populateAvailableCitiesList('');
                    if (addCitySearchInput) addCitySearchInput.value = ''; // Null check
                    addCityModal.classList.add('show');
                }
            });
        });
    }


    if (closeAddCityModalBtn) closeAddCityModalBtn.addEventListener('click', () => {
        if (addCityModal) addCityModal.classList.remove('show');
    });
    if (addCityModal) addCityModal.addEventListener('click', (e) => { 
        if (e.target === addCityModal) addCityModal.classList.remove('show'); 
    });

    function populateAvailableCitiesList(filter = '') {
        if (!availableCitiesListEl) return;
        availableCitiesListEl.innerHTML = '';
        const lowerFilter = filter.toLowerCase();
        allAvailableCities.filter(city => city.name.toLowerCase().includes(lowerFilter)).forEach(city => {
            const li = document.createElement('li');
            li.textContent = city.name;
            li.dataset.cityId = city.id;
            if (selectedCityIds.includes(city.id)) li.classList.add('disabled');
            availableCitiesListEl.appendChild(li);
        });
    }

    if (addCitySearchInput) addCitySearchInput.addEventListener('input', (e) => populateAvailableCitiesList(e.target.value));

    if (availableCitiesListEl) {
        availableCitiesListEl.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI' && !e.target.classList.contains('disabled')) {
                const cityIdToAdd = e.target.dataset.cityId;
                const cityData = allAvailableCities.find(c => c.id === cityIdToAdd);

                if (cityData && !selectedCityIds.includes(cityIdToAdd)) {
                    selectedCityIds.push(cityIdToAdd);
                    initSelectedWorldCities();
                    saveSelectedWorldCities();
                    displayWorldClocks(worldClockSearch ? worldClockSearch.value : ''); // Null check
                    updateMapHighlightsAndTooltips();
                    e.target.classList.add('disabled');
                    updateMainViewLocationCardsWithNewCity(cityData); 
                }
            }
        });
    }
    
    function updateMainViewLocationCardsWithNewCity(newlyAddedCity) {
        if (!newlyAddedCity || locationTimeCards.length === 0) return;
        const now = new Date();
        const card1 = locationTimeCards[0];
        const card2 = locationTimeCards.length > 1 ? locationTimeCards[1] : null;

        const card1CityId = card1.dataset.cityId;
        const card2CityId = card2 ? card2.dataset.cityId : null;

        if (card1CityId === newlyAddedCity.id || (card2 && card2CityId === newlyAddedCity.id)) {
            if (card1CityId === newlyAddedCity.id) setLocationCard(card1, newlyAddedCity, now, card1.classList.contains('active'));
            if (card2 && card2CityId === newlyAddedCity.id) setLocationCard(card2, newlyAddedCity, now, card2.classList.contains('active'));
            return;
        }

        if (card2) { 
            if (card2CityId === 'london' || (card1CityId === 'new-york' && card1.classList.contains('active'))) {
                setLocationCard(card2, newlyAddedCity, now, false); 
            } else if (card1CityId !== 'new-york') {
                 setLocationCard(card2, newlyAddedCity, now, false);
            } else { // Fallback to card2 if card1 is NY and active, and card2 is not default london
                setLocationCard(card2, newlyAddedCity, now, false);
            }
        } else {
            if (card1CityId !== 'new-york' || !card1.classList.contains('active')) {
                 setLocationCard(card1, newlyAddedCity, now, true); 
            }
        }
        ensureCorrectActiveCardState();
    }

    function refreshMainViewLocationCardTimes() {
        if (locationTimeCards.length === 0) return;
        const now = new Date();
        const card1 = locationTimeCards[0];
        if (card1) { // Null check card1
            const card1CityId = card1.dataset.cityId;
            const city1Data = allAvailableCities.find(c => c.id === card1CityId);
            if (city1Data) {
                setLocationCard(card1, city1Data, now, card1.classList.contains('active'));
            } else if (card1CityId === 'new-york' || !card1CityId) {
                setLocationCardDefaults(card1, 'New York', 'America/New_York', now, true);
            }
        }


        if (locationTimeCards.length > 1) {
            const card2 = locationTimeCards[1];
            if (card2) { // Null check card2
                const card2CityId = card2.dataset.cityId;
                const city2Data = allAvailableCities.find(c => c.id === card2CityId);
                if (city2Data) {
                    setLocationCard(card2, city2Data, now, card2.classList.contains('active'));
                } else if (card2CityId === 'london' || !card2CityId) {
                     setLocationCardDefaults(card2, 'London', 'Europe/London', now, false);
                }
            }
        }
        ensureCorrectActiveCardState();
    }
    
    function setLocationCardDefaults(cardElement, defaultName, defaultTimezone, date, isActive) {
        if (!cardElement) return; // Null check
        cardElement.querySelector('.location-time').textContent = formatWorldTime(date, defaultTimezone, false);
        cardElement.querySelector('.location-name').textContent = defaultName;
        cardElement.dataset.cityId = defaultName.toLowerCase().replace(/\s+/g, '-');
        if (isActive) cardElement.classList.add('active');
        else cardElement.classList.remove('active');
    }

    function setLocationCard(cardElement, cityData, date, makeActivePreferred = false) {
        if (!cardElement || !cityData) return;
        cardElement.querySelector('.location-time').textContent = formatWorldTime(date, cityData.timezone, false);
        cardElement.querySelector('.location-name').textContent = cityData.name;
        cardElement.dataset.cityId = cityData.id;
        if (makeActivePreferred && locationTimeCards.length > 0) { // Null check locationTimeCards
            locationTimeCards.forEach(c => c.classList.remove('active'));
            cardElement.classList.add('active');
        }
    }

    function ensureCorrectActiveCardState() {
        if (locationTimeCards.length === 0) return;
        const card1 = locationTimeCards[0];
        const card2 = locationTimeCards.length > 1 ? locationTimeCards[1] : null;
        let activeCardSet = false;
        if (card1 && card1.dataset.cityId === 'new-york') { // Null check card1
            card1.classList.add('active');
            if (card2) card2.classList.remove('active');
            activeCardSet = true;
        } else if (card2 && card2.dataset.cityId === 'new-york') {
            card2.classList.add('active');
            if (card1) card1.classList.remove('active'); // Null check card1
            activeCardSet = true;
        }
        if (!activeCardSet && card1) { // Null check card1
            card1.classList.add('active');
            if (card2) card2.classList.remove('active');
        }
    }

    // --- Ringtone Modal Logic ---
    if (selectRingtoneButton) {
        selectRingtoneButton.addEventListener('click', () => {
            if (selectRingtoneModal) {
                tempSelectedRingtoneInModal = currentSelectedRingtone; 
                updateRingtoneListSelection();
                selectRingtoneModal.classList.add('show');
            } else {
                alert('Ringtone selection modal not found!'); 
            }
        });
    }

    if (closeRingtoneModalBtn) {
        closeRingtoneModalBtn.addEventListener('click', () => {
            if (selectRingtoneModal) selectRingtoneModal.classList.remove('show');
            stopRingtoneTest(); 
        });
    }

    if (selectRingtoneModal) { 
        selectRingtoneModal.addEventListener('click', (e) => {
            if (e.target === selectRingtoneModal) {
                selectRingtoneModal.classList.remove('show');
                stopRingtoneTest();
            }
        });
    }

    function updateRingtoneListSelection() {
        if (!ringtoneListEl) return;
        const items = ringtoneListEl.querySelectorAll('.ringtone-item');
        items.forEach(item => {
            if (item.dataset.ringtoneValue === tempSelectedRingtoneInModal) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    if (ringtoneListEl) {
        ringtoneListEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('ringtone-item')) {
                stopRingtoneTest(); 
                tempSelectedRingtoneInModal = e.target.dataset.ringtoneValue;
                updateRingtoneListSelection();
            }
        });
    }

    if (saveRingtoneBtn) {
        saveRingtoneBtn.addEventListener('click', () => {
            currentSelectedRingtone = tempSelectedRingtoneInModal;
            localStorage.setItem('timerRingtone', currentSelectedRingtone);
            if (selectRingtoneModal) selectRingtoneModal.classList.remove('show');
            stopRingtoneTest();
        });
    }

    function playRingtone(ringtoneFile) {
        stopRingtoneTest(); 
        const basePath = 'audio/'; // IMPORTANT: Adjust if your folder is different
        ringtoneAudio = new Audio(basePath + ringtoneFile);
        ringtoneAudio.play()
            .catch(error => console.error('Error playing ringtone:', error));
    }

    function stopRingtoneTest() {
        if (ringtoneAudio) {
            ringtoneAudio.pause();
            ringtoneAudio.currentTime = 0; 
            ringtoneAudio = null;
        }
    }

    if (testRingtoneBtn) {
        testRingtoneBtn.addEventListener('click', () => {
            if (tempSelectedRingtoneInModal) {
                playRingtone(tempSelectedRingtoneInModal);
            } else {
                alert('Please select a ringtone to test.');
            }
        });
    }
    // --- End of Ringtone Modal Logic ---


    // --- Timer Logic ---
    function formatTimerTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const parts = [];
        if (h > 0) parts.push(String(h).padStart(2, '0'));
        parts.push(String(m).padStart(2, '0'));
        parts.push(String(s).padStart(2, '0'));
        return parts.join(':');
    }

    function updateTimerProgress() {
        if (!timerProgressCircle) return;
        const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) : 0;
        const dashOffset = timerCircleCircumference * (1 - progress); 
        timerProgressCircle.style.strokeDashoffset = Math.max(0, dashOffset);
    }
    
    function updateTimerDisplay() {
        if (!timerCountdownDisplay) return;
        timerCountdownDisplay.textContent = formatTimerTime(remainingSeconds);
        updateTimerProgress();
        if (remainingSeconds <= 0 && isTimerRunning) {
            clearInterval(timerInterval); 
            isTimerRunning = false; 
            if(timerStartStopButton) timerStartStopButton.textContent = 'Start'; // Null check
            timerCountdownDisplay.textContent = "Done!"; 
            if(timerProgressCircle) timerProgressCircle.style.strokeDashoffset = 0; // Null check
            playRingtone(currentSelectedRingtone); // Play selected ringtone
        }
    }

    function setInitialTimerDisplay() {
        if (!timerHoursInput || !timerMinutesInput || !timerSecondsInput || !timerCountdownDisplay) return;
        const h = parseInt(timerHoursInput.value) || 0; 
        const m = parseInt(timerMinutesInput.value) || 0; 
        const s = parseInt(timerSecondsInput.value) || 0;
        totalSeconds = (h * 3600) + (m * 60) + s; 
        remainingSeconds = totalSeconds;
        updateTimerDisplay();
    }

    if (timerStartStopButton) {
        timerStartStopButton.addEventListener('click', () => {
            if (isTimerRunning) { 
                clearInterval(timerInterval); 
                isTimerRunning = false; 
                timerStartStopButton.textContent = 'Resume'; 
            } else {
                if (timerStartStopButton.textContent === 'Start') {
                    const h = parseInt(timerHoursInput.value) || 0; 
                    const m = parseInt(timerMinutesInput.value) || 0; 
                    const s = parseInt(timerSecondsInput.value) || 0;
                    totalSeconds = (h * 3600) + (m * 60) + s;
                    if (totalSeconds <= 0) { alert("Please set a time greater than 0."); return; }
                    remainingSeconds = totalSeconds;
                } else { 
                    if (remainingSeconds <= 0) { alert("Timer already finished. Please reset."); return; } 
                }
                isTimerRunning = true; 
                timerStartStopButton.textContent = 'Pause'; 
                updateTimerDisplay(); 
                timerInterval = setInterval(() => { 
                    if (remainingSeconds > 0) remainingSeconds--; 
                    updateTimerDisplay(); 
                }, 1000);
            }
        });
    }

    if (timerResetButton) {
        timerResetButton.addEventListener('click', () => {
            clearInterval(timerInterval); 
            isTimerRunning = false;
            if (timerHoursInput) timerHoursInput.value = "0"; 
            if (timerMinutesInput) timerMinutesInput.value = "0"; 
            if (timerSecondsInput) timerSecondsInput.value = "45";
            setInitialTimerDisplay(); 
            if (timerStartStopButton) timerStartStopButton.textContent = 'Start';
            if (timerProgressCircle) timerProgressCircle.style.strokeDashoffset = timerCircleCircumference;
        });
    }

    if (timerHoursInput && timerMinutesInput && timerSecondsInput) { // Ensure all are present
        [timerHoursInput, timerMinutesInput, timerSecondsInput].forEach(input => {
            if (input) input.addEventListener('input', () => { if (!isTimerRunning) setInitialTimerDisplay(); });
        });
    }
    // --- End of Timer Logic ---

    // --- Initial Setup ---
    initSelectedWorldCities(); 
    if (timerProgressCircle) {
        timerProgressCircle.style.strokeDasharray = timerCircleCircumference;
        timerProgressCircle.style.strokeDashoffset = timerCircleCircumference;
        setInitialTimerDisplay(); // Call after ensuring inputs exist
    }
    if (locationTimeCards.length > 0) {
        refreshMainViewLocationCardTimes();
    }
    if (digitalTimeMain) { // Only set interval if main clock element exists
        setInterval(updateMainClock, 1000); 
        updateMainClock(); 
    }
    
    const defaultNavElement = Array.from(navItems).find(item => item.dataset.view === 'clock-section'); // Renamed to avoid conflict
    if (defaultNavElement) {
        switchView(defaultNavElement.dataset.view);
    } else if (navItems.length > 0) {
        switchView(navItems[0].dataset.view);
    }
    // --- End of Initial Setup ---

}); // Ensure this is the VERY LAST closing brace and parenthesis