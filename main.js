(function() {
    'use strict';

    const CONFIG = {
        parallaxStrength: 0.03,
        observerMargin: '-50px',
        observerThreshold: 0.15,
        scrollThreshold: 50,
        loadingTime: 1500 // Loading screen duration
    };

    let ticking = false;

    // LOADING SCREEN //
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            console.log('Loading screen not found');
            return;
        }

        console.log('Hiding loading screen...');
        loadingScreen.classList.add('fade-out');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        setTimeout(() => {
            if (loadingScreen && loadingScreen.parentNode) {
                loadingScreen.remove();
                console.log('Loading screen removed');
            }
        }, 500);
    }

    // HEADER READJUSTMENT ON LOAD //
    function initHeaderScroll() {
        const header = document.querySelector('.fixed-header');
        if (!header) return;

        function updateHeader() {
            const scrollY = window.pageYOffset;
            
            if (scrollY > CONFIG.scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateHeader();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        updateHeader();
    }

    // INTERSECTION OBSERVER FOR SCROLL ANIMATIONS //
    function initScrollAnimations() {
        const options = {
            root: null,
            rootMargin: CONFIG.observerMargin,
            threshold: CONFIG.observerThreshold
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(el => observer.observe(el));
    }

    // IMAGE PARRALAX EFFECT //
    function initParallax() {
        const images = document.querySelectorAll('.hero-image, .menu-image, .footer-image');
        if (images.length === 0) return;

        function updateParallax() {
            const viewportHeight = window.innerHeight;

            images.forEach(img => {
                const rect = img.getBoundingClientRect();
                
    // ONLY TRIGGER WHEN IMAGE IS IN VIEWPORT //
                if (rect.top < viewportHeight && rect.bottom > 0) {
                    const elementCenter = rect.top + rect.height / 2;
                    const viewportCenter = viewportHeight / 2;
                    const distance = viewportCenter - elementCenter;
                    const offset = distance * CONFIG.parallaxStrength;
                    
                    img.style.transform = `translateY(${offset}px)`;
                }
            });
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        updateParallax();
    }

    // LAZY LOAD FOR GOOGLE API MAP //
    function initMapLazyLoad() {
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) return;

        const mapIframe = mapContainer.querySelector('iframe');
        if (!mapIframe) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Map is visible, ensure it's loaded
                    if (!mapIframe.hasAttribute('data-loaded')) {
                        mapIframe.setAttribute('data-loaded', 'true');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        observer.observe(mapContainer);
    }

    // GOOGLE MAP DROP-DOWN TOGGLE //
    function initMapToggle() {
        const addressToggle = document.getElementById('addressToggle');
        const mapContainer = document.getElementById('mapContainer');
        
        if (!addressToggle || !mapContainer) return;

        addressToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            
            mapContainer.classList.toggle('visible');
            
            if (!isExpanded) {
                setTimeout(() => {
                    mapContainer.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }, 100);
            }
        });
    }

    // UNDERLINE ANIMATION FOR CONTACT BUTTONS //
    function initContactButtons() {
        const buttons = document.querySelectorAll('.contact-btn');
        
        buttons.forEach((button, index) => {
            button.style.animationDelay = `${index * 0.1}s`;
        });
    }

    function initMenuInteractions() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const dots = this.querySelector('.item-dots');
                if (dots) {
                    dots.style.borderBottomStyle = 'solid';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const dots = this.querySelector('.item-dots');
                if (dots) {
                    dots.style.borderBottomStyle = 'dotted';
                }
            });
        });
    }

    // CONTEXT MENU COPY FOR CONTACT INFO //
    function initContactCopy() {
        const phoneBtn = document.querySelector('.phone-btn');
        const emailBtn = document.querySelector('.email-btn');

        if (phoneBtn) {
            phoneBtn.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                const phone = this.getAttribute('href').replace('tel:', '+44 7715 323820');
                copyToClipboard(phone, 'Phone number copied!');
            });
        }

        if (emailBtn) {
            emailBtn.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                const email = this.getAttribute('href').replace('mailto:', 'thepavilioncoffee@gmail.com');
                copyToClipboard(email, 'Email copied!');
            });
        }
    }

    function copyToClipboard(text, message) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(message);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(255, 255, 255, 0.9);
            color: #0e0e0e;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }

    function addToastAnimation() {
        if (document.querySelector('#toast-animation')) return;
        
        const style = document.createElement('style');
        style.id = 'toast-animation';
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    function init() {
        console.log('Initializing...');
        
        // Start loading screen timer
        setTimeout(hideLoadingScreen, CONFIG.loadingTime);
        
        // Initialize all features
        initHeaderScroll();
        initScrollAnimations();
        initParallax();
        initMapLazyLoad();
        initMapToggle();
        initContactButtons();
        initMenuInteractions();
        initContactCopy();
        addToastAnimation();
        
        setTimeout(() => {
            const firstElements = document.querySelectorAll('.hero .fade-in');
            firstElements.forEach(el => {
                el.classList.add('visible');
            });
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();