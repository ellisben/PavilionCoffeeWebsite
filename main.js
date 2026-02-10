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

    // Header transparency on scroll with blur effect
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

    // Lazy load Google Maps iframe for better performance
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

    // Toggle map dropdown when address is clicked
    function initMapToggle() {
        const addressToggle = document.getElementById('addressToggle');
        const mapContainer = document.getElementById('mapContainer');
        
        if (!addressToggle || !mapContainer) return;

        addressToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle expanded state
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle map visibility
            mapContainer.classList.toggle('visible');
            
            // Smooth scroll to map if opening
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

    // Add smooth reveal animation to contact buttons
    function initContactButtons() {
        const buttons = document.querySelectorAll('.contact-btn');
        
        buttons.forEach((button, index) => {
            // Add staggered animation
            button.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Enhanced menu item interactions
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

    // Add click-to-copy functionality for contact info
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

    // Helper function to copy text to clipboard
    function copyToClipboard(text, message) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(message);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }

    // Show a subtle toast notification
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

    // Add CSS animation for toast
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

    // Initialize on page load
    function init() {
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
