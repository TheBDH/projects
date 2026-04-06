/* COUNTDOWN CODE */

const FORCE_LIVE_MAP = false;
const lotteryStartISO = '2026-04-06T00:00:00-04:00'; // April 6 2026, midnight EDT — adjust as needed
const section = document.getElementById('countdown');
const target = new Date(section.dataset.target).getTime();
const bgVideo = document.getElementById('bg-video');
const mediaCredit = document.getElementById('media-credit');

const $days = document.getElementById('cd-days');
const $hours = document.getElementById('cd-hours');
const $mins = document.getElementById('cd-mins');
const $secs = document.getElementById('cd-secs');
const $note = document.getElementById('cd-note');

function pad(n) {
    return String(n).padStart(2, '0');
}

function tick() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        $days.textContent = '00';
        $hours.textContent = '00';
        $mins.textContent = '00';
        $secs.textContent = '00';
        $note.textContent = 'The housing selection period has begun.';
        return;
    }

    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);

    $days.textContent = pad(d);
    $hours.textContent = pad(h);
    $mins.textContent = pad(m);
    $secs.textContent = pad(s);

    requestAnimationFrame(tick);
}

/* Kick off on next frame so DOM is painted first */
requestAnimationFrame(tick);

function updateBgVideoOpacity() {
    if (!bgVideo && !mediaCredit) return;

    const fadeRange = Math.max(window.innerHeight * 0.3, 1);
    const opacity = Math.max(0, 1 - (window.scrollY / fadeRange));
    if (bgVideo) bgVideo.style.opacity = String(opacity);
    if (mediaCredit) mediaCredit.style.opacity = String(opacity);
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateBgVideoOpacity);
}, { passive: true });

window.addEventListener('resize', updateBgVideoOpacity);
updateBgVideoOpacity();


/* HOUSING MAPS */
const buttons = document.querySelectorAll('.housing__toggle-btn');
const panels = document.querySelectorAll('.housing__panel');
const liveMapBlock = document.querySelector('.housing-live');
const panel2026Content = document.querySelector('#panel-2026 .housing__embed-placeholder');

if (liveMapBlock && panel2026Content) {
    panel2026Content.appendChild(liveMapBlock);
}

function switchToYear(year) {
    buttons.forEach((b) => {
        const isMatch = b.dataset.year === year;
        b.classList.toggle('active', isMatch);
        b.setAttribute('aria-checked', String(isMatch));
    });
    panels.forEach((p) => {
        p.classList.toggle('active', p.id === `panel-${year}`);
    });
}

/* Manual toggle */
buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        switchToYear(btn.dataset.year);
    });
});

/* Auto-switch to 2026 once countdown target has passed */
const countdownEl = document.getElementById('countdown');
if (countdownEl?.dataset.target) {
    const target = new Date(countdownEl.dataset.target).getTime();
    if (FORCE_LIVE_MAP || Date.now() >= target) {
        switchToYear('2026');
    }
}

/* LIVE MAP */

const placeholderEl = document.getElementById('housing-live-placeholder');
const contentEl = document.getElementById('housing-live-content');

function checkCountdown() {
    if (FORCE_LIVE_MAP) return true;
    const countdown = document.getElementById('countdown');
    if (!countdown?.dataset.target) return false;
    return Date.now() >= new Date(countdown.dataset.target).getTime();
}

function revealLiveMap() {
    placeholderEl?.setAttribute('style', 'display:none;');
    contentEl?.setAttribute('style', 'display:block;');
    requestAnimationFrame(() => initLeafletMap());
}

if (checkCountdown()) {
    revealLiveMap();
} else {
    const pollInterval = setInterval(() => {
        if (checkCountdown()) {
            clearInterval(pollInterval);
            revealLiveMap();
        }
    }, 10_000);
}

// --- STATE ---

let mapInitialised = false;
let leafletMap;
let dormLayer;
let housingData;
let timestamps = [];
let currentIndex = 0;
let labelZoomThreshold = 17.5;

const genderSelect = document.getElementById('housing-filter-gender');
const sizeSelect = document.getElementById('housing-filter-size');
const typeSelect = document.getElementById('housing-filter-type');
const metricSelect = document.getElementById('housing-filter-metric');
const refreshButton = document.getElementById('housing-filter-refresh');

let metricFilter = metricSelect?.value ?? 'pct';
let genderFilter = genderSelect?.value ?? 'ALL';
let sizeFilter = sizeSelect?.value ?? 'ALL';
let roomTypeFilter = typeSelect?.value ?? 'ALL';

let playInterval = null;
let isPlaying = false;
const LIVE_DISPLAY_YEAR = 2026;

// --- FIELD HELPERS ---

function parseSizeChoice(choice) {
    if (choice === 'ALL') return { size: 'ALL', isAllSizes: true };
    return { size: String(choice), isAllSizes: false };
}

function availField(g, sizeChoice, typeChoice) {
    const { size, isAllSizes } = parseSizeChoice(sizeChoice);
    if (typeChoice === 'SUITE') {
        return isAllSizes ? `Avail_S_${g}_ALL` : `Avail_S_${g}_${size}`;
    }
    return isAllSizes ? `Avail_${g}_ALL` : `Avail_${g}_${size}`;
}

function totalField(g, sizeChoice, typeChoice) {
    const { size, isAllSizes } = parseSizeChoice(sizeChoice);
    if (typeChoice === 'SUITE') {
        return isAllSizes ? `Total_S_${g}_ALL` : `Total_S_${g}_${size}`;
    }
    return isAllSizes ? `Total_${g}_ALL` : `Total_${g}_${size}`;
}

function pctField(g, sizeChoice, typeChoice) {
    const { size, isAllSizes } = parseSizeChoice(sizeChoice);
    if (typeChoice === 'SUITE') {
        return isAllSizes ? `Pct_S_${g}_ALL` : `Pct_S_${g}_${size}`;
    }
    return isAllSizes ? `Pct_${g}_ALL` : `Pct_${g}_${size}`;
}

// --- MAP INIT ---

function initLeafletMap() {
    if (mapInitialised) return;

    const mapEl = document.getElementById('housing-live-map');
    if (!mapEl) return;

    const rect = mapEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(() => initLeafletMap());
        return;
    }

    mapInitialised = true;

    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    const initialCenter = isMobile
        ? [41.8240, -71.4000]
        : [41.8264, -71.4010];
    const initialZoom = isMobile ? 15.6 : 16;

    leafletMap = L.map('housing-live-map', {
        minZoom: 15,
        zoomControl: true,
        zoomSnap: 0,
        zoomDelta: 0.75,
        wheelPxPerZoomLevel: 10,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
    }).setView(initialCenter, initialZoom);

    // Closest simple Leaflet equivalent to ArcGIS gray-vector look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(leafletMap);

    fetchHousingData()
        .then(() => fetch('./dorms.geojson'))
        .then((r) => r.json())
        .then((geo) => {
            logDormsMissingFromGeoJSON(geo);

            dormLayer = L.geoJSON(geo, {
                style: styleDorm,
                onEachFeature: onEachDorm,
            }).addTo(leafletMap);

            updateMap(currentIndex);

            const slider = document.getElementById('housing-live-time-slider');
            slider?.addEventListener('input', function () {
                stopPlayback();
                updateMap(Number(this.value));
            });

            setTimeout(() => {
                leafletMap.invalidateSize();
            }, 50);
        })
        .catch((err) => {
            console.error('Error loading live housing map:', err);
        });

    refreshDormLabels();

    leafletMap.on('zoomend', () => {
        refreshDormLabels();
    });
}

const prevBtn = document.getElementById('housing-live-prev');
const nextBtn = document.getElementById('housing-live-next');

prevBtn?.addEventListener('click', () => {
    stopPlayback();
    updateMap(currentIndex - 1);
    const slider = document.getElementById('housing-live-time-slider');
    if (slider) slider.value = String(currentIndex);
});

nextBtn?.addEventListener('click', () => {
    stopPlayback();
    updateMap(currentIndex + 1);
    const slider = document.getElementById('housing-live-time-slider');
    if (slider) slider.value = String(currentIndex);
});

const playBtn = document.getElementById('housing-live-play');

function syncSliderToIndex() {
    const slider = document.getElementById('housing-live-time-slider');
    if (slider) slider.value = String(currentIndex);
}

function stopPlayback() {
    if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
    }
    isPlaying = false;
    if (playBtn) {
        playBtn.classList.remove('is-playing');
    }
}

