// =====================================
// Loading Screen
// =====================================
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1000);

    // First load: the works open like a hand fan across the screen,
    // hold for a beat, then sail into the side panel.
    // (Starts as the loading screen fades out — the dark curtain takes over)
    // The fan only plays if the visitor is actually looking at the Featured
    // Portfolio section — otherwise it waits for the first scroll down to it.
    psState.fanReadyAt = Date.now() + 1100;
    setTimeout(playFirstLoadFan, 1100);
});

// =====================================
// Navigation Scroll Effect
// =====================================
const navbar = document.getElementById('mainNav');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    updateActiveNavLink();
});

// =====================================
// Smooth Scrolling
// =====================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                bootstrap.Collapse.getInstance(navbarCollapse).hide();
            }
        }
    });
});

// =====================================
// Active Nav Link Highlighting
// =====================================
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

// =====================================
// Scroll Animations (AOS Alternative)
// =====================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => observer.observe(el));
});

// =====================================
// Featured Portfolio — 3D Studio
// (category line → big display → sequential work line)
// =====================================

let portfolioCache = [];
let psCategories = [];
const psState = { category: null, items: [], index: 0, fanUntil: 0, fanShown: false, fanReadyAt: Infinity };
const psReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function initPortfolio() {
    // Data source: js/projects-data.js (single data file, loaded in index.html)
    // (normalization handled by js/data-loader.js)
    portfolioCache = await loadPortfolioData();
    if (!portfolioCache.length) {
        console.error('Portfolio data not found or invalid. Please check js/projects-data.js');
        return;
    }

    // Category line — built from the data, so any new category added to
    // js/projects-data.js automatically appears here. Menu order = id order
    // (smallest "id" first — change a project's id to move its category),
    // and projects with "hidden": true stay out of the menu.
    psCategories = [];
    portfolioCache.forEach(project => {
        if (project.hidden || !project.category) return;
        const idNum = Number(project.id);
        const pos = Number.isFinite(idNum) ? idNum : Infinity; // no id -> very last
        const existing = psCategories.find(c => c.key === project.category);
        if (existing) {
            existing.pos = Math.min(existing.pos, pos); // group position = its smallest id
            return;
        }
        psCategories.push({ key: project.category, name: project.categoryName || project.category, pos: pos });
    });
    psCategories.sort((a, b) => a.pos - b.pos);

    const filterWrap = document.querySelector('.portfolio-filter');
    const filterBtns = [];
    if (filterWrap) {
        filterWrap.innerHTML = '';
        psCategories.forEach((cat, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filter-btn' + (i === 0 ? ' active' : '');
            btn.setAttribute('data-filter', cat.key);
            btn.textContent = cat.name;
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setCategory(cat.key, true);
            });
            filterWrap.appendChild(btn);
            filterBtns.push(btn);
        });
    }

    // Back / Next arrows
    const prevBtn = document.getElementById('psPrev');
    const nextBtn = document.getElementById('psNext');
    if (prevBtn) prevBtn.addEventListener('click', () => stepItem(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => stepItem(1));

    // Subtle 3D tilt on the big display
    initStageTilt();

    // Default display: first category (instant — the entrance animation plays on scroll)
    setCategory(psCategories.length ? psCategories[0].key : 'logo', false);

    // Fly the whole section in from the bottom-left every time it scrolls into view
    initSectionEntrance();
}

// ---- Data helpers ---------------------------------------------------

function buildCategoryItems(category) {
    // Video category: every video, from all projects.
    // Videos stay separate — they are not mixed into the photo categories.
    const items = [];

    if (category === 'video') {
        portfolioCache.forEach(project => {
            (project.media || [])
                .filter(media => media.type === 'video')
                .forEach(media => {
                    items.push(Object.assign({}, media, { project: project }));
                });
        });
        return items;
    }

    // Photo categories: images only
    portfolioCache
        .filter(project => !category || category === 'all' || project.category === category)
        .forEach(project => {
            (project.media || [])
                .filter(media => media.type !== 'video')
                .forEach(media => {
                    items.push(Object.assign({}, media, { project: project }));
                });
        });
    return items;
}

