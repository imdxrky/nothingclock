document.addEventListener('DOMContentLoaded', () => {
    const currentViewTitle = document.getElementById('current-view-title');
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    // Clock View
    const digitalTimeMain = document.getElementById('digital-time-main');
    const locationTimeCards = document.querySelectorAll('.location-times .location-card');

    // World Clock View
    const worldClockListEl = document.getElementById('world-clock-list');
    const worldClockSearch = document.getElementById('world-clock-search');
    const dotMapContainer = document.getElementById('dot-map-container');
    const mapTooltipElement = document.getElementById('map-tooltip');

    let currentHoveredDot = null; // To keep track of the dot being hovered

    function updateTooltipPosition(event) {
        if (!mapTooltipElement || !mapTooltipElement.classList.contains('visible')) return;

        const tooltipRect = mapTooltipElement.getBoundingClientRect();
        let x = event.clientX;
        let y = event.clientY;

        // Offset to position the tooltip slightly above and to the right of the cursor, for example
        // or directly under, or centered etc.
        // For "underneath the mouse":
        const offsetX = -tooltipRect.width / 2; // Center horizontally on cursor
        const offsetY = 20; // Place 20px below the cursor

        mapTooltipElement.style.left = `${x + offsetX}px`;
        mapTooltipElement.style.top = `${y + offsetY}px`;

        // Boundary checks against viewport
        if (x + offsetX < 0) { // Prevent going off left edge of viewport
            mapTooltipElement.style.left = `0px`;
        }
        if (x + offsetX + tooltipRect.width > window.innerWidth) { // Prevent going off right
            mapTooltipElement.style.left = `${window.innerWidth - tooltipRect.width}px`;
        }
        if (y + offsetY < 0) { // Prevent going off top
            mapTooltipElement.style.top = `0px`;
        }
        if (y + offsetY + tooltipRect.height > window.innerHeight) { // Prevent going off bottom
             // If no space below, try to position above cursor
            mapTooltipElement.style.top = `${y - tooltipRect.height - 10}px`; // 10px above
        }
    }

    const addCityBtn = document.getElementById('add-city-btn');
    const addCityModal = document.getElementById('add-city-modal');
    const closeAddCityModalBtn = document.getElementById('close-add-city-modal-btn');
    const addCitySearchInput = document.getElementById('add-city-search');
    const availableCitiesListEl = document.getElementById('available-cities-list');
    
    const MAP_COLS = 100; // << NEW VALUE
    const MAP_ROWS = 28;  // Stays the same

    // City list with re-mapped coordinates for the NEW 96x24 map
    const allAvailableCities = [
        // North America
        { name: 'Vancouver', timezone: 'America/Vancouver', id: 'vancouver', mapCol: 4, mapRow: 6 },       // 11 - 7 = 4
        { name: 'Los Angeles', timezone: 'America/Los_Angeles', id: 'los-angeles', mapCol: 5, mapRow: 9 }, // 12 - 7 = 5 (Using the LA corrected value from last step)
        { name: 'Denver', timezone: 'America/Denver', id: 'denver', mapCol: 12, mapRow: 8 },              // 19 - 7 = 12
        { name: 'Chicago', timezone: 'America/Chicago', id: 'chicago', mapCol: 18, mapRow: 7 },            // 25 - 7 = 18
        { name: 'New York', timezone: 'America/New_York', id: 'new-york', mapCol: 22, mapRow: 7 },        // 29 - 7 = 22
        { name: 'Toronto', timezone: 'America/Toronto', id: 'toronto', mapCol: 21, mapRow: 6 },            // 28 - 7 = 21
        { name: 'Mexico City', timezone: 'America/Mexico_City', id: 'mexico-city', mapCol: 14, mapRow: 13 }, // 21 - 7 = 14
        { name: 'Honolulu', timezone: 'Pacific/Honolulu', id: 'honolulu', mapCol: 0, mapRow: 13 },          // 3 - 7 = -4 => 0 (min col is 0)

        // South America
        { name: 'Bogota', timezone: 'America/Bogota', id: 'bogota', mapCol: 22, mapRow: 15 },              // 29 - 7 = 22
        { name: 'Lima', timezone: 'America/Lima', id: 'lima', mapCol: 21, mapRow: 18 },                  // 28 - 7 = 21
        { name: 'Santiago', timezone: 'America/Santiago', id: 'santiago', mapCol: 23, mapRow: 22 },          // 30 - 7 = 23
        { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', id: 'buenos-aires', mapCol: 28, mapRow: 22 }, // 35 - 7 = 28
        { name: 'Sao Paulo', timezone: 'America/Sao_Paulo', id: 'sao-paulo', mapCol: 31, mapRow: 20 },      // 38 - 7 = 31
        { name: 'Rio de Janeiro', timezone: 'America/Sao_Paulo', id: 'rio-de-janeiro', mapCol: 33, mapRow: 20 }, // 40 - 7 = 33

        // Europe
        { name: 'Reykjavik', timezone: 'Atlantic/Reykjavik', id: 'reykjavik', mapCol: 29, mapRow: 3 },      // 36 - 7 = 29
        { name: 'Lisbon', timezone: 'Europe/Lisbon', id: 'lisbon', mapCol: 32, mapRow: 9 },              // 39 - 7 = 32
        { name: 'Madrid', timezone: 'Europe/Madrid', id: 'madrid', mapCol: 34, mapRow: 9 },              // 41 - 7 = 34
        { name: 'London', timezone: 'Europe/London', id: 'london', mapCol: 36, mapRow: 6 },              // 43 - 7 = 36
        { name: 'Paris', timezone: 'Europe/Paris', id: 'paris', mapCol: 37, mapRow: 7 },                // 44 - 7 = 37
        { name: 'Brussels', timezone: 'Europe/Brussels', id: 'brussels', mapCol: 38, mapRow: 6 },          // 45 - 7 = 38
        { name: 'Amsterdam', timezone: 'Europe/Amsterdam', id: 'amsterdam', mapCol: 38, mapRow: 5 },      // 45 - 7 = 38
        { name: 'Berlin', timezone: 'Europe/Berlin', id: 'berlin', mapCol: 41, mapRow: 6 },              // 48 - 7 = 41
        { name: 'Zurich', timezone: 'Europe/Zurich', id: 'zurich', mapCol: 39, mapRow: 7 },              // 46 - 7 = 39
        { name: 'Rome', timezone: 'Europe/Rome', id: 'rome', mapCol: 41, mapRow: 9 },                  // 48 - 7 = 41
        { name: 'Athens', timezone: 'Europe/Athens', id: 'athens', mapCol: 45, mapRow: 9 },              // 52 - 7 = 45
        { name: 'Prague', timezone: 'Europe/Prague', id: 'prague', mapCol: 42, mapRow: 7 },              // 49 - 7 = 42
        { name: 'Vienna', timezone: 'Europe/Vienna', id: 'vienna', mapCol: 43, mapRow: 7 },              // 50 - 7 = 43
        { name: 'Bratislava', timezone: 'Europe/Bratislava', id: 'bratislava', mapCol: 43, mapRow: 7 },      // 50 - 7 = 43
        { name: 'Budapest', timezone: 'Europe/Budapest', id: 'budapest', mapCol: 44, mapRow: 7 },          // 51 - 7 = 44
        { name: 'Warsaw', timezone: 'Europe/Warsaw', id: 'warsaw', mapCol: 45, mapRow: 6 },              // 52 - 7 = 45
        { name: 'Oslo', timezone: 'Europe/Oslo', id: 'oslo', mapCol: 40, mapRow: 4 },                  // 47 - 7 = 40
        { name: 'Stockholm', timezone: 'Europe/Stockholm', id: 'stockholm', mapCol: 43, mapRow: 4 },      // 50 - 7 = 43
        { name: 'Helsinki', timezone: 'Europe/Helsinki', id: 'helsinki', mapCol: 46, mapRow: 4 },          // 53 - 7 = 46
        { name: 'Kyiv', timezone: 'Europe/Kyiv', id: 'kyiv', mapCol: 48, mapRow: 6 },                  // 55 - 7 = 48
        { name: 'Moscow', timezone: 'Europe/Moscow', id: 'moscow', mapCol: 52, mapRow: 5 },              // 59 - 7 = 52
        { name: 'Istanbul', timezone: 'Europe/Istanbul', id: 'istanbul', mapCol: 48, mapRow: 9 },          // 55 - 7 = 48

        // Africa
        { name: 'Casablanca', timezone: 'Africa/Casablanca', id: 'casablanca', mapCol: 32, mapRow: 10 },  // 39 - 7 = 32
        { name: 'Cairo', timezone: 'Africa/Cairo', id: 'cairo', mapCol: 49, mapRow: 11 },                // 56 - 7 = 49
        { name: 'Lagos', timezone: 'Africa/Lagos', id: 'lagos', mapCol: 38, mapRow: 15 },                // 45 - 7 = 38
        { name: 'Nairobi', timezone: 'Africa/Nairobi', id: 'nairobi', mapCol: 52, mapRow: 16 },            // 59 - 7 = 52
        { name: 'Johannesburg', timezone: 'Africa/Johannesburg', id: 'johannesburg', mapCol: 48, mapRow: 21 },// 55 - 7 = 48
        { name: 'Cape Town', timezone: 'Africa/Johannesburg', id: 'cape-town', mapCol: 44, mapRow: 22 },    // 51 - 7 = 44

        // Asia & Middle East
        { name: 'Tehran', timezone: 'Asia/Tehran', id: 'tehran', mapCol: 56, mapRow: 10 },              // 63 - 7 = 56
        { name: 'Dubai', timezone: 'Asia/Dubai', id: 'dubai', mapCol: 58, mapRow: 12 },                // 65 - 7 = 58
        { name: 'New Delhi', timezone: 'Asia/Kolkata', id: 'new-delhi', mapCol: 65, mapRow: 11 },          // 72 - 7 = 65
        { name: 'Mumbai', timezone: 'Asia/Kolkata', id: 'mumbai', mapCol: 64, mapRow: 14 },             // 71 - 7 = 64
        { name: 'Bangkok', timezone: 'Asia/Bangkok', id: 'bangkok', mapCol: 72, mapRow: 14 },            // 79 - 7 = 72
        { name: 'Ho Chi Minh City', timezone: 'Asia/Ho_Chi_Minh', id: 'ho-chi-minh-city', mapCol: 75, mapRow: 15 }, // 82 - 7 = 75
        { name: 'Singapore', timezone: 'Asia/Singapore', id: 'singapore', mapCol: 73, mapRow: 16 },        // 80 - 7 = 73
        { name: 'Jakarta', timezone: 'Asia/Jakarta', id: 'jakarta', mapCol: 75, mapRow: 17 },            // 82 - 7 = 75
        { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', id: 'hong-kong', mapCol: 78, mapRow: 13 },        // 85 - 7 = 78
        { name: 'Manila', timezone: 'Asia/Manila', id: 'manila', mapCol: 81, mapRow: 14 },               // 88 - 7 = 81
        { name: 'Shanghai', timezone: 'Asia/Shanghai', id: 'shanghai', mapCol: 81, mapRow: 11 },           // 88 - 7 = 81
        { name: 'Beijing', timezone: 'Asia/Shanghai', id: 'beijing', mapCol: 79, mapRow: 8 },            // 86 - 7 = 79
        { name: 'Seoul', timezone: 'Asia/Seoul', id: 'seoul', mapCol: 83, mapRow: 9 },                // 90 - 7 = 83
        { name: 'Tokyo', timezone: 'Asia/Tokyo', id: 'tokyo', mapCol: 86, mapRow: 9 },                // 93 - 7 = 86

        // Oceania
        { name: 'Perth', timezone: 'Australia/Perth', id: 'perth', mapCol: 78, mapRow: 22 },              // 85 - 7 = 78
        { name: 'Sydney', timezone: 'Australia/Sydney', id: 'sydney', mapCol: 84, mapRow: 22 },             // 91 - 7 = 84
        { name: 'Melbourne', timezone: 'Australia/Melbourne', id: 'melbourne', mapCol: 82, mapRow: 23 },   // 89 - 7 = 82
        { name: 'Auckland', timezone: 'Pacific/Auckland', id: 'auckland', mapCol: 88, mapRow: 23 },        // 95 - 7 = 88

    ].sort((a, b) => a.name.localeCompare(b.name));
    let selectedCityIds = JSON.parse(localStorage.getItem('selectedWorldCityIds')) || ['new-york', 'london', 'tokyo', 'prague', 'sydney', 'cairo', 'los-angeles'];
    let selectedWorldCities = [];
    
    let worldClockInterval;
    let dotElements = []; 

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
        currentViewTitle.textContent = targetTitle.charAt(0).toUpperCase() + targetTitle.slice(1);

        if (targetViewId !== 'world-clock-section' && worldClockInterval) clearInterval(worldClockInterval);
        
        if (targetViewId === 'clock-section') updateMainClock();
        if (targetViewId === 'world-clock-section') {
            if (dotElements.length === 0) renderDotMap();
            updateMapHighlightsAndTooltips();
            initWorldClock();
        }
        if (targetViewId === 'timers-section' && !isTimerRunning) setInitialTimerDisplay();
    }

    navItems.forEach(item => item.addEventListener('click', () => switchView(item.dataset.view) ));

    function updateMainClock() {
        if (!digitalTimeMain || !document.getElementById('clock-section').classList.contains('active-view')) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        digitalTimeMain.textContent = timeString;

        if (locationTimeCards.length > 0) {
            try {
                locationTimeCards[0].querySelector('.location-time').textContent = formatWorldTime(now, 'America/New_York', false);
                locationTimeCards[1].querySelector('.location-time').textContent = formatWorldTime(now, 'Europe/London', false);
            } catch (e) { console.error("Error updating location card times:", e); }
        }
    }
    
    // New, more detailed dotMapData (96x24)
    const dotMapData = [
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


    // And add this event listener to the dotMapContainer (or body/window if preferred)
    if (dotMapContainer) {
        dotMapContainer.addEventListener('mousemove', (event) => {
            // Only update tooltip position if it's supposed to be visible and over a specific dot
            // This check ensures we don't move the tooltip if the mouse moves off a valid dot
            // but is still within the map container. The 'mouseleave' on the dot handles hiding.
            if (mapTooltipElement.classList.contains('visible') && currentHoveredDot) {
                 // Check if the mouse is still over the 'currentHoveredDot'
                 // This is a simple check; a more robust one might involve checking event.target
                const elementsUnderMouse = document.elementsFromPoint(event.clientX, event.clientY);
                if (elementsUnderMouse.includes(currentHoveredDot)) {
                    updateTooltipPosition(event);
                } else {
                    // If mouse has moved off the dot that made the tooltip visible,
                    // but not yet triggered dot.onmouseleave (e.g. moving fast over gaps)
                    // you might want to hide it here too, or rely on dot.onmouseleave
                }
            }
        });
    }

    // In your updateMapHighlightsAndTooltips function, ensure you update listeners:
    function updateMapHighlightsAndTooltips() {
        if (dotElements.length === 0) return;

        dotElements.flat().forEach(dot => dot.classList.remove('highlight-city'));

        selectedWorldCities.forEach(city => {
            if (city.mapCol !== undefined && city.mapRow !== undefined &&
                city.mapRow < dotElements.length && city.mapCol < dotElements[city.mapRow].length) {
                const cityDot = dotElements[city.mapRow][city.mapCol];
                if (cityDot && cityDot.classList.contains('land')) {
                    cityDot.classList.add('highlight-city');
                }
            }
        });
        
        dotElements.flat().filter(dot => dot.classList.contains('land')).forEach(dot => {
            // Remove old listeners to prevent multiple attachments if this function is called again
            // This is a bit crude; a more robust system would store and remove specific listeners.
            // For simplicity now, we'll rely on this being called primarily during setup (renderDotMap).
            // If called frequently, consider a more robust listener management.
            const new_dot = dot.cloneNode(true); // Clone to remove all old listeners
            dot.parentNode.replaceChild(new_dot, dot); // Replace old dot with new one
            
            // Add new listeners to the cloned dot
            if (new_dot.classList.contains('land')) { // Re-check since we cloned
                new_dot.onmouseenter = (e) => handleDotHover(e.currentTarget, true, e); // Pass the event
                new_dot.onmouseleave = (e) => handleDotHover(e.currentTarget, false, e); // Pass the event
            }
        });
    }
    
    function handleDotHover(dotElement, isHovering, event) { // Added event parameter
        if (!mapTooltipElement) return;

        const row = parseInt(dotElement.dataset.row);
        const col = parseInt(dotElement.dataset.col);
        const cityAtDot = selectedWorldCities.find(c => c.mapRow === row && c.mapCol === col);

        if (isHovering && cityAtDot && dotElement.classList.contains('highlight-city')) {
            currentHoveredDot = dotElement; // Store the currently hovered dot
            const now = new Date();
            mapTooltipElement.textContent = `${cityAtDot.name}: ${formatWorldTime(now, cityAtDot.timezone, true)}`;
            mapTooltipElement.classList.add('visible');
            // Initial position update, will be refined by mousemove
            if (event) { // Check if event is passed (it will be on mouseenter)
                updateTooltipPosition(event);
            }
        } else {
            currentHoveredDot = null;
            mapTooltipElement.classList.remove('visible');
        }
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
        displayWorldClocks(worldClockSearch.value);
        if (worldClockInterval) clearInterval(worldClockInterval);
        worldClockInterval = setInterval(() => {
            if (document.getElementById('world-clock-section').classList.contains('active-view')) {
                 displayWorldClocks(worldClockSearch.value);
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
                displayWorldClocks(worldClockSearch.value);
                updateMapHighlightsAndTooltips();
                if (addCityModal.classList.contains('show')) populateAvailableCitiesList(addCitySearchInput.value);
            }
        });
    }

    if (addCityBtn) addCityBtn.addEventListener('click', () => { populateAvailableCitiesList(''); addCitySearchInput.value = ''; addCityModal.classList.add('show'); });
    if (closeAddCityModalBtn) closeAddCityModalBtn.addEventListener('click', () => addCityModal.classList.remove('show'));
    if (addCityModal) addCityModal.addEventListener('click', (e) => { if (e.target === addCityModal) addCityModal.classList.remove('show'); });

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
                if (!selectedCityIds.includes(cityIdToAdd)) {
                    selectedCityIds.push(cityIdToAdd);
                    initSelectedWorldCities();
                    saveSelectedWorldCities();
                    displayWorldClocks(worldClockSearch.value);
                    updateMapHighlightsAndTooltips();
                    e.target.classList.add('disabled');
                }
            }
        });
    }

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
            clearInterval(timerInterval); isTimerRunning = false; timerStartStopButton.textContent = 'Start';
            timerCountdownDisplay.textContent = "Done!"; timerProgressCircle.style.strokeDashoffset = 0;
        }
    }

    function setInitialTimerDisplay() {
        if (!timerHoursInput || !timerMinutesInput || !timerSecondsInput) return;
        const h = parseInt(timerHoursInput.value) || 0; const m = parseInt(timerMinutesInput.value) || 0; const s = parseInt(timerSecondsInput.value) || 0;
        totalSeconds = (h * 3600) + (m * 60) + s; remainingSeconds = totalSeconds;
        updateTimerDisplay();
    }

    if (timerStartStopButton) {
        timerStartStopButton.addEventListener('click', () => {
            if (isTimerRunning) { clearInterval(timerInterval); isTimerRunning = false; timerStartStopButton.textContent = 'Resume'; }
            else {
                if (timerStartStopButton.textContent === 'Start') {
                    const h = parseInt(timerHoursInput.value) || 0; const m = parseInt(timerMinutesInput.value) || 0; const s = parseInt(timerSecondsInput.value) || 0;
                    totalSeconds = (h * 3600) + (m * 60) + s;
                    if (totalSeconds <= 0) { alert("Please set a time greater than 0."); return; }
                    remainingSeconds = totalSeconds;
                } else { if (remainingSeconds <= 0) { alert("Timer already finished. Please reset."); return; } }
                isTimerRunning = true; timerStartStopButton.textContent = 'Pause'; updateTimerDisplay(); 
                timerInterval = setInterval(() => { if (remainingSeconds > 0) remainingSeconds--; updateTimerDisplay(); }, 1000);
            }
        });
    }

    if (timerResetButton) {
        timerResetButton.addEventListener('click', () => {
            clearInterval(timerInterval); isTimerRunning = false;
            timerHoursInput.value = "0"; timerMinutesInput.value = "0"; timerSecondsInput.value = "45";
            setInitialTimerDisplay(); timerStartStopButton.textContent = 'Start';
            timerProgressCircle.style.strokeDashoffset = timerCircleCircumference;
        });
    }

    [timerHoursInput, timerMinutesInput, timerSecondsInput].forEach(input => {
        if (input) input.addEventListener('input', () => { if (!isTimerRunning) setInitialTimerDisplay(); });
    });

    initSelectedWorldCities(); 
    if (timerProgressCircle) {
        timerProgressCircle.style.strokeDasharray = timerCircleCircumference;
        timerProgressCircle.style.strokeDashoffset = timerCircleCircumference;
        setInitialTimerDisplay();
    }
    setInterval(updateMainClock, 1000); updateMainClock(); 
    const defaultNav = Array.from(navItems).find(item => item.dataset.view === 'clock-section');
    if (defaultNav) switchView(defaultNav.dataset.view);
    else if (navItems.length > 0) switchView(navItems[0].dataset.view);
});