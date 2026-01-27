// =====================================
// Loading Screen
// =====================================
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1000);
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
// Dynamic Portfolio Management
// =====================================

function initPortfolio() {
    // portfolioData is now available globally from js/projects-data.js
    if (typeof portfolioData === 'undefined' || !Array.isArray(portfolioData)) {
        console.error('Portfolio data not found or invalid format. Please check js/projects-data.js');
        return;
    }

    // Setup Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetFilter = btn.getAttribute('data-filter');
            renderPortfolio(targetFilter);
        });
    });

    // Initial Render
    const activeBtn = document.querySelector('.filter-btn.active');
    renderPortfolio(activeBtn ? activeBtn.getAttribute('data-filter') : 'branding');
}

function renderPortfolio(filterValue) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filteredProjects = portfolioData.filter(project => {
        if (filterValue === 'all' || !filterValue) return true;
        return project.category === filterValue;
    });

    if (filteredProjects.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No projects found in this category.</p></div>';
        return;
    }

    filteredProjects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.setAttribute('data-aos', 'zoom-in');

        // Ensure visibility immediately, AOS or custom observer will add animation class
        item.style.opacity = '1';

        item.innerHTML = `
            <div class="portfolio-card">
                <div class="portfolio-image" style="background-image: url('${project.coverImage}');"></div>
                <div class="portfolio-overlay">
                    <div class="portfolio-content">
                        <span class="portfolio-category">${project.categoryName}</span>
                        <button class="btn-view" data-project="${project.id}">
                            <i class="fas fa-eye me-2"></i>View Project
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Bind Modal Event
        const viewBtn = item.querySelector('.btn-view');
        if (viewBtn) {
            viewBtn.onclick = (e) => {
                e.stopPropagation();
                showProjectDetails(project.id);
            };
        }

        grid.appendChild(item);

        // Crucial: observe the new item if the observer exists
        if (typeof observer !== 'undefined') {
            observer.observe(item);
        }
    });

    if (typeof AOS !== 'undefined') AOS.refresh();
}

// =====================================
// Portfolio Modal & Project Details
// =====================================
function showProjectDetails(projectId) {
    if (!portfolioData) return;
    const project = portfolioData.find(p => p.id === parseInt(projectId) || p.id === projectId);
    if (!project) return;

    // Populate Modal safely
    const setContent = (selector, content) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = content;
    };

    setContent('.modal-category', project.categoryName);

    // Build Carousel
    const carouselContainer = document.getElementById('modalCarouselContents');
    if (carouselContainer) {
        carouselContainer.innerHTML = '';
        project.images.forEach((imgSrc, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            carouselItem.innerHTML = `
                <div class="modal-carousel-container">
                    <img src="${imgSrc}" class="modal-carousel-img" alt="${project.title} - Image ${index + 1}">
                </div>
            `;
            carouselContainer.appendChild(carouselItem);
        });
    }

    // Toggle Arrows
    const hasMultiple = project.images && project.images.length > 1;
    document.querySelectorAll('.carousel-control-prev, .carousel-control-next').forEach(el => {
        el.style.display = hasMultiple ? 'flex' : 'none';
    });

    // Show Modal
    const modalEl = document.getElementById('portfolioModal');
    if (modalEl) {
        const bModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bModal.show();

        // Reset Carousel
        const carouselEl = document.getElementById('projectCarousel');
        if (carouselEl) {
            const bCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
            bCarousel.to(0);
        }
    }
}

// Initial fetch on window load
window.addEventListener('load', initPortfolio);

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
// Portfolio Card Click Effect
// =====================================
// Redundant card click handler removed as dynamic binding is handled in renderPortfolio

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