function currentItem() {
    return psState.items[psState.index];
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

// ---- Category switch: display flips + works unfold like a hand fan ----

function setCategory(category, animate) {
    psState.category = category;
    psState.items = buildCategoryItems(category);
    psState.index = 0;

    renderStrip();
    updateStage(0);

    // Quick glow pulse on the display (opacity-only, so it stays smooth)
    const stage = document.getElementById('psStage');
    if (stage) {
        stage.classList.remove('ps-flash');
        void stage.offsetWidth;
        stage.classList.add('ps-flash');
        clearTimeout(stage._flashTimer);
        stage._flashTimer = setTimeout(() => stage.classList.remove('ps-flash'), 700);
    }

    // Category change: the works unfold full-screen like a hand fan,
    // then glide into the side panel
    if (animate) playFanShow();
}

// ---- Sequential line (thumbnail strip) -----------------------------

function renderStrip() {
    const strip = document.getElementById('psStrip');
    if (!strip) return;

    strip.innerHTML = '';
    strip.scrollLeft = 0;
    strip.scrollTop = 0;

    // Any cards still flying in the fan layer belong to the old category
    const fanLayer = document.getElementById('psFanLayer');
    if (fanLayer) {
        clearTimeout(fanLayer._restoreTimer);
        fanLayer.innerHTML = '';
    }

    // Build every thumb first (one layout pass)
    psState.items.forEach((item, k) => {
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'ps-thumb'
            + (k === 0 ? ' active' : '')
            + (item.type === 'video' ? ' has-video' : '');
        thumb.setAttribute('aria-label', (item.project.title || item.project.categoryName) + ' — work ' + (k + 1));

        const thumbCover = item.type === 'video' ? (item.poster || '') : item.src;
        const coverTag = thumbCover
            ? `<img class="ps-thumb-img" src="${thumbCover}" alt="" draggable="false" decoding="async">`
            : '<span class="ps-thumb-img"></span>';

        thumb.innerHTML = coverTag
            + (item.type === 'video' ? '<span class="ps-thumb-play"><i class="fas fa-play"></i></span>' : '');

        thumb.addEventListener('click', () => {
            if (k === psState.index) return;
            const direction = k > psState.index ? 1 : -1;
            psState.index = k;
            updateStage(direction);
            highlightActiveThumb();
        });

        strip.appendChild(thumb);
    });
}

// While thumbs are flying, lift the rail's overflow so they can leave it
function startStripFly(strip, totalMs) {
    if (!strip) return;
    strip.classList.add('ps-flying');
    clearTimeout(strip._flyTimer);
    strip._flyTimer = setTimeout(() => {
        strip.classList.remove('ps-flying');
    }, totalMs);
}

// Generic fly-in: set CSS vars, (re)start the animation, clean up after.
// opts.soft = light 2D variant (used for the many thumbnails)
function flyIn(el, opts) {
    const cls = opts.soft ? 'ps-enter-soft' : 'ps-enter';
    const animName = opts.soft ? 'psFlyInSoft' : 'psFlyIn';

    el.classList.remove('ps-enter', 'ps-enter-soft');
    void el.offsetWidth; // restart the animation
    el.style.setProperty('--dx', opts.dx.toFixed(0) + 'px');
    el.style.setProperty('--dy', opts.dy.toFixed(0) + 'px');
    el.style.setProperty('--rz', opts.rz.toFixed(1) + 'deg');
    el.style.setProperty('--sc', opts.sc.toFixed(2));
    if (opts.rx !== undefined) el.style.setProperty('--rx', opts.rx.toFixed(1) + 'deg');
    if (opts.ry !== undefined) el.style.setProperty('--ry', opts.ry.toFixed(1) + 'deg');
    el.style.setProperty('--d', opts.delay + 'ms');
    el.classList.add(cls);

    el.addEventListener('animationend', function onEnd(e) {
        if (e.animationName !== animName) return; // ignore other animations
        el.classList.remove(cls);
        el.removeEventListener('animationend', onEnd);
    });
}

function rand(min, max) {
    return min + Math.random() * (max - min);
}

// Compress the wave delay so big categories don't animate for ages
function staggerDelay(k, total, idealStep, windowMs) {
    const step = total > 1 ? Math.min(idealStep, windowMs / (total - 1)) : 0;
    return Math.round(k * step);
}

// ---- Hand-fan show: works open full-screen, hold, then sail into the panel ----
// Timeline (the CSS keyframes use the matching percentages):
// appear at the closed stack (6%) → sweep open left-to-right along the arc
// (6–23%) → hold in the middle of the screen (23–64%, ≈1s) →
// glide into the side panel (64–100%)
const FAN_APPEAR_MS = 136;   // 6%
const FAN_SWEEP_MS = 384;    // 23%
const FAN_HOLD_MS = 927;     // 64% (≈1 second)
const FAN_MOVE_MS = 813;     // 100%
const FAN_TOTAL_MS = FAN_APPEAR_MS + FAN_SWEEP_MS + FAN_HOLD_MS + FAN_MOVE_MS; // 2260
const FAN_REVEAL_MS = FAN_APPEAR_MS + FAN_SWEEP_MS + FAN_HOLD_MS; // curtain lifts

// Dark curtain that hides every section while the fan is on stage
function getFanBackdrop() {
    let el = document.getElementById('psFanBackdrop');
    if (!el) {
        el = document.createElement('div');
        el.id = 'psFanBackdrop';
        el.className = 'ps-fan-backdrop';
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
    }
    return el;
}

// Fixed top layer: the works move here for the show so no page section,
// stacking context, or scroll container can cover or clip them
function getFanLayer() {
    let el = document.getElementById('psFanLayer');
    if (!el) {
        el = document.createElement('div');
        el.id = 'psFanLayer';
        el.className = 'ps-fan-layer';
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
    }
    return el;
}

// Put every card back into the side-panel rail once the show has settled
function restoreFanThumbs() {
    const layer = document.getElementById('psFanLayer');
    const strip = document.getElementById('psStrip');
    if (!layer) return;

    layer.querySelectorAll('.ps-thumb').forEach(thumb => {
        thumb.classList.remove('ps-fan-show');
        thumb.style.position = '';
        thumb.style.left = '';
        thumb.style.top = '';
        thumb.style.width = '';
        thumb.style.height = '';
        if (strip) strip.appendChild(thumb);
        else thumb.remove();
    });

    // Keep the highlighted card in sync with whatever the stage shows
    if (strip && psState.items.length) highlightActiveThumb();
}

// Keep the page still while the show runs (scrollbar width compensated)
function lockFanScroll() {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--ps-sbw', sbw > 0 ? sbw + 'px' : '0px');
    document.body.classList.add('ps-fan-lock');
    clearTimeout(document.body._fanLockTimer);
    document.body._fanLockTimer = setTimeout(unlockFanScroll, FAN_TOTAL_MS + 900);
}

function unlockFanScroll() {
    document.body.classList.remove('ps-fan-lock');
}

// True while a meaningful part of the Featured Portfolio section is on screen
function portfolioIsCurrent() {
    const section = document.getElementById('portfolio');
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    return visible > vh * 0.2;
}

// The intro fan is a full-screen takeover — it plays exactly once, and only
// while the Featured Portfolio section is the section being looked at
function requestIntroFan() {
    if (psReduceMotion || psState.fanShown) return;
    if (Date.now() < psState.fanReadyAt) return; // let the loading screen fade first
    if (Date.now() < psState.fanUntil) return;  // a show is already running
    if (!psState.items.length) return;
    psState.fanShown = true;
    playFanShow();
}

// First page load: play after the loading screen fades — but only if the
// visitor is actually looking at the Featured Portfolio section. If they are
// elsewhere on the page, the fan waits and plays the first time they scroll
// down to it (see initSectionEntrance).
function playFirstLoadFan() {
    if (!portfolioIsCurrent()) return;
    requestIntroFan();
}

// Full-screen fan: the closed stack rests at the fan's left edge, the works
// open left-to-right around the pivot, hold in the middle of the screen,
// then glide down into their slots in the right side panel.
function playFanShow() {
    if (psReduceMotion) return;

    const strip = document.getElementById('psStrip');
    const thumbs = strip ? strip.querySelectorAll('.ps-thumb') : [];
    if (!strip || !thumbs.length) return;

    const total = thumbs.length;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Spread: degrees between cards (up to 150° across the fan)
    const step = total > 1 ? Math.min(12, 150 / (total - 1)) : 0;
    const maxAngle = (step * (total - 1)) / 2;
    const radMax = maxAngle * Math.PI / 180;
    const cosMax = Math.cos(radMax);
    const sinMax = Math.sin(radMax);

    // Keep in sync with the --fsc sizes in style.css
    const fsc = vw <= 767 ? 1.2 : 1.6;
    const sample = thumbs[0].getBoundingClientRect();
    const cardW = sample.width * fsc;
    const cardH = sample.height * fsc;

    // Radius: big enough to fill the screen, then fitted so the open fan
    // always stays fully on screen
    let radius = Math.min(vw, vh) * 0.5;
    if (sinMax > 0.05) radius = Math.min(radius, (vw / 2 - 12 - cardW / 2) / sinMax);
    if (1 - cosMax > 0.04) radius = Math.min(radius, (vh - 130 - cardH) / (1 - cosMax));
    radius = Math.max(90, Math.min(620, radius));

    // Screen-centered fan: the hinge sits below the middle so the open arc
    // is centered exactly in the middle of the screen
    const hingeX = vw / 2;
    const hingeY = vh / 2 + (radius * (1 + cosMax)) / 2;

    // Closed stack: just left of the fan's first card (the fan's fixed edge)
    const deckAngle = -maxAngle - 5;
    const deckRad = deckAngle * Math.PI / 180;

    // Keep other card animations away while the show is on stage
    psState.fanUntil = Date.now() + FAN_TOTAL_MS + 900;
    psState.fanShown = true;

    thumbs.forEach(thumb => thumb.classList.remove('ps-enter', 'ps-enter-soft', 'ps-fan-show'));

    // Measure everything first (one layout pass)
    const placements = [];
    thumbs.forEach((thumb, k) => {
        const angle = step * (k - (total - 1) / 2);
        const rad = angle * Math.PI / 180;
        const rect = thumb.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // Final slot on the open fan
        const fx = hingeX + Math.sin(rad) * radius - cx;
        const fy = hingeY - Math.cos(rad) * radius - cy;

        // Closed-fan stack slot (nested slightly so the stack looks layered)
        const r0 = Math.max(radius * 0.3, radius - (total - 1 - k) * 3);
        const dx0 = hingeX + Math.sin(deckRad) * r0 - cx;
        const dy0 = hingeY - Math.cos(deckRad) * r0 - cy;

        // Two mid-points along the swing arc so each card swings around the
        // pivot like a real fan rib (instead of sliding along a chord)
        const m1a = (deckAngle + (angle - deckAngle) / 3) * Math.PI / 180;
        const m2a = (deckAngle + ((angle - deckAngle) * 2) / 3) * Math.PI / 180;
        const m1r = r0 + (radius - r0) / 3;
        const m2r = r0 + ((radius - r0) * 2) / 3;
        const m1x = hingeX + Math.sin(m1a) * m1r - cx;
        const m1y = hingeY - Math.cos(m1a) * m1r - cy;
        const m2x = hingeX + Math.sin(m2a) * m2r - cx;
        const m2y = hingeY - Math.cos(m2a) * m2r - cy;
        const m1rot = deckAngle + (angle - deckAngle) / 3;
        const m2rot = deckAngle + ((angle - deckAngle) * 2) / 3;

        placements.push({
            thumb: thumb,
            rect: rect,
            fx: fx, fy: fy,
            dx0: dx0, dy0: dy0,
            m1x: m1x, m1y: m1y, m1rot: m1rot,
            m2x: m2x, m2y: m2y, m2rot: m2rot,
            angle: angle, deckAngle: deckAngle,
            delay: staggerDelay(k, total, 26, 420)
        });
    });

    // Darken the page (all sections hidden) while the fan opens in the center
    const backdrop = getFanBackdrop();
    backdrop.classList.add('on');
    clearTimeout(backdrop._offTimer);
    backdrop._offTimer = setTimeout(() => backdrop.classList.remove('on'), FAN_REVEAL_MS);

    // Keep the page still while the show runs
    lockFanScroll();

    // Apply (one style pass): every card moves into the fixed top layer,
    // pinned exactly where it was, then the fan animation takes over
    const layer = getFanLayer();
    placements.forEach(p => {
        const thumb = p.thumb;

        thumb.style.position = 'absolute';
        thumb.style.left = p.rect.left + 'px';
        thumb.style.top = p.rect.top + 'px';
        thumb.style.width = p.rect.width + 'px';
        thumb.style.height = p.rect.height + 'px';
        layer.appendChild(thumb);

        thumb.style.setProperty('--fx', p.fx.toFixed(0) + 'px');
        thumb.style.setProperty('--fy', p.fy.toFixed(0) + 'px');
        thumb.style.setProperty('--frot', p.angle.toFixed(1) + 'deg');
        thumb.style.setProperty('--fx0', p.dx0.toFixed(0) + 'px');
        thumb.style.setProperty('--fy0', p.dy0.toFixed(0) + 'px');
        thumb.style.setProperty('--frot0', p.deckAngle.toFixed(1) + 'deg');
        thumb.style.setProperty('--fxm1', p.m1x.toFixed(0) + 'px');
        thumb.style.setProperty('--fym1', p.m1y.toFixed(0) + 'px');
        thumb.style.setProperty('--frotm1', p.m1rot.toFixed(1) + 'deg');
        thumb.style.setProperty('--fxm2', p.m2x.toFixed(0) + 'px');
        thumb.style.setProperty('--fym2', p.m2y.toFixed(0) + 'px');
        thumb.style.setProperty('--frotm2', p.m2rot.toFixed(1) + 'deg');
        thumb.style.setProperty('--d', p.delay + 'ms');
        thumb.classList.add('ps-fan-show');

        thumb.addEventListener('animationend', function onEnd(e) {
            if (e.animationName !== 'psFanShow') return;
            thumb.classList.remove('ps-fan-show');
            thumb.removeEventListener('animationend', onEnd);
        });
    });

    // Put the works back into the rail once the show has fully settled
    clearTimeout(layer._restoreTimer);
    layer._restoreTimer = setTimeout(restoreFanThumbs, FAN_TOTAL_MS + 700);
}

// Scroll into view: the whole section flies in from the bottom-left and settles
function playSectionEntrance() {
    if (psReduceMotion) return;
    const studio = document.querySelector('.ps-studio');
    if (!studio || !psState.items.length) return;

    // Main parts — only four 3D flights, so the entrance stays light
    const parts = [
        { el: studio.querySelector('.ps-stage'), sc: 0.94, delay: 0, rx: [6, 14], ry: [-18, -8], rz: [-8, -3] },
        { el: studio.querySelector('.ps-side-head'), sc: 0.95, delay: 100, rx: [4, 10], ry: [-14, -6], rz: [-6, -2] },
        { el: studio.querySelector('#psPrev'), sc: 0.6, delay: 180, rx: [-28, 22], ry: [-40, 22], rz: [-16, 10] },
        { el: studio.querySelector('#psNext'), sc: 0.6, delay: 240, rx: [-28, 22], ry: [-40, 22], rz: [-16, 10] }
    ];

    parts.forEach(part => {
        if (!part.el) return;
        flyIn(part.el, {
            dx: -rand(200, 380),
            dy: rand(160, 320),
            rx: rand(part.rx[0], part.rx[1]),
            ry: rand(part.ry[0], part.ry[1]),
            rz: rand(part.rz[0], part.rz[1]),
            sc: part.sc,
            delay: part.delay
        });
    });

    // Works: quick light wave from the bottom-left — skipped while the
    // fan show already owns the cards
    if (Date.now() < psState.fanUntil) return;
    const strip = studio.querySelector('#psStrip');
    const thumbs = studio.querySelectorAll('.ps-thumb');
    if (strip && thumbs.length) {
        startStripFly(strip, 240 + staggerDelay(thumbs.length - 1, thumbs.length, 55, 700) + 800);
    }
    thumbs.forEach((thumb, k) => {
        flyIn(thumb, {
            soft: true,
            dx: -rand(130, 340),
            dy: rand(110, 300),
            rz: rand(-26, -4),
            sc: 0.55,
            delay: 240 + staggerDelay(k, thumbs.length, 55, 700)
        });
    });
}

// Replay the entrance every time the section scrolls into view — and the
// very first time it becomes the current section, play the intro fan (only
// if it is still due — e.g. the visitor loaded the page further up)
function initSectionEntrance() {
    const section = document.getElementById('portfolio');
    if (!section || psReduceMotion) return;

    let armed = true;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && armed) {
                armed = false;
                requestIntroFan();
                playSectionEntrance();
            } else if (!entry.isIntersecting) {
                armed = true; // re-arm once the section leaves the viewport
            }
        });
    }, { threshold: 0.2 });

    io.observe(section);
}