function startPlayback() {
    if (!timestamps.length) return;

    isPlaying = true;
    if (playBtn) {
        playBtn.classList.add('is-playing');
    }

    playInterval = setInterval(() => {
        if (currentIndex >= timestamps.length - 1) {
            stopPlayback();
            return;
        }
        updateMap(currentIndex + 1);
        syncSliderToIndex();
    }, 900);
}

playBtn?.addEventListener('click', () => {
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
});

function fetchHousingData() {
    return fetch('./housing_output.json?t=' + Date.now())
        .then((r) => r.json())
        .then((data) => {
            housingData = data;
            timestamps = Object.keys(data).sort();

            const slider = document.getElementById('housing-live-time-slider');
            if (slider) {
                slider.max = String(Math.max(timestamps.length - 1, 0));
                currentIndex = timestamps.length - 1;
                slider.value = String(currentIndex);
                updateMap(currentIndex);
            }

            updateLegend();
            updateSliderDates();
        });
}

function updateSliderDates() {
    if (!timestamps.length) return;

    const startEl = document.getElementById('housing-live-start-date');
    const endEl = document.getElementById('housing-live-end-date');

    const fmt = new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });

    if (startEl) {
        const startDate = new Date(timestamps[0]);
        startDate.setFullYear(LIVE_DISPLAY_YEAR);
        startEl.textContent = fmt.format(startDate);
    }
    if (endEl) {
        const endDate = new Date(timestamps[timestamps.length - 1]);
        endDate.setFullYear(LIVE_DISPLAY_YEAR);
        endEl.textContent = fmt.format(endDate);
    }
}

// --- FILTERS ---

genderSelect?.addEventListener('change', (e) => {
    genderFilter = e.target.value;
    dormLayer?.setStyle(styleDorm);
    refreshDormLabels();
    refreshOpenDormPopup();
});

sizeSelect?.addEventListener('change', (e) => {
    sizeFilter = e.target.value;
    dormLayer?.setStyle(styleDorm);
    refreshDormLabels();
    refreshOpenDormPopup();
});

typeSelect?.addEventListener('change', (e) => {
    roomTypeFilter = e.target.value;
    dormLayer?.setStyle(styleDorm);
    refreshDormLabels();
    refreshOpenDormPopup();
    updateLegend();
});

metricSelect?.addEventListener('change', (e) => {
    metricFilter = e.target.value;
    dormLayer?.setStyle(styleDorm);
    refreshDormLabels();
    refreshOpenDormPopup();
    updateLegend();
});

refreshButton?.addEventListener('click', () => {
    if (!mapInitialised) return;
    fetchHousingData().then(() => {
        updateMap(currentIndex);
    });
    refreshDormLabels();
});

// --- COLOR HELPERS (aligned to 2025 map) ---

function getColorPercent(v) {
    if (isNaN(v) || v < 0) return '#c8c8c8';
    return v >= 0.9 ? '#1a9850'
        : v >= 0.8 ? '#66bd63'
            : v >= 0.7 ? '#a6d96a'
                : v >= 0.6 ? '#d9ef8b'
                    : v >= 0.5 ? '#fee08b'
                        : v >= 0.4 ? '#fdae61'
                            : v >= 0.3 ? '#fd8d3c'
                                : v >= 0.2 ? '#f46d43'
                                    : v >= 0.1 ? '#e85b3b'
                                        : '#d73027';
}

function getCountColorBreaks(maxT) {
    const palette = [
        '#d73027',
        '#f46d43',
        '#fdae61',
        '#fee08b',
        '#a6d96a',
        '#1a9850'
    ];

    if (!maxT || maxT < 1) maxT = 1;

    if (maxT <= 6) {
        const out = [];
        for (let i = 0; i <= maxT; i++) {
            out.push({
                min: i,
                max: i + 0.0001,
                label: String(i),
                color: palette[Math.min(i, palette.length - 1)],
            });
        }
        return out;
    }

    const out = [
        { min: 0, max: 0.0001, label: '0', color: palette[0] }
    ];

    const nBins = 5;
    const step = Math.ceil(maxT / nBins);

    for (let i = 0; i < nBins; i++) {
        const min = 1 + i * step;
        let max = 1 + (i + 1) * step - 1;
        if (i === nBins - 1) max = maxT;
        if (min > maxT) break;

        out.push({
            min,
            max: max + 0.0001,
            label: min === max ? `${min}` : `${min}–${max}`,
            color: palette[Math.min(i + 1, palette.length - 1)],
        });
    }

    return out;
}

function getMaxCountForSelection() {
    if (!housingData || !timestamps.length) return 1;

    const aFld = availField(genderFilter, sizeFilter, roomTypeFilter);
    const tFld = totalField(genderFilter, sizeFilter, roomTypeFilter);

    let maxT = 0;
    for (const timeKey of timestamps) {
        const snap = housingData[timeKey];
        for (const dormName in snap) {
            const row = snap[dormName];
            const t = Number(row?.[tFld] ?? 0);
            if (t > maxT) maxT = t;
        }
    }

    return maxT || 1;
}

function getColorCount(v) {
    if (isNaN(v) || v < 0) return '#c8c8c8';

    const breaks = getCountColorBreaks(getMaxCountForSelection());
    for (const br of breaks) {
        if (v >= br.min && v < br.max) return br.color;
    }
    return breaks[breaks.length - 1]?.color ?? '#1a9850';
}

// --- DATA LOOKUP ---

function getRoomCounts(dormName, timeKey) {
    const snap = housingData?.[timeKey]?.[dormName];
    if (!snap) return null;

    const aFld = availField(genderFilter, sizeFilter, roomTypeFilter);
    const tFld = totalField(genderFilter, sizeFilter, roomTypeFilter);
    const pFld = pctField(genderFilter, sizeFilter, roomTypeFilter);

    const availRaw = snap[aFld];
    const totalRaw = snap[tFld];
    const pctRaw = snap[pFld];

    const total = totalRaw == null ? 0 : Number(totalRaw);
    const avail = availRaw == null ? 0 : Number(availRaw);
    const pct = pctRaw == null ? null : Number(pctRaw);

    return { avail, total, pct };
}

function hasDormData(dormName, timeKey) {
    return Boolean(housingData?.[timeKey]?.[dormName]);
}

function getFeatureDormName(feature) {
    return (
        feature?.properties?.Property_Name ||
        feature?.properties?.Building_Name ||
        feature?.properties?.Building ||
        ''
    );
}

function logDormsMissingFromGeoJSON(geo) {
    if (!housingData || !geo?.features) return;

    const geoNames = new Set(
        geo.features.map((feature) => getFeatureDormName(feature)).filter(Boolean)
    );

    const outputNames = new Set();
    for (const timeKey of Object.keys(housingData)) {
        const snap = housingData[timeKey] || {};
        for (const dormName of Object.keys(snap)) {
            outputNames.add(dormName);
        }
    }

    const missing = Array.from(outputNames).filter((name) => !geoNames.has(name));
    if (missing.length) {
        console.warn('Dorms in housing_output.json missing from dorms.geojson:', missing);
    }
}

function getLabelText(feature) {
    const name = getFeatureDormName(feature);
    const counts = getRoomCounts(name, timestamps[currentIndex]);

    if (!counts || counts.total === 0) return '';

    if (metricFilter === 'pct') {
        const pctText = Math.round(Math.min(counts.pct ?? 0, 100));
        return `<span class="housing-live__label-name">${name}</span><span class="housing-live__label-value">${pctText}%</span>`;
    }

    return `<span class="housing-live__label-name">${name}</span><span class="housing-live__label-value">${counts.avail}</span>`;
}

function refreshDormLabels() {
    if (!dormLayer || !leafletMap) return;

    const showLabels = leafletMap.getZoom() >= labelZoomThreshold;

    dormLayer.eachLayer((layer) => {
        const feature = layer.feature;
        if (!feature) return;

        const labelText = getLabelText(feature);

        if (!showLabels || !labelText) {
            layer.unbindTooltip();
            return;
        }

        layer.bindTooltip(labelText, {
            permanent: true,
            direction: 'center',
            className: 'housing-live__label',
            opacity: 1,
        });
    });
}

// --- STYLING / POPUPS ---

function styleDorm(feature) {
    const hidden = {
        weight: 0,
        color: 'transparent',
        fillColor: 'transparent',
        fillOpacity: 0,
        opacity: 0,
    };

    const gray = {
        weight: 0.6,
        color: '#c8c8c8',
        fillColor: '#c8c8c8',
        fillOpacity: 1
    };

    if (!housingData || !timestamps.length) return gray;

    const dormName = getFeatureDormName(feature);
    if (!hasDormData(dormName, timestamps[currentIndex])) return hidden;

    const counts = getRoomCounts(dormName, timestamps[currentIndex]);

    if (!counts || counts.total === 0) return gray;

    const color = metricFilter === 'pct'
        ? getColorPercent((counts.pct ?? 0) / 100)
        : getColorCount(counts.avail);

    return {
        weight: 0.6,
        color: '#c8c8c8',
        fillColor: color,
        fillOpacity: 1
    };
}

function formatPopupHTML(name, counts) {
    if (!counts || counts.total === 0) {
        return `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; font-size:13px;">
          <div style="font-weight:700; font-size:14px; margin-bottom:6px;">${name}</div>
          <div style="color:#666;">No rooms of this type in this building.</div>
        </div>
      `;
    }

    const aTxt = counts.avail.toLocaleString();
    const tTxt = counts.total.toLocaleString();
    const pTxt = (Math.min(counts.pct ?? 0, 100)).toFixed(1) + '%';

    return `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif; font-size:13px;">
        <div style="font-weight:700; font-size:14px; margin-bottom:8px;">${name}</div>
        <table style="border-collapse:collapse; width:100%;">
          <tr>
            <td style="padding:2px 10px 2px 0; color:#666;">Available</td>
            <td style="padding:2px 0; font-weight:650;">${aTxt}</td>
          </tr>
          <tr>
            <td style="padding:2px 10px 2px 0; color:#666;">Total</td>
            <td style="padding:2px 0; font-weight:650;">${tTxt}</td>
          </tr>
          <tr>
            <td style="padding:2px 10px 2px 0; color:#666;">Percent available</td>
            <td style="padding:2px 0; font-weight:650;">${pTxt}</td>
          </tr>
        </table>
      </div>
    `;
}

function onEachDorm(feature, layer) {
    layer.on('click', () => {
        const name = getFeatureDormName(feature);
        if (!hasDormData(name, timestamps[currentIndex])) return;

        const counts = getRoomCounts(name, timestamps[currentIndex]);

        layer.bindPopup(formatPopupHTML(name, counts)).openPopup();
    });
}

function refreshOpenDormPopup() {
    if (!dormLayer) return;

    dormLayer.eachLayer((layer) => {
        if (!layer.isPopupOpen?.()) return;

        const name = getFeatureDormName(layer.feature);
        const counts = getRoomCounts(name, timestamps[currentIndex]);
        layer.setPopupContent(formatPopupHTML(name, counts));
    });
}

// --- MAP UPDATE ---

function updateMap(index) {
    if (!timestamps.length) return;

    currentIndex = Math.max(0, Math.min(index, timestamps.length - 1));
    const time = new Date(timestamps[currentIndex]);
    const displayTime = new Date(time);
    displayTime.setFullYear(LIVE_DISPLAY_YEAR);

    const label = document.getElementById('housing-live-time-label');
    if (label) {
        label.textContent = new Intl.DateTimeFormat(undefined, {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(displayTime);
    }

    dormLayer?.setStyle(styleDorm);
    refreshDormLabels();
    refreshOpenDormPopup();
}

// --- LEGEND ---

function updateLegend() {
    const el = document.getElementById('housing-live-legend');
    if (!el) return;

    if (metricFilter === 'pct') {
        el.innerHTML = "<b>Percent available</b><br>";

        const grades = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
        const labels = ["0–9%", "10–19%", "20–29%", "30–39%", "40–49%", "50–59%", "60–69%", "70–79%", "80–89%", "90–100%"];

        el.innerHTML +=
            '<div><i style="background:#c8c8c8"></i>No rooms</div>';

        for (let i = 0; i < grades.length; i++) {
            el.innerHTML +=
                `<div><i style="background:${getColorPercent(grades[i])}"></i>${labels[i]}</div>`;
        }
    } else {
        el.innerHTML = "<b>Rooms available</b><br>";

        const breaks = getCountColorBreaks(getMaxCountForSelection());

        el.innerHTML +=
            '<div><i style="background:#c8c8c8"></i>No rooms</div>';

        for (const br of breaks) {
            el.innerHTML +=
                `<div><i style="background:${br.color}"></i>${br.label}</div>`;
        }
    }
}

// --- PANEL VISIBILITY HANDLING ---

const yearButtons = document.querySelectorAll('.housing__toggle-btn');
yearButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        if (btn.dataset.year === '2026') {
            setTimeout(() => {
                if (checkCountdown()) {
                    initLeafletMap();
                    leafletMap?.invalidateSize();
                }
            }, 50);
        }
    });
});

