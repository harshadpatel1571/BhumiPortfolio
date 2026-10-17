// =====================================
// Portfolio Redesign Preview
// Renders the same project data in 3 grid variants
// and wires one shared modal (images + videos).
// =====================================

(function () {
    'use strict';

    let portfolioCache = [];

    // ---- helpers ----------------------------------------------------

    function mediaLabel(project) {
        const parts = [];
        if (project.imageCount) parts.push(project.imageCount + (project.imageCount === 1 ? ' visual' : ' visuals'));
        if (project.videoCount) parts.push(project.videoCount + (project.videoCount === 1 ? ' video' : ' videos'));
        return parts.join(' &middot; ');
    }

    function playChip() {
        return '<span class="mv-play-chip"><i class="fas fa-play"></i> Video</span>';
    }

    // ---- Variant A — Editorial Mosaic --------------------------------

    const SPANS_A = ['span-4x2', 'span-2x1', 'span-2x1', 'span-2x2', 'span-2x1', 'span-4x1', 'span-2x1'];

    function cardA(project, index) {
        const span = SPANS_A[index % SPANS_A.length];
        return `
            <article class="mv-a-item ${span}" data-project="${project.id}">
                <div class="mv-a-media" style="background-image: url('${project.coverImage}');"></div>
                <div class="mv-a-shade"></div>
                <span class="mv-chip mv-a-chip">${project.categoryName}</span>
                ${project.hasVideo ? '<span class="mv-a-play"><i class="fas fa-play"></i></span>' : ''}
                <div class="mv-a-info">
                    <h3>${project.title}</h3>
                    <p>${mediaLabel(project)}</p>
                    <span class="mv-a-link">View Project <i class="fas fa-arrow-right"></i></span>
                </div>
            </article>
        `;
    }

    // ---- Variant B — Studio Cards -------------------------------------

    function cardB(project) {
        return `
            <article class="mv-b-card" data-project="${project.id}">
                <div class="mv-b-media">
                    <div class="mv-b-img" style="background-image: url('${project.coverImage}');"></div>
                    <div class="mv-b-glare"></div>
                    <span class="mv-chip">${project.categoryName}</span>
                    ${project.hasVideo ? playChip() : ''}
                </div>
                <div class="mv-b-body">
                    <h3>${project.title}</h3>
                    <p class="mv-b-desc">${project.description || ''}</p>
                    <div class="mv-b-meta">
                        <span><i class="far fa-images"></i>${project.imageCount}</span>
                        ${project.videoCount ? `<span><i class="fas fa-video"></i>${project.videoCount}</span>` : ''}
                        <span class="mv-b-go">View <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
            </article>
        `;
    }

    // ---- Variant C — Cinematic Immersive ------------------------------

    function cardC(project) {
        return `
            <article class="mv-c-item" data-project="${project.id}">
                <div class="mv-c-media" style="background-image: url('${project.coverImage}');"></div>
                <div class="mv-c-base"></div>
                <div class="mv-c-hover">
                    <span class="mv-c-btn"><i class="fas fa-eye"></i></span>
                </div>
                <div class="mv-c-caption">
                    <span class="mv-chip">${project.categoryName}</span>
                    <h3>${project.title}</h3>
                    <p>${mediaLabel(project)}</p>
                </div>
                ${project.hasVideo ? `<span class="mv-c-play">${playChip()}</span>` : ''}
            </article>
        `;
    }

    // ---- Rendering -----------------------------------------------------

    function renderVariants(projects) {
        const gridA = document.getElementById('gridA');
        const gridB = document.getElementById('gridB');
        const gridC = document.getElementById('gridC');

        if (gridA) gridA.innerHTML = projects.map(cardA).join('');
        if (gridB) gridB.innerHTML = projects.map(cardB).join('');
        if (gridC) gridC.innerHTML = projects.map(cardC).join('');

        // Click delegation: any card opens its project modal
        [gridA, gridB, gridC].forEach(grid => {
            if (!grid) return;
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('[data-project]');
                if (card) showProjectDetails(card.getAttribute('data-project'));
            });
        });
    }

    // ---- Modal (images + videos) ---------------------------------------

    function showProjectDetails(projectId) {
        if (!portfolioCache.length) return;
        const project = portfolioCache.find(p => p.id === parseInt(projectId) || p.id === projectId);
        if (!project) return;

        const categoryEl = document.querySelector('.modal-category');
        if (categoryEl) categoryEl.textContent = project.categoryName;

        // Build carousel slides
        const carouselContainer = document.getElementById('modalCarouselContents');
        if (carouselContainer) {
            carouselContainer.innerHTML = '';
            (project.media || []).forEach((media, index) => {
                const carouselItem = document.createElement('div');
                carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;

                if (media.type === 'video') {
                    carouselItem.innerHTML = `
                        <div class="modal-carousel-container">
                            <video class="modal-carousel-img" controls playsinline preload="metadata"
                                ${media.poster ? `poster="${media.poster}"` : ''}>
                                <source src="${media.src}" type="${media.src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'}">
                            </video>
                        </div>
                    `;
                } else {
                    carouselItem.innerHTML = `
                        <div class="modal-carousel-container">
                            <img src="${media.src}" class="modal-carousel-img" alt="${project.title || project.categoryName} - Image ${index + 1}">
                        </div>
                    `;
                }
                carouselContainer.appendChild(carouselItem);
            });
        }

        // Toggle arrows
        const hasMultiple = project.media && project.media.length > 1;
        document.querySelectorAll('.carousel-control-prev, .carousel-control-next').forEach(el => {
            el.style.display = hasMultiple ? 'flex' : 'none';
        });

        // Show modal
        const modalEl = document.getElementById('portfolioModal');
        if (modalEl) {
            modalEl.querySelectorAll('video').forEach(v => v.pause());
            const bModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bModal.show();

            const carouselEl = document.getElementById('projectCarousel');
            if (carouselEl) {
                const bCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
                bCarousel.to(0);
            }
        }
    }

    // ---- Init -----------------------------------------------------------

    document.addEventListener('DOMContentLoaded', async () => {
        portfolioCache = await loadPortfolioData();

        if (!portfolioCache.length) {
            console.error('No portfolio data available.');
            return;
        }

        renderVariants(portfolioCache);

        // Pause videos when modal closes / slides change
        const modalEl = document.getElementById('portfolioModal');
        const carouselEl = document.getElementById('projectCarousel');
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', () => {
                modalEl.querySelectorAll('video').forEach(v => v.pause());
            });
        }
        if (carouselEl) {
            carouselEl.addEventListener('slide.bs.carousel', () => {
                carouselEl.querySelectorAll('video').forEach(v => v.pause());
            });
        }
    });
})();