// ---- Main display ---------------------------------------------------
function updateStage(direction) {
    const item = currentItem();
    const inner = document.getElementById('psStageInner');
    const stage = document.getElementById('psStage');
    if (!inner) return;

    // Stop any playing video before replacing the content
    inner.querySelectorAll('video').forEach(v => v.pause());

    // Restart the 3D flip animation
    inner.classList.remove('ps-flip-left', 'ps-flip-right');
    void inner.offsetWidth;

    const typeChip = document.getElementById('psType');
    const chipEl = document.getElementById('psChip');
    const titleEl = document.getElementById('psTitle');
    const countEl = document.getElementById('psCount');

    // Category with no media yet (e.g. a fresh one just added to the JSON)
    if (!item) {
        const cat = psCategories.find(c => c.key === psState.category);
        const label = cat ? cat.name : 'Portfolio';

        inner.innerHTML = '<div class="ps-stage-empty"><i class="fas fa-folder-open" aria-hidden="true"></i><span>No work added yet</span></div>';
        inner.classList.add(direction === -1 ? 'ps-flip-left' : 'ps-flip-right');

        if (stage) stage.style.setProperty('--ps-bg', 'none');
        if (typeChip) typeChip.classList.remove('show');
        if (chipEl) chipEl.textContent = label;
        if (titleEl) {
            titleEl.textContent = label;
            titleEl.title = label;
        }
        if (countEl) countEl.textContent = '00 / 00';
        return;
    }

    if (item.type === 'video') {
        inner.innerHTML = `
            <video class="ps-media" controls playsinline preload="metadata"
                ${item.poster ? `poster="${item.poster}"` : ''}>
                <source src="${item.src}" type="${item.src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'}">
            </video>
        `;
    } else {
        inner.innerHTML = `<img class="ps-media" src="${item.src}" alt="${item.project.title || item.project.categoryName}">`;
    }

    inner.classList.add(direction === -1 ? 'ps-flip-left' : 'ps-flip-right');

    // Blurred backdrop behind the media
    if (stage) {
        const backdrop = item.type === 'video' ? (item.poster || '') : item.src;
        stage.style.setProperty('--ps-bg', backdrop ? `url('${backdrop}')` : 'none');
    }

    // Chips + caption
    if (typeChip) typeChip.classList.toggle('show', item.type === 'video');
    if (chipEl) chipEl.textContent = item.project.categoryName;
    if (titleEl) {
        titleEl.textContent = item.project.title || '';
        titleEl.title = item.project.title || ''; // tooltip if the header truncates
    }
    if (countEl) countEl.textContent = pad2(psState.index + 1) + ' / ' + pad2(psState.items.length);
}

