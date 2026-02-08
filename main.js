// scripts/main.js
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        parallaxStrength: 0.03,
        observerMargin: '-50px',
        observerThreshold: 0.15,
        scrollThreshold: 50
    };

    // State
    let ticking = false;

    // Header transparency on scroll
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

        // Initial call
        updateHeader();
    }

    // Intersection Observer for fade-in animations
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
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all fade-in elements
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(el => observer.observe(el));
    }

    // Subtle parallax effect on images
    function initParallax() {
        const images = document.querySelectorAll('.hero-image, .menu-image, .footer-image');
        if (images.length === 0) return;

        function updateParallax() {
            const viewportHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;

            images.forEach(img => {
                const rect = img.getBoundingClientRect();
                
                // Only apply parallax when element is in viewport
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

        // Initial call
        updateParallax();
    }

    // Initialize on page load
    function init() {
        // Initialize all features
        initHeaderScroll();
        initScrollAnimations();
        initParallax();
        
        // Show first elements immediately
        setTimeout(() => {
            const firstElements = document.querySelectorAll('.hero .fade-in');
            firstElements.forEach(el => {
                el.classList.add('visible');
            });
        }, 100);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();