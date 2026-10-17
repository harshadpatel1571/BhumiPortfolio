// =====================================
// Portfolio Data Loader
// Source: js/projects-data.js — the single data file. It loads as a normal
// script (see index.html), so the portfolio works when index.html is opened
// directly from disk (file://), through a local server, or from hosting.
// =====================================

(function () {
    'use strict';

    // Normalize one project's media into a single list of { type, src, poster }
    function normalizeMedia(project) {
        const media = [];

        // New format: media: [ { type, src, poster }, ... ]
        if (Array.isArray(project.media)) {
            project.media.forEach(item => {
                if (!item) return;
                if (typeof item === 'string') {
                    media.push({ type: 'image', src: item, poster: '' });
                } else if (item.src) {
                    media.push({
                        type: item.type === 'video' ? 'video' : 'image',
                        src: item.src,
                        poster: item.poster || '',
                        demo: !!item.demo
                    });
                }
            });
        }

        // Backward compatibility: legacy "images" / "videos" arrays
        if (!media.length && Array.isArray(project.images)) {
            project.images.forEach(src => media.push({ type: 'image', src: src, poster: '' }));
        }
        if (Array.isArray(project.videos)) {
            project.videos.forEach(v => {
                const src = typeof v === 'string' ? v : (v && v.src);
                if (src) {
                    media.push({
                        type: 'video',
                        src: src,
                        poster: (v && v.poster) || '',
                        demo: !!(v && v.demo)
                    });
                }
            });
        }

        return media;
    }

    // Normalize the whole list + add handy counters used by the UI
    function normalizeProjects(list) {
        return list
            .filter(p => p && typeof p === 'object')
            .map(p => {
                const media = normalizeMedia(p);
                const imageCount = media.filter(m => m.type === 'image').length;
                const videoCount = media.filter(m => m.type === 'video').length;

                return Object.assign({}, p, {
                    media: media,
                    imageCount: imageCount,
                    videoCount: videoCount,
                    hasVideo: videoCount > 0,
                    coverImage: p.coverImage || (media[0] && media[0].src) || ''
                });
            });
    }

    // Returns a Promise resolving to the normalized project list
    async function loadPortfolioData() {
        if (typeof portfolioData !== 'undefined' && Array.isArray(portfolioData)) {
            return normalizeProjects(portfolioData);
        }

        console.error('Portfolio data unavailable: js/projects-data.js is missing or invalid.');
        return [];
    }

    window.loadPortfolioData = loadPortfolioData;
    window.normalizeProjects = normalizeProjects;
})();