function stepItem(step) {
    if (!psState.items.length) return;
    psState.index = (psState.index + step + psState.items.length) % psState.items.length;
    updateStage(step);
    highlightActiveThumb();
}

function highlightActiveThumb() {
    const strip = document.getElementById('psStrip');
    if (!strip) return;

    const thumbs = strip.querySelectorAll('.ps-thumb');
    thumbs.forEach((t, k) => t.classList.toggle('active', k === psState.index));

    const active = thumbs[psState.index];
    if (active) {
        const left = active.offsetLeft - (strip.clientWidth - active.clientWidth) / 2;
        const top = active.offsetTop - (strip.clientHeight - active.clientHeight) / 2;
        strip.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: 'smooth' });
    }
}

// ---- Subtle 3D tilt on the big display ------------------------------
function initStageTilt() {
    const stage = document.getElementById('psStage');
    if (!stage || psReduceMotion) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let rafId = null;

    const loop = () => {
        curX += (targetX - curX) * 0.08;
        curY += (targetY - curY) * 0.08;

        if (Math.abs(targetX - curX) < 0.002 && Math.abs(targetY - curY) < 0.002) {
            stage.style.transform = '';
            rafId = null;
            return;
        }

        stage.style.transform = 'perspective(1400px) rotateX(' + (-curX * 3.5).toFixed(2) + 'deg) rotateY(' + (curY * 3.5).toFixed(2) + 'deg)';
        rafId = requestAnimationFrame(loop);
    };

    const start = () => {
        if (!rafId) rafId = requestAnimationFrame(loop);
    };

    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        targetY = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        targetX = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        start();
    });

    stage.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        start();
    });
}