/* GRAPH */
const dataUrl = './housingdataforwebsite.csv';
(function () {
    const svg = document.getElementById("housingChartSvg");
    const headlineEl = document.getElementById("housingChartHeadline");
    const subheadlineEl = document.getElementById("housingChartSubheadline");
    const tooltipEl = document.getElementById("housingChartTooltip");
    const plotWrapEl = svg?.parentElement;

    const genderEl = document.getElementById("housing-chart-filter-gender");
    const groupEl = document.getElementById("housing-chart-filter-group");
    const dayEl = document.getElementById("housing-chart-filter-day");
    const timeEl = document.getElementById("housing-chart-filter-time");

    if (!svg || svg.dataset.initialized === "true") return;
    svg.dataset.initialized = "true";

    const COLORS = {
        bg: "rgba(236,235,232,1)",
        grid: "rgba(40,40,40,0.12)",
        axis: "rgba(35,35,35,0.82)",
        text: "#202020",
        muted: "rgba(35,35,35,0.68)",
        headline: "#ff6238",
        rooms: "#4E3629",
        suites: "#be1b20",
        selectionLine: "rgba(35,35,35,0.92)",
        selectionLabelBg: "rgba(35,35,35,0.92)",
        selectionLabelText: "#ffffff"
    };

    const USE_HEADLINE_COLOR_SCALE = false;

    function getHeadlineColor(pct) {
        return USE_HEADLINE_COLOR_SCALE ? pctHeadlineColor(pct) : COLORS.text;
    }

    const DISPLAY_DAY_SHIFT = 0;

    const GENDER_LABELS = {
        ALL: "All",
        COED: "CoEd",
        COEDMALE: "CoEd + Male",
        COEDFEMALE: "CoEd + Female"
    };

    function getChartMargin() {
        if (isMobileChart()) {
            return {
                top: 38,
                right: 100,
                bottom: 172,
                left: 88
            };
        }

        return {
            top: 38,
            right: 84,
            bottom: 154,
            left: 88
        };
    }

    let parsedRows = [];
    let selectionIndex = 0;

    function isMobileChart() {
        return window.matchMedia("(max-width: 720px)").matches;
    }

    function chartFontSizes() {
        if (isMobileChart()) {
            return {
                yTick: 20,
                xTick: 18,
                axisLabel: 22,
                selectionLabel: 20
            };
        }

        return {
            yTick: 16,
            xTick: 14,
            axisLabel: 18,
            selectionLabel: 16
        };
    }

    function safeNumber(value) {
        if (value == null || value === "") return 0;
        const n = Number(String(value).replace(/,/g, "").trim());
        return Number.isFinite(n) ? n : 0;
    }

    function normalizePct(value) {
        let n = safeNumber(value);
        if (n <= 1 && n >= 0) n = n * 100;
        return n;
    }

    function parseDateLoose(value) {
        if (!value) return null;

        if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

        if (typeof value === "number") {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const d = new Date(excelEpoch.getTime() + value * 86400000);
            if (!Number.isNaN(d.getTime())) return d;
        }

        const raw = String(value).trim();
        if (!raw) return null;

        let d = new Date(raw);
        if (!Number.isNaN(d.getTime())) return d;

        d = new Date(raw.replace(" ", "T"));
        if (!Number.isNaN(d.getTime())) return d;

        return null;
    }

    function shiftDateForDisplay(date, dayShift = 0) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
        const d = new Date(date);
        d.setDate(d.getDate() + dayShift);
        return d;
    }

    function fmtDateLabel(date) {
        const shifted = shiftDateForDisplay(date, DISPLAY_DAY_SHIFT);
        if (!(shifted instanceof Date) || Number.isNaN(shifted.getTime())) return "";
        return new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }).format(shifted);
    }

    function fmtSelectionLabel(date) {
        const shifted = shiftDateForDisplay(date, DISPLAY_DAY_SHIFT);
        return "Time  "
        /*
              if (!(shifted instanceof Date) || Number.isNaN(shifted.getTime())) return "Selection Time";
              return `Selection Time: ${new Intl.DateTimeFormat(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
              }).format(shifted)}`;
        */
    }

    function fmtDayValue(date) {
        const shifted = shiftDateForDisplay(date, DISPLAY_DAY_SHIFT);
        return [
            shifted.getFullYear(),
            String(shifted.getMonth() + 1).padStart(2, "0"),
            String(shifted.getDate()).padStart(2, "0")
        ].join("-");
    }

    function fmtDayLabel(date) {
        const shifted = shiftDateForDisplay(date, DISPLAY_DAY_SHIFT);
        const weekday = new Intl.DateTimeFormat(undefined, {
            weekday: "short"
        }).format(shifted);

        const monthDay = new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric"
        }).format(shifted);

        return `${weekday}, ${monthDay}`;
    }

    function fmtTimeValue(date) {
        return date.toISOString();
    }

    function fmtTimeLabel(date) {
        return new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    }

    function csvToObjects(text) {
        const rows = [];
        let headers = null;
        let current = "";
        let record = [];
        let inQuotes = false;

        function pushCell() {
            record.push(current);
            current = "";
        }

        function pushRecord() {
            if (!headers) {
                headers = record.map((x) => String(x).trim());
            } else {
                const obj = {};
                headers.forEach((h, i) => {
                    obj[h] = record[i] ?? "";
                });
                const hasAnyValue = Object.values(obj).some((v) => String(v).trim() !== "");
                if (hasAnyValue) rows.push(obj);
            }
            record = [];
        }

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const next = text[i + 1];

            if (ch === '"') {
                if (inQuotes && next === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === "," && !inQuotes) {
                pushCell();
            } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
                if (ch === "\r" && next === "\n") i += 1;
                pushCell();
                pushRecord();
            } else {
                current += ch;
            }
        }

        if (current.length > 0 || record.length > 0) {
            pushCell();
            pushRecord();
        }

        return rows;
    }

    function roomAvailField(gender, group) {
        return `Avail_${gender}_${group}`;
    }

    function roomPctField(gender, group) {
        return `Pct_${gender}_${group}`;
    }

    function suiteAvailField(gender, group) {
        return `Avail_S_${gender}_${group}`;
    }

    function roomTotalField(gender, group) {
        return `Total_${gender}_${group}`;
    }

    function suiteTotalField(gender, group) {
        return `Total_S_${gender}_${group}`;
    }

    function hydrateRows(rows) {
        return rows
            .map((row, index) => {
                const snapshotRaw = row.Snapshot_Time ?? row.snapshot_time ?? row.snapshot ?? "";
                const snapshotDate = parseDateLoose(snapshotRaw);

                return {
                    ...row,
                    __index: index,
                    __snapshotRaw: snapshotRaw,
                    __snapshotDate: snapshotDate,
                    __dayKey: snapshotDate ? fmtDayValue(snapshotDate) : ""
                };
            })
            .filter((row) => row.__snapshotRaw !== "")
            .sort((a, b) => {
                const ta = a.__snapshotDate ? a.__snapshotDate.getTime() : a.__index;
                const tb = b.__snapshotDate ? b.__snapshotDate.getTime() : b.__index;
                return ta - tb;
            });
    }

    function sameSeriesValues(a, b) {
        const keys = Object.keys(a).filter((k) =>
            /^(Avail_|Total_|Pct_)/.test(k)
        );

        return keys.every((k) => String(a[k] ?? "") === String(b[k] ?? ""));
    }

    function coerceToSelectionWindow(rows) {
        const cleaned = rows
            .filter((row) => row.__snapshotDate)
            .map((row) => {
                const d = new Date(row.__snapshotDate);
                return {
                    ...row,
                    __snapshotDate: d,
                    __snapshotRaw: d.toISOString(),
                    __dayKey: fmtDayValue(d)
                };
            });

        cleaned.sort((a, b) => a.__snapshotDate - b.__snapshotDate);

        // drop consecutive duplicates after coercion / after-hours carryover
        const deduped = [];
        for (const row of cleaned) {
            const prev = deduped[deduped.length - 1];
            if (
                prev &&
                prev.__snapshotDate.getTime() === row.__snapshotDate.getTime() &&
                sameSeriesValues(prev, row)
            ) {
                continue;
            }

            deduped.push(row);
        }

        return deduped;
    }

    function getGenderValue() {
        const v = genderEl?.value || "ALL";
        return ["ALL", "COED", "COEDMALE", "COEDFEMALE"].includes(v) ? v : "ALL";
    }

    function getGroupValue() {
        const v = String(groupEl?.value || "1").trim();
        return ["1", "2", "3", "4", "5", "9"].includes(v) ? v : "1";
    }

    function getSelectedDay() {
        return String(dayEl?.value || "").trim();
    }

    function getSelectedTime() {
        return String(timeEl?.value || "").trim();
    }

    function populateDayOptions() {
        if (!dayEl) return;

        const seen = new Map();
        parsedRows.forEach((row) => {
            if (!row.__snapshotDate || !row.__dayKey) return;
            if (!seen.has(row.__dayKey)) {
                seen.set(row.__dayKey, fmtDayLabel(row.__snapshotDate));
            }
        });

        const current = dayEl.value;
        dayEl.innerHTML = "";

        for (const [value, label] of seen.entries()) {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = label;
            dayEl.appendChild(opt);
        }

        if (current && seen.has(current)) {
            dayEl.value = current;
        } else if (dayEl.options.length > 0) {
            dayEl.selectedIndex = 0;
        }
    }

    function populateTimeOptions() {
        if (!timeEl) return;

        const selectedDay = getSelectedDay();
        const current = timeEl.value;

        const rowsForDay = parsedRows.filter((row) => row.__dayKey === selectedDay);

        timeEl.innerHTML = "";

        rowsForDay.forEach((row) => {
            const opt = document.createElement("option");
            opt.value = row.__snapshotRaw;
            opt.textContent = row.__snapshotDate ? fmtTimeLabel(row.__snapshotDate) : row.__snapshotRaw;
            timeEl.appendChild(opt);
        });

        if (current && rowsForDay.some((row) => row.__snapshotRaw === current)) {
            timeEl.value = current;
        } else if (timeEl.options.length > 0) {
            timeEl.selectedIndex = 0;
        }
    }

    function findSelectionIndex() {
        if (!parsedRows.length) return 0;

        const selectedTime = getSelectedTime();
        if (selectedTime) {
            const exactIdx = parsedRows.findIndex((row) => String(row.__snapshotRaw).trim() === selectedTime);
            if (exactIdx >= 0) return exactIdx;

            const requestedDate = parseDateLoose(selectedTime);
            if (requestedDate) {
                const requestedMs = requestedDate.getTime();
                let bestIdx = 0;
                let bestDiff = Infinity;

                parsedRows.forEach((row, idx) => {
                    const d = row.__snapshotDate;
                    if (!d) return;
                    const diff = Math.abs(d.getTime() - requestedMs);
                    if (diff < bestDiff) {
                        bestDiff = diff;
                        bestIdx = idx;
                    }
                });

                return bestIdx;
            }
        }

        const selectedDay = getSelectedDay();
        if (selectedDay) {
            const firstForDay = parsedRows.findIndex((row) => row.__dayKey === selectedDay);
            if (firstForDay >= 0) return firstForDay;
        }

        return 0;
    }

    function clearSvg(el) {
        while (el.firstChild) el.removeChild(el.firstChild);
    }

    function makeSvgEl(tag, attrs = {}) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        Object.entries(attrs).forEach(([k, v]) => {
            el.setAttribute(k, String(v));
        });
        return el;
    }

    function linePath(points) {
        if (!points.length) return "";
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        return d;
    }

    function pctHeadlineColor(pct) {
        if (!Number.isFinite(pct)) return "#666666";
        if (pct >= 90) return "#1a9850";
        if (pct >= 75) return "#66bd63";
        if (pct >= 60) return "#a6d96a";
        if (pct >= 45) return "#fdae61";
        if (pct >= 25) return "#f46d43";
        if (pct >= 10) return "#e85b3b";
        return "#d73027";
    }

    function showTooltip(evt, point) {
        if (!tooltipEl || !plotWrapEl || !point) return;

        tooltipEl.innerHTML = `
        <div class="housing-chart-tooltip__time">${point.label}</div>
        <div>Rooms: <strong>${point.rooms}</strong></div>
        <div>Suites: <strong>${point.suites}</strong></div>
      `;

        tooltipEl.hidden = false;

        const wrapRect = plotWrapEl.getBoundingClientRect();
        const mouseX = evt.clientX - wrapRect.left;
        const mouseY = evt.clientY - wrapRect.top;

        tooltipEl.style.left = `${mouseX + 12}px`;
        tooltipEl.style.top = `${mouseY - 12}px`;
    }

    function moveTooltip(evt) {
        if (!tooltipEl || tooltipEl.hidden || !plotWrapEl) return;

        const wrapRect = plotWrapEl.getBoundingClientRect();
        const mouseX = evt.clientX - wrapRect.left;
        const mouseY = evt.clientY - wrapRect.top;

        tooltipEl.style.left = `${mouseX + 12}px`;
        tooltipEl.style.top = `${mouseY - 12}px`;
    }

    function hideTooltip() {
        if (!tooltipEl) return;
        tooltipEl.hidden = true;
    }

    function render() {
        if (!parsedRows.length) {
            clearSvg(svg);
            headlineEl.textContent = "--.-% Available";
            headlineEl.style.color = getHeadlineColor(NaN);
            subheadlineEl.textContent = "No data loaded";
            return;
        }

        const gender = getGenderValue();
        const group = getGroupValue();
        const FONTS = chartFontSizes();
        const CHART_MARGIN = getChartMargin();

        selectionIndex = findSelectionIndex();
        if (selectionIndex < 0) selectionIndex = 0;
        if (selectionIndex >= parsedRows.length) selectionIndex = parsedRows.length - 1;

        const roomAvailCol = roomAvailField(gender, group);
        const roomPctCol = roomPctField(gender, group);
        const suiteAvailCol = suiteAvailField(gender, group);
        const roomTotalCol = roomTotalField(gender, group);
        const suiteTotalCol = suiteTotalField(gender, group);

        const series = parsedRows.map((row, idx) => {
            const rooms = safeNumber(row[roomAvailCol]);
            const suites = safeNumber(row[suiteAvailCol]);
            const pct = normalizePct(row[roomPctCol]);
            const roomTotal = safeNumber(row[roomTotalCol]);
            const suiteTotal = safeNumber(row[suiteTotalCol]);

            return {
                idx,
                date: row.__snapshotDate,
                label: row.__snapshotDate ? fmtDateLabel(row.__snapshotDate) : String(row.__snapshotRaw),
                rooms,
                suites,
                pct,
                roomTotal,
                suiteTotal
            };
        });

        const selectedPoint = series[selectionIndex] || series[0];
        const pctText = Number.isFinite(selectedPoint.pct) ? `${selectedPoint.pct.toFixed(1)}% Available` : "--.-% Available";

        headlineEl.textContent = pctText;
        headlineEl.style.color = getHeadlineColor(selectedPoint.pct);
        subheadlineEl.textContent = `${GENDER_LABELS[gender] || gender} · Group ${group} · ${selectedPoint.label}`;

        clearSvg(svg);

        const viewBox = svg.viewBox.baseVal;
        const width = viewBox && viewBox.width ? viewBox.width : 1200;
        const height = viewBox && viewBox.height ? viewBox.height : 620;

        const plotLeft = CHART_MARGIN.left;
        const plotRight = width - CHART_MARGIN.right;
        const plotTop = CHART_MARGIN.top;
        const plotBottom = height - CHART_MARGIN.bottom;
        const plotWidth = plotRight - plotLeft;
        const plotHeight = plotBottom - plotTop;

        const yMaxData = Math.max(
            1,
            ...series.map((d) => d.rooms),
            ...series.map((d) => d.suites)
        );

        const yMax = yMaxData <= 6
            ? Math.max(1, Math.ceil(yMaxData))
            : Math.ceil(yMaxData / 5) * 5;

        const yTicks = yMax <= 6 ? yMax : 6;

        function xScale(i) {
            if (series.length <= 1) return plotLeft + plotWidth / 2;
            return plotLeft + (i / (series.length - 1)) * plotWidth;
        }

        function yScale(v) {
            return plotBottom - (v / yMax) * plotHeight;
        }

        const root = makeSvgEl("g");
        svg.appendChild(root);

        root.appendChild(
            makeSvgEl("rect", {
                x: 0,
                y: 0,
                width,
                height,
                fill: COLORS.bg,
                rx: 16,
                ry: 16
            })
        );

        for (let i = 0; i <= yTicks; i++) {
            const tickValue = (yMax / yTicks) * i;
            const y = yScale(tickValue);

            root.appendChild(
                makeSvgEl("line", {
                    x1: plotLeft,
                    y1: y,
                    x2: plotRight,
                    y2: y,
                    stroke: COLORS.grid,
                    "stroke-width": 1
                })
            );

            const tickText = makeSvgEl("text", {
                x: plotLeft - 14,
                y: y + 5,
                fill: COLORS.axis,
                "font-size": FONTS.yTick,
                "font-family": "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                "text-anchor": "end"
            });
            tickText.textContent = String(Math.round(tickValue));
            root.appendChild(tickText);
        }

        series.forEach((d, i) => {
            const x = xScale(i);

            root.appendChild(
                makeSvgEl("line", {
                    x1: x,
                    y1: plotTop,
                    x2: x,
                    y2: plotBottom,
                    stroke: COLORS.grid,
                    "stroke-width": 1
                })
            );

            const tickText = makeSvgEl("text", {
                x,
                y: plotBottom + 32,
                fill: COLORS.axis,
                "font-size": FONTS.xTick,
                "font-family": "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                transform: `rotate(45 ${x} ${plotBottom + 32})`,
                "text-anchor": "start"
            });
            tickText.textContent = d.label;
            root.appendChild(tickText);
        });

        const yAxisLabel = makeSvgEl("text", {
            x: 28,
            y: plotTop + plotHeight / 2,
            fill: COLORS.axis,
            "font-size": FONTS.axisLabel,
            "font-family": "freight-text-pro, Georgia, Times, serif",
            transform: `rotate(-90 28 ${plotTop + plotHeight / 2})`,
            "text-anchor": "middle"
        });
        yAxisLabel.textContent = "Available Rooms";
        root.appendChild(yAxisLabel);

        const xAxisLabel = makeSvgEl("text", {
            x: plotLeft + plotWidth / 2,
            y: height - 18,
            fill: COLORS.axis,
            "font-size": FONTS.axisLabel,
            "font-family": "freight-text-pro, Georgia, Times, serif",
            "text-anchor": "middle"
        });
        xAxisLabel.textContent = "Time (2025)";
        root.appendChild(xAxisLabel);

        const roomPoints = series.map((d, i) => ({ x: xScale(i), y: yScale(d.rooms) }));
        const suitePoints = series.map((d, i) => ({ x: xScale(i), y: yScale(d.suites) }));

        root.appendChild(
            makeSvgEl("path", {
                d: linePath(roomPoints),
                fill: "none",
                stroke: COLORS.rooms,
                "stroke-width": 5,
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
            })
        );

        root.appendChild(
            makeSvgEl("path", {
                d: linePath(suitePoints),
                fill: "none",
                stroke: COLORS.suites,
                "stroke-width": 5,
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
            })
        );

        roomPoints.forEach((pt) => {
            root.appendChild(
                makeSvgEl("circle", {
                    cx: pt.x,
                    cy: pt.y,
                    r: 5.5,
                    fill: COLORS.rooms
                })
            );
        });

        suitePoints.forEach((pt) => {
            root.appendChild(
                makeSvgEl("circle", {
                    cx: pt.x,
                    cy: pt.y,
                    r: 5.5,
                    fill: COLORS.suites
                })
            );
        });

        series.forEach((d, i) => {
            const ys = [yScale(d.rooms), yScale(d.suites)];
            const uniqueYs = [...new Set(ys.map((v) => Math.round(v * 10) / 10))];

            uniqueYs.forEach((cy) => {
                const hoverTarget = makeSvgEl("circle", {
                    cx: xScale(i),
                    cy,
                    r: 18,
                    fill: "transparent",
                    style: "cursor: pointer;"
                });

                hoverTarget.addEventListener("mouseenter", (evt) => showTooltip(evt, d));
                hoverTarget.addEventListener("mousemove", moveTooltip);
                hoverTarget.addEventListener("mouseleave", hideTooltip);

                root.appendChild(hoverTarget);
            });
        });

        const selectionX = xScale(selectionIndex);
        root.appendChild(
            makeSvgEl("line", {
                x1: selectionX,
                y1: plotTop,
                x2: selectionX,
                y2: plotBottom,
                stroke: COLORS.selectionLine,
                "stroke-width": 3
            })
        );

        const selectionLabel = fmtSelectionLabel(selectedPoint.date);
        const labelWidth = isMobileChart()
            ? Math.min(340, 20 + selectionLabel.length * 10)
            : Math.min(280, 16 + selectionLabel.length * 8.35);
        const labelX = Math.min(Math.max(plotLeft, selectionX - labelWidth / 2), plotRight - labelWidth);
        const labelY = plotTop - 36;

        root.appendChild(
            makeSvgEl("rect", {
                x: labelX,
                y: labelY,
                width: labelWidth,
                height: isMobileChart() ? 40 : 34,
                rx: 10,
                ry: 10,
                fill: COLORS.selectionLabelBg
            })
        );

        const selectionText = makeSvgEl("text", {
            x: labelX + 12,
            y: labelY + (isMobileChart() ? 25 : 22),
            fill: COLORS.selectionLabelText,
            "font-size": FONTS.selectionLabel,
            "font-family": "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            "font-weight": "700"
        });
        selectionText.textContent = selectionLabel;
        root.appendChild(selectionText);

        series.forEach((d, i) => {
            const hoverTarget = makeSvgEl("circle", {
                cx: xScale(i),
                cy: Math.min(yScale(d.rooms), yScale(d.suites)),
                r: 18,
                fill: "transparent",
                style: "cursor: pointer;"
            });

            hoverTarget.addEventListener("mouseenter", (evt) => showTooltip(evt, d));
            hoverTarget.addEventListener("mousemove", moveTooltip);
            hoverTarget.addEventListener("mouseleave", hideTooltip);

            root.appendChild(hoverTarget);
        });
    }

    async function loadData() {
        const res = await fetch(dataUrl, { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`Failed to fetch chart data: ${res.status} ${res.statusText}`);
        }

        const text = await res.text();
        const rawRows = csvToObjects(text);
        parsedRows = coerceToSelectionWindow(hydrateRows(rawRows));

        populateDayOptions();
        populateTimeOptions();
        render();
    }

    function bindControls() {
        genderEl?.addEventListener("change", render);
        groupEl?.addEventListener("change", render);

        dayEl?.addEventListener("change", () => {
            populateTimeOptions();
            render();
        });

        timeEl?.addEventListener("change", render);

        window.addEventListener("housing-chart-resize", render);
        window.addEventListener("resize", render);
    }

    bindControls();
    loadData().catch((err) => {
        console.error("Housing chart init error:", err);
        headlineEl.textContent = "--.-% Available";
        subheadlineEl.textContent = "Unable to load chart data";
        clearSvg(svg);
    });
})();