// Initial data load + first render
initPortfolio();

// =====================================
// Contact Form Validation & Submission
// =====================================
const contactForm = document.getElementById('contactForm');
const formInputs = contactForm.querySelectorAll('.form-control');

// Real-time validation
formInputs.forEach(input => {
    input.addEventListener('blur', () => {
        validateField(input);
    });

    input.addEventListener('input', () => {
        // Clear error on input
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = '';
        }
        input.classList.remove('is-invalid');
    });
});

function validateField(field) {
    const errorSpan = field.parentElement.querySelector('.error-message');
    let isValid = true;
    let errorMessage = '';

    // Check if required field is empty
    if (field.hasAttribute('required') && field.value.trim() === '') {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Validate email format
    if (field.type === 'email' && field.value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Update error display
    if (errorSpan) {
        errorSpan.textContent = errorMessage;
    }

    if (isValid) {
        field.classList.remove('is-invalid');
    } else {
        field.classList.add('is-invalid');
    }

    return isValid;
}

// Form submission handling
contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate all fields
    let isFormValid = true;
    formInputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) return;

    // UI Elements
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const formMessage = contactForm.querySelector('.form-message');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';
    submitBtn.disabled = true;

    // URL for Google Apps Script
    const scriptURL = 'https://script.google.com/macros/s/AKfycby-Vx0KtXJo4nXjk738RaxeOmlm-4YsuD0TlebPyFbVfyraFtxo4NiwWLP3Dm6bMCsKJg/exec';

    // Get form data
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject') || 'No Subject',
        message: formData.get('message')
    };

    // Admin Email Template (Black & Modern)
    const adminHtml = `
        <div style="font-family: 'Inter', sans-serif; background-color: #05081a; padding: 40px; color: #FFFFFF;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0A0E27; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="background: linear-gradient(135deg, #6C3FF5 0%, #FF006B 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; color: #FFFFFF;">NEW INQUIRY</h1>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #B8BCCC; margin-bottom: 30px; text-align: center;">A new potential project has landed in your inbox.</p>
                    <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 25px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #6C3FF5; font-weight: 700; text-transform: uppercase; font-size: 12px; width: 100px;">Name</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #FFFFFF;">${data.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #6C3FF5; font-weight: 700; text-transform: uppercase; font-size: 12px;">Email</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);"><a href="mailto:${data.email}" style="color: #00D4FF; text-decoration: none;">${data.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #6C3FF5; font-weight: 700; text-transform: uppercase; font-size: 12px;">Subject</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #FFFFFF;">${data.subject}</td>
                            </tr>
                        </table>
                    </div>
                    <div style="margin-top: 30px; padding: 25px; background: rgba(108, 63, 245, 0.05); border-radius: 12px; border-left: 4px solid #6C3FF5;">
                        <p style="margin: 0; color: #6C3FF5; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Message</p>
                        <p style="margin: 0; line-height: 1.8; color: #FFFFFF; font-size: 15px; white-space: pre-wrap;">${data.message}</p>
                    </div>
                </div>
                <div style="background-color: #05081a; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 2px;">© 2024 BHUMI PATEL PORTFOLIO</p>
                </div>
            </div>
        </div>
    `;

    // Customer Email Template (Black & Modern)
    const customerHtml = `
        <div style="font-family: 'Inter', sans-serif; background-color: #05081a; padding: 40px; color: #FFFFFF;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0A0E27; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="background: linear-gradient(135deg, #00D4FF 0%, #6C3FF5 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; color: #FFFFFF;">MESSAGE RECEIVED</h1>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <h2 style="color: #FFFFFF; font-weight: 700; font-size: 22px; margin-top: 0;">Hi ${data.name.split(' ')[0]}!</h2>
                    <p style="font-size: 16px; line-height: 1.8; color: #B8BCCC; margin-bottom: 30px;">
                        Thank you for reaching out. I've received your inquiry about "<strong>${data.subject}</strong>" and I'll get back to you as soon as possible.
                    </p>
                    <div style="margin-top: 40px;">
                        <a href="https://your-portfolio-website.com#portfolio" style="display: inline-block; background: var(--gradient-primary, linear-gradient(135deg, #6C3FF5 0%, #FF006B 100%)); color: white; padding: 15px 35px; border-radius: 12px; text-decoration: none; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(108, 63, 245, 0.3);">See More Projects</a>
                    </div>
                </div>
                <div style="background-color: #05081a; padding: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin-bottom: 25px; font-size: 14px; font-weight: 600; color: #B8BCCC; text-transform: uppercase; letter-spacing: 1px;">Stay Connected</p>
                    <div style="margin-bottom: 30px;">
                        <a href="#" style="margin: 0 15px; display: inline-block; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" width="24" height="24">
                        </a>
                        <a href="#" style="margin: 0 15px; display: inline-block; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="24" height="24">
                        </a>
                        <a href="#" style="margin: 0 15px; display: inline-block; text-decoration: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" alt="Facebook" width="24" height="24">
                        </a>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 2px;">© 2024 BHUMI PATEL. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </div>
    `;

    // Prepare payload for GAS
    const payload = {
        adminEmail: "harshadpatel1571@gmail.com",
        adminSubject: `New Inquiry from ${data.name}: ${data.subject}`,
        adminHtml: adminHtml,
        customerEmail: data.email,
        customerSubject: `Thank you for contacting Bhumi Patel!`,
        customerHtml: customerHtml
    };

    // Send the data
    fetch(scriptURL, {
        method: "POST",
        mode: "no-cors", // Required for GAS
        body: JSON.stringify(payload)
    })
        .then(() => {
            // Since we use no-cors, we won't see the response but can assume success if no error is thrown
            formMessage.style.display = 'block';
            formMessage.className = 'form-message success';
            formMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i> Thank you! Your message has been received. I\'ll get back to you soon!';

            contactForm.reset();
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;

            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        })
        .catch(error => {
            console.error('Error!', error.message);
            formMessage.style.display = 'block';
            formMessage.className = 'form-message error';
            formMessage.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Oops! Something went wrong. Please try again later.';

            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        });
});

// =====================================
// Parallax Effect for Hero Image
// =====================================
const heroImage = document.getElementById('heroImage');
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

function animateHeroImage() {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    if (heroImage) {
        const translateX = targetX * 20;
        const translateY = targetY * 20;
        heroImage.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    requestAnimationFrame(animateHeroImage);
}

animateHeroImage();

// =====================================
// Cursor Click Effect (Ripple)
// =====================================
document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '2px solid var(--color-primary)';
    ripple.style.left = e.clientX - 10 + 'px';
    ripple.style.top = e.clientY - 10 + 'px';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'rippleEffect 0.6s ease-out';
    ripple.style.zIndex = '9999';

    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
});

// Ripple effect animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }
        `;
document.head.appendChild(style);

// =====================================
// Skill Progress Animation
// =====================================
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillBar = entry.target;
            const width = skillBar.style.width;
            skillBar.style.width = '0';

            setTimeout(() => {
                skillBar.style.width = width;
            }, 100);

            skillObserver.unobserve(skillBar);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => skillObserver.observe(bar));

// =====================================
// Tool Cards Hover Effect
// =====================================
const toolCards = document.querySelectorAll('.tool-card');

toolCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        card.style.animationDelay = '0s';
        card.style.animation = 'pulse 0.5s ease';
    });

    card.addEventListener('animationend', () => {
        card.style.animation = '';
    });
});

// Pulse animation for tool cards
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1) translateY(0);
        }
        50% {
            transform: scale(1.05) translateY(- 10px);
}
    }
    `;
document.head.appendChild(pulseStyle);

// =====================================
// Portfolio thumbnails & arrows: bound in the 3D Studio section above
// =====================================

// =====================================
// Dynamic Floating Blur Elements
// =====================================
const blurElements = document.querySelectorAll('.blur-element');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    blurElements.forEach((element, index) => {
        const speed = (index + 1) * 0.1;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// =====================================
// Performance Optimization: Debounce
// =====================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
window.addEventListener('scroll', debounce(() => {
    // Any heavy scroll calculations can go here
}, 10));

// =====================================
// Console Message
// =====================================
console.log('%c👋 Hi there! Welcome to Bhumi Patel\'s Portfolio', 'color: #6C3FF5; font-size: 20px; font-weight: bold;');
console.log('%c✨ Looking for a talented graphic designer? Let\'s connect!', 'color: #00D4FF; font-size: 14px;');

// =====================================
// Initialize on DOM Ready
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio website loaded successfully! 🚀');

    // Add smooth reveal to sections
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';

        setTimeout(() => {
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