/* LOTTERY MAP */
(function () {
    function startMap() {
        if (!window.require) {
            console.error("ArcGIS require() not available yet.");
            return;
        }

        window.require(
            [
                "esri/Map",
                "esri/views/MapView",
                "esri/layers/FeatureLayer",
                "esri/widgets/TimeSlider",
                "esri/widgets/Expand",
                "esri/renderers/ClassBreaksRenderer",
                "esri/symbols/SimpleFillSymbol"
            ],
            function (
                Map,
                MapView,
                FeatureLayer,
                TimeSlider,
                Expand,
                ClassBreaksRenderer,
                SimpleFillSymbol
            ) {
                const containerId = "housingLotteryMapView";
                const viewDiv = document.getElementById(containerId);
                if (!viewDiv) return;

                // Prevent double-init if Astro re-renders for any reason
                if (viewDiv.dataset.initialized === "true") return;
                viewDiv.dataset.initialized = "true";

                // ---- YOUR LAYER (sublayer 0) ----
                const layerUrl =
                    "https://services.arcgis.com/8veDRDlhXWywYP3S/arcgis/rest/services/Updated_map_w_suites/FeatureServer/0";

                const timesLayer = new FeatureLayer({
                    url: layerUrl,
                    outFields: ["Snapshot_Time"]
                });

                // ---- Dropdown options ----
                const GENDER_GROUPS = ["ALL", "COED", "COEDMALE", "COEDFEMALE"];
                const SIZE_OPTIONS = [
                    { value: "ALL", label: "All sizes" },
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                    { value: "4", label: "4" },
                    { value: "5", label: "5" }
                ];

                const METRICS = [
                    { value: "pct", label: "Percent available" },
                    { value: "count", label: "Rooms available (count)" }
                ];

                const GENDER_LABELS = {
                    ALL: "All",
                    COEDMALE: "CoEd + Male",
                    COEDFEMALE: "CoEd + Female",
                    COED: "CoEd"
                };

                function parseSizeChoice(choice) {
                    // choice examples: "ALL", "1", "2", "3", "4", "5"
                    if (choice === "ALL") return { size: "ALL", isAllSizes: true };
                    return { size: String(choice), isAllSizes: false };
                }

                function availField(g, sizeChoice, typeChoice) {
                    // typeChoice examples: "ALL", "SUITE"
                    const { size, isAllSizes } = parseSizeChoice(sizeChoice);

                    if (typeChoice === "SUITE") {
                        return isAllSizes ? `Avail_S_${g}_ALL` : `Avail_S_${g}_${size}`;
                    }
                    // ALL types
                    return isAllSizes ? `Avail_${g}_ALL` : `Avail_${g}_${size}`;
                }

                function totalField(g, sizeChoice, typeChoice) {
                    const { size, isAllSizes } = parseSizeChoice(sizeChoice);

                    if (typeChoice === "SUITE") {
                        return isAllSizes ? `Total_S_${g}_ALL` : `Total_S_${g}_${size}`;
                    }
                    return isAllSizes ? `Total_${g}_ALL` : `Total_${g}_${size}`;
                }

                function pctField(g, sizeChoice, typeChoice) {
                    const { size, isAllSizes } = parseSizeChoice(sizeChoice);

                    if (typeChoice === "SUITE") {
                        return isAllSizes ? `Pct_S_${g}_ALL` : `Pct_S_${g}_${size}`;
                    }
                    return isAllSizes ? `Pct_${g}_ALL` : `Pct_${g}_${size}`;
                }

                const layer = new FeatureLayer({
                    url: layerUrl,
                    outFields: ["*"],
                    popupEnabled: false,
                    labelingInfo: [],
                    labelsVisible: true
                });

                const map = new Map({
                    basemap: "gray-vector",
                    layers: [layer]
                });

                const isMobile = window.matchMedia("(max-width: 600px)").matches;

                const initialCenter = isMobile
                    ? [-71.4000, 41.8240] // Mobile
                    : [-71.4010, 41.8264]; // Desktop

                const initialZoom = isMobile ? 14.7 : 15;

                const view = new MapView({
                    container: containerId,
                    map,
                    center: initialCenter,
                    zoom: initialZoom,
                    constraints: { minZoom: 14, snapToZoom: false }
                });

                const tz = "America/New_York";
                const fmt = new Intl.DateTimeFormat(undefined, {
                    timeZone: tz,
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                });

                view.popup.autoOpenEnabled = false;

                function makeLabelingInfo(g, s, t, metric) {
                    const aFld = availField(g, s, t);
                    const tFld = totalField(g, s, t);
                    const pFld = pctField(g, s, t);

                    const expr = metric === "pct"
                        ? `
                var name = DefaultValue($feature.Building_Name, DefaultValue($feature.Building, ""));
                var t = $feature.${tFld};
                var p = $feature.${pFld};
                if (t == null || t == 0) { return ""; }
                if (p == null) { p = 0; }
                if (p <= 1) { p = p * 100; }
                return name + TextFormatting.NewLine + Round(p, 0) + "%";
              `
                        : `
                var name = DefaultValue($feature.Building_Name, DefaultValue($feature.Building, ""));
                var t = $feature.${tFld};
                var a = $feature.${aFld};
                if (t == null || t == 0) { return ""; }
                if (a == null) { a = 0; }
                return name + TextFormatting.NewLine + a;
              `;

                    return [
                        {
                            labelExpressionInfo: { expression: expr },
                            symbol: {
                                type: "text",
                                color: [30, 30, 30, 1],
                                haloColor: [255, 255, 255, 0.95],
                                haloSize: 1.5,
                                font: {
                                    family: "sans-serif",
                                    size: 10,
                                    weight: "bold"
                                }
                            },
                            labelPlacement: "always-horizontal",
                            minScale: 4000
                        }
                    ];
                }

                // ---- UI PANEL ----
                // ---- EXTERNAL CONTROLS (from parent Astro page) ----
                const genderSel = document.getElementById("housing-filter-gender");
                const sizeSel = document.getElementById("housing-filter-size");
                const typeSel = document.getElementById("housing-filter-type");
                const metricSel = document.getElementById("housing-filter-metric");
                const refreshBtn = document.getElementById("housing-filter-refresh");
                const countLabelExternal = document.getElementById("housing-filter-count");

                if (!(genderSel && sizeSel && metricSel)) {
                    console.warn("Housing map external controls not found.");
                }

                view.on("click", async (event) => {
                    try {
                        const hit = await view.hitTest(event, { include: [layer] });
                        const graphic = hit.results?.[0]?.graphic;
                        if (!graphic) return;

                        const g = genderSel?.value || "ALL";
                        const s = sizeSel?.value || "ALL";
                        const type = typeSel?.value || "ALL";


                        view.popup.close();
                        view.popup.open({
                            location: event.mapPoint,
                            title: "",
                            content: formatPopupHTML(graphic.attributes, g, s, type)
                        });
                    } catch (e) {
                        console.error("click popup error:", e);
                    }
                });

                // Legend stays inside the map
                const legendDiv = document.createElement("div");
                legendDiv.className = "legend-bar";

                const legendExpand = new Expand({ view, content: legendDiv, expanded: true });
                if (!isMobile) {
                    view.ui.add(legendExpand, "bottom-right");
                }

                // tag the legend expand container so we can hide it on mobile
                legendExpand.watch("container", (c) => {
                    if (c) c.classList.add("legend-expand");
                });

                const timeWrap = document.createElement("div");
                timeWrap.className = "time-wrap";

                const timeLabel = document.createElement("div");
                timeLabel.className = "time-label";
                timeLabel.textContent = "Time: —";

                const sliderDiv = document.createElement("div");
                timeWrap.appendChild(timeLabel);
                timeWrap.appendChild(sliderDiv);
                view.ui.add(timeWrap, "bottom-left");

                // Re-apply width after ArcGIS lays out internals
                function getSliderWidth() {
                    return window.matchMedia("(max-width: 600px)").matches ? "380px" : "320px";
                }

                requestAnimationFrame(() => {
                    const sliderWidth = getSliderWidth();

                    sliderDiv.style.width = sliderWidth;
                    sliderDiv.style.maxWidth = sliderWidth;
                    sliderDiv.style.minWidth = "0";

                    const inner = sliderDiv.querySelector(".esri-time-slider, .esri-slider");
                    if (inner) {
                        inner.style.width = sliderWidth;
                        inner.style.maxWidth = sliderWidth;
                        inner.style.minWidth = "0";
                    }
                });

                const timeSlider = new TimeSlider({
                    view,
                    mode: "instant",
                    layout: "compact",
                    container: sliderDiv
                });

                const sliderWidth = window.matchMedia("(max-width: 600px)").matches ? "380px" : "320px";
                sliderDiv.style.width = sliderWidth;
                sliderDiv.style.maxWidth = sliderWidth;
                sliderDiv.style.minWidth = "0";

                // --- TimeSlider cleanup: remove the ruler/tick row DOM so its height collapses ---
                function pruneTimeSliderChrome() {
                    // ArcGIS injects markup inside sliderDiv
                    const root =
                        sliderDiv.querySelector(".esri-time-slider") ||
                        sliderDiv.querySelector(".esri-slider") ||
                        sliderDiv;

                    // Remove known tick/ruler containers (these are what reserve the empty band)
                    const selectors = [
                        ".esri-time-slider__ruler",
                        ".esri-time-slider__tickmark-container",
                        ".esri-time-slider__tick-label-container",
                        ".esri-time-slider__ticks",
                        ".esri-time-slider__tickmarks",
                        ".esri-time-slider__tick-labels",
                        ".esri-slider__ruler",
                        ".esri-slider__tick-container",
                        ".esri-slider__tick-bar",
                        ".esri-slider__tick-bar-container",
                        ".esri-slider__tick-label-container",
                        ".esri-slider__tick-labels",
                        ".esri-slider__ticks",
                        ".esri-slider__tickmarks"
                    ];

                    root.querySelectorAll(selectors.join(",")).forEach((el) => el.remove());

                    // Also remove any leftover spacing on the slider layout container
                    const layout = root.querySelector(".esri-time-slider__layout-container") || root;
                    layout.style.rowGap = "0";
                    layout.style.gap = "0";
                    layout.style.margin = "0";
                    layout.style.padding = "0";
                }

                // Run once after initial render
                requestAnimationFrame(() => pruneTimeSliderChrome());

                // Keep pruning if ArcGIS re-renders internal DOM
                const tsObserver = new MutationObserver(() => pruneTimeSliderChrome());
                tsObserver.observe(sliderDiv, { childList: true, subtree: true });

                async function fetchUniqueTimes() {
                    const q = timesLayer.createQuery();
                    q.where = "Snapshot_Time IS NOT NULL";
                    q.groupByFieldsForStatistics = ["Snapshot_Time"];
                    q.outStatistics = [
                        {
                            statisticType: "count",
                            onStatisticField: timesLayer.objectIdField,
                            outStatisticFieldName: "ct"
                        }
                    ];
                    q.orderByFields = ["Snapshot_Time ASC"];
                    q.returnGeometry = false;
                    q.timeExtent = null;

                    const res = await timesLayer.queryFeatures(q);

                    const dates = [];
                    for (const f of res.features) {
                        const v = f.attributes.Snapshot_Time;
                        if (!v) continue;
                        dates.push(new Date(v));
                    }
                    dates.sort((a, b) => a - b);
                    return dates;
                }

                async function prewarmCache(dates) {
                    for (const date of dates) {
                        const q = layer.createQuery();
                        q.timeExtent = { start: date, end: date };
                        q.returnGeometry = true;
                        q.outFields = ["*"];
                        layer.queryFeatures(q).catch(() => { });
                        // small delay so we don't hammer the server
                        await new Promise(res => setTimeout(res, 300));
                    }
                }

                function setSliderStops(dates) {
                    if (!dates || dates.length === 0) return;

                    timeSlider.fullTimeExtent = { start: dates[0], end: dates[dates.length - 1] };
                    timeSlider.stops = { dates };
                    timeSlider.timeExtent = { start: dates[0], end: dates[0] };
                    view.timeExtent = timeSlider.timeExtent;

                    if (countLabelExternal) countLabelExternal.textContent = `(${dates.length})`;
                }

                function fillSymbol(colorArr) {
                    return new SimpleFillSymbol({
                        color: colorArr,
                        outline: { color: [200, 200, 200, 1], width: 0.6 }
                    });
                }

                function colorToCss(c) {
                    if (!c) return "rgb(200,200,200)";
                    if (Array.isArray(c)) {
                        const [r, g, b, a] = c;
                        return a == null ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
                    }
                    if (typeof c === "object" && c !== null) {
                        const r = c.r ?? 200;
                        const g = c.g ?? 200;
                        const b = c.b ?? 200;
                        const a = c.a;
                        return a == null ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
                    }
                    return "rgb(200,200,200)";
                }

                function renderClassLegend(title, renderer, noteText = "") {
                    if (!renderer || !renderer.classBreakInfos) {
                        legendDiv.innerHTML = `
                <div class="legend-title">${title}</div>
                <div class="legend-note">Legend unavailable.</div>
              `;
                        return;
                    }

                    const rows = [];

                    if (renderer.defaultSymbol) {
                        rows.push({
                            label: renderer.defaultLabel || "Other / no data",
                            color: renderer.defaultSymbol.color
                        });
                    }

                    for (const br of renderer.classBreakInfos) {
                        const symColor = br.symbol?.color || [200, 200, 200, 1];
                        rows.push({
                            label: br.label || `${br.minValue}–${br.maxValue}`,
                            color: symColor
                        });
                    }

                    legendDiv.innerHTML = `
              <div class="legend-title">${title}</div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${rows
                            .map(
                                (r) => `
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div style="
                        width:14px;
                        height:14px;
                        border-radius:4px;
                        border:1px solid #ddd;
                        background:${colorToCss(r.color)};
                        flex:0 0 14px;
                      "></div>
                      <div style="font-size:12px; color:#333;">${r.label}</div>
                    </div>
                  `
                            )
                            .join("")}
              </div>
              ${noteText ? `<div class="legend-note" style="margin-top:8px;">${noteText}</div>` : ""}
            `;
                }

                function makePctRendererClasses(pctFld, totalFld) {
                    const expr = `
              var p = $feature.${pctFld};
              var t = $feature.${totalFld};
              if (t == null || t == 0 || p == null) { return Null; }
              if (p <= 1) { p = p * 100; }
              return p;
            `;

                    return new ClassBreaksRenderer({
                        valueExpression: expr,
                        valueExpressionTitle: "Percent available",
                        defaultSymbol: fillSymbol([200, 200, 200, 1]),
                        defaultLabel: "No rooms",
                        classBreakInfos: [
                            { minValue: 0, maxValue: 9.9999, symbol: fillSymbol([215, 48, 39, 1]), label: "0–9%" },
                            { minValue: 10, maxValue: 19.9999, symbol: fillSymbol([232, 91, 59, 1]), label: "10–19%" },
                            { minValue: 20, maxValue: 29.9999, symbol: fillSymbol([244, 109, 67, 1]), label: "20–29%" },
                            { minValue: 30, maxValue: 39.9999, symbol: fillSymbol([253, 141, 60, 1]), label: "30–39%" },
                            { minValue: 40, maxValue: 49.9999, symbol: fillSymbol([253, 174, 97, 1]), label: "40–49%" },
                            { minValue: 50, maxValue: 59.9999, symbol: fillSymbol([254, 224, 139, 1]), label: "50–59%" },
                            { minValue: 60, maxValue: 69.9999, symbol: fillSymbol([217, 239, 139, 1]), label: "60–69%" },
                            { minValue: 70, maxValue: 79.9999, symbol: fillSymbol([166, 217, 106, 1]), label: "70–79%" },
                            { minValue: 80, maxValue: 89.9999, symbol: fillSymbol([102, 189, 99, 1]), label: "80–89%" },
                            { minValue: 90, maxValue: 100.0001, symbol: fillSymbol([26, 152, 80, 1]), label: "90–100%" }
                        ]
                    });
                }

                async function makeCountRendererClasses(availFld, totalFld) {
                    let maxT = 0;

                    try {
                        const q = layer.createQuery();
                        q.where = `${totalFld} > 0`;
                        q.outStatistics = [
                            {
                                statisticType: "max",
                                onStatisticField: totalFld,
                                outStatisticFieldName: "maxT"
                            }
                        ];
                        q.returnGeometry = false;

                        const res = await layer.queryFeatures(q);
                        maxT = Number(res.features?.[0]?.attributes?.maxT || 0);
                    } catch (e) {
                        maxT = 0;
                    }

                    if (!maxT || maxT < 1) maxT = 1;

                    const expr = `
              var a = $feature.${availFld};
              var t = $feature.${totalFld};
              if (t == null || t == 0) { return Null; }
              if (a == null) { return 0; }
              return a;
            `;

                    const classBreakInfos = [];
                    const palette = [
                        [215, 48, 39, 1],
                        [244, 109, 67, 1],
                        [253, 174, 97, 1],
                        [254, 224, 139, 1],
                        [166, 217, 106, 1],
                        [26, 152, 80, 1]
                    ];

                    if (maxT <= 6) {
                        for (let i = 0; i <= maxT; i++) {
                            classBreakInfos.push({
                                minValue: i,
                                maxValue: i + 0.0001,
                                symbol: fillSymbol(palette[Math.min(i, palette.length - 1)]),
                                label: String(i)
                            });
                        }
                    } else {
                        // Force "0" to be its own (reddest) class
                        classBreakInfos.push({
                            minValue: 0,
                            maxValue: 0.0001,
                            symbol: fillSymbol(palette[0]),
                            label: "0"
                        });

                        const nBins = 5; // remaining colors/bins for 1+
                        const step = Math.ceil(maxT / nBins); // bin from 1..maxT

                        for (let i = 0; i < nBins; i++) {
                            const min = 1 + i * step;
                            let max = 1 + (i + 1) * step - 1;
                            if (i === nBins - 1) max = maxT;
                            if (min > maxT) break;

                            classBreakInfos.push({
                                minValue: min,
                                maxValue: max + 0.0001,
                                symbol: fillSymbol(palette[Math.min(i + 1, palette.length - 1)]),
                                label: min === max ? `${min}` : `${min}–${max}`
                            });
                        }
                    }

                    return {
                        renderer: new ClassBreaksRenderer({
                            valueExpression: expr,
                            valueExpressionTitle: "Rooms available",
                            defaultSymbol: fillSymbol([200, 200, 200, 1]),
                            defaultLabel: "No rooms",
                            classBreakInfos
                        }),
                        maxT
                    };
                }

                function formatPopupHTML(attrs, g, s, type) {
                    const aFld = availField(g, s, type);
                    const tFld = totalField(g, s, type);
                    const pFld = pctField(g, s, type);

                    const name = attrs.Building_Name ?? attrs.Building ?? "Building";

                    const a = attrs[aFld];
                    const t = attrs[tFld];
                    const p = attrs[pFld];

                    const aNum = a == null ? 0 : Number(a);
                    const tNum = t == null ? 0 : Number(t);
                    const pNum = p == null ? 0 : Number(p);

                    if (!tNum || tNum === 0) {
                        return `
                <div style="font-family:system-ui; font-size:13px;">
                  <div style="font-weight:700; font-size:14px; margin-bottom:6px;">${name}</div>
                  <div style="color:#666;">No rooms of this type in this building.</div>
                </div>
              `;
                    }

                    const aTxt = aNum.toLocaleString();
                    const tTxt = tNum.toLocaleString();
                    const pTxt = (Number.isFinite(pNum) ? Math.min(pNum, 100).toFixed(1) : "0.0") + "%";

                    return `
              <div style="font-family:system-ui; font-size:13px;">
                <div style="font-weight:700; font-size:14px; margin-bottom:8px;">${name}</div>
                <table style="border-collapse:collapse; width:100%;">
                  <tr>
                    <td style="padding:2px 10px 2px 0; color:#666;">Available</td>
                    <td style="padding:2px 0; font-weight:650;">${aTxt}</td>
                  </tr>
                  <tr>
                    <td style="padding:2px 10px 2px 0; color:#666;">Total</td>
                    <td style="padding:2px 0; font-weight:650;">${tTxt}</td>
                  </tr>
                  <tr>
                    <td style="padding:2px 10px 2px 0; color:#666;">Percent available</td>
                    <td style="padding:2px 0; font-weight:650;">${pTxt}</td>
                  </tr>
                </table>
              </div>
            `;
                }

                let applySelectionToken = 0;

                async function applySelection() {
                    const token = ++applySelectionToken;

                    const g = genderSel.value || "ALL";
                    const s = sizeSel.value || "ALL";
                    const type = typeSel.value || "ALL";
                    const m = metricSel.value || "pct";

                    const aFld = availField(g, s, type);
                    const tFld = totalField(g, s, type);
                    const pFld = pctField(g, s, type);

                    if (m === "pct") {
                        const renderer = makePctRendererClasses(pFld, tFld);
                        if (token !== applySelectionToken) return;
                        layer.renderer = renderer;
                        renderClassLegend("Percent available", layer.renderer);
                    } else {
                        const result = await makeCountRendererClasses(aFld, tFld);
                        if (token !== applySelectionToken) return;
                        layer.renderer = result.renderer;
                        renderClassLegend("Rooms available", layer.renderer);
                    }

                    layer.labelingInfo = makeLabelingInfo(g, s, type, m);
                    layer.labelsVisible = true;
                }

                function safeOn(el, event, handler) {
                    if (!el) return;
                    el.addEventListener(event, handler);
                }

                safeOn(genderSel, "change", () => applySelection());
                safeOn(sizeSel, "change", () => applySelection());
                safeOn(typeSel, "change", () => applySelection());
                safeOn(metricSel, "change", () => applySelection());

                async function init() {
                    await Promise.all([layer.load(), timesLayer.load()]);
                    console.log("Layer fields:", layer.fields.map(f => f.name));
                    const dates = await fetchUniqueTimes();
                    setSliderStops(dates);
                    await applySelection();
                    prewarmCache(dates);
                }

                timeSlider.watch("timeExtent", (te) => {
                    if (!te) return;
                    view.timeExtent = te;
                    layer.timeExtent = te;

                    const displayDate = new Date(te.start.getTime() + 4 * 60 * 60 * 1000);
                    if (
                        displayDate.getMonth() === 3 &&
                        displayDate.getDate() === 11 &&
                        displayDate.getHours() === 9 &&
                        displayDate.getMinutes() === 0
                    ) {
                        displayDate.setMinutes(30);
                    }
                    timeLabel.textContent = fmt.format(displayDate);
                });

                safeOn(refreshBtn, "click", async () => {
                    const dates = await fetchUniqueTimes();
                    setSliderStops(dates);
                });

                view.when(init);

                // Optional: resize when your Astro page toggles this panel visible again
                window.addEventListener("housing-map-resize", () => {
                    try { view.resize(); } catch { }
                });
            }
        );
    }

    // Wait for ArcGIS loader script to be ready
    if (window.require) {
        startMap();
    } else {
        const arcgisScript = document.querySelector('script[src="https://js.arcgis.com/4.29/"]');
        if (arcgisScript) {
            arcgisScript.addEventListener("load", startMap, { once: true });
        } else {
            window.addEventListener("load", startMap, { once: true });
        }
    }
})();