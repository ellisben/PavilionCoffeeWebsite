(function() {
    'use strict';

    const EVENT_CONFIG = {
        eventName: 'Broomfields Lunch',                    
        eventDateText: '24/07/2026',       
        orderDeadlineText: '22/07/2026', 
        orderEmail: 'bigboyben2152@gmail.com',    
        web3FormsAccessKey: 'db27c909-0d0c-4982-9715-7613b24a88fd' 
    };

    const CONFIG = {
        loadingTime: 1200,
        scrollThreshold: 50,
        observerMargin: '0px',
        observerThreshold: 0.01,
        revealFallbackTime: 1800
    };

    let ticking = false;

    // ---- LOADING SCREEN ----
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        loadingScreen.classList.add('fade-out');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        setTimeout(function() {
            if (loadingScreen && loadingScreen.parentNode) {
                loadingScreen.remove();
            }
        }, 500);
    }

    // ---- HEADER ON SCROLL ----
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

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateHeader();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        updateHeader();
    }

    // ---- FADE-IN ON SCROLL ----
    function initScrollAnimations() {
        const options = {
            root: null,
            rootMargin: CONFIG.observerMargin,
            threshold: CONFIG.observerThreshold
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.fade-in').forEach(function(el) {
            observer.observe(el);
        });
    }

    // ---- SAFETY NET: force-reveal any fade-in element that never triggered ----
    // Guards against IntersectionObserver edge cases on certain devices/browsers
    // (e.g. very tall sections, older browser quirks) leaving content invisible.
    function initRevealFallback() {
        setTimeout(function() {
            document.querySelectorAll('.fade-in:not(.visible)').forEach(function(el) {
                el.classList.add('visible');
            });
        }, CONFIG.revealFallbackTime);
    }

    // ---- TOAST ----
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = [
            'position: fixed',
            'bottom: 90px',
            'left: 50%',
            'transform: translateX(-50%)',
            'background-color: rgba(255, 255, 255, 0.95)',
            'color: #0e0e0e',
            'padding: 12px 24px',
            'border-radius: 4px',
            'font-size: 14px',
            'font-weight: 600',
            'z-index: 10001',
            'animation: fadeInOut 2.4s ease-in-out'
        ].join(';');

        document.body.appendChild(toast);
        setTimeout(function() {
            toast.remove();
        }, 2400);
    }

    function addToastAnimation() {
        if (document.querySelector('#toast-animation')) return;

        const style = document.createElement('style');
        style.id = 'toast-animation';
        style.textContent = '@keyframes fadeInOut {' +
            '0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }' +
            '10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }' +
            '}';
        document.head.appendChild(style);
    }

    // ---- HELPERS ----
    function formatCurrency(value) {
        return '£' + value.toFixed(2);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getOrderItems() {
        const items = [];
        document.querySelectorAll('.order-item').forEach(function(el) {
            const qtyInput = el.querySelector('.qty-input');
            const qty = parseInt(qtyInput.value, 10) || 0;
            if (qty > 0) {
                let name = el.getAttribute('data-name');
                const breadSelect = el.querySelector('.bread-select');
                const sauceSelect = el.querySelector('.sauce-select');
                const optionParts = [];
                if (breadSelect) optionParts.push(breadSelect.value);
                if (sauceSelect) optionParts.push(sauceSelect.value);
                if (optionParts.length > 0) {
                    name += ' (' + optionParts.join(', ') + ')';
                }
                items.push({
                    name: name,
                    price: parseFloat(el.getAttribute('data-price')) || 0,
                    qty: qty
                });
            }
        });
        return items;
    }

    // ---- LIVE ORDER SUMMARY ----
    function updateSummary() {
        const items = getOrderItems();
        const summaryItemsEl = document.getElementById('summaryItems');
        const summaryTotalEl = document.getElementById('summaryTotal');
        const orderBar = document.getElementById('orderBar');
        const orderBarCount = document.getElementById('orderBarCount');
        const orderBarTotal = document.getElementById('orderBarTotal');

        let total = 0;
        let count = 0;

        if (items.length === 0) {
            summaryItemsEl.innerHTML = '<p class="summary-empty">No items selected yet</p>';
        } else {
            summaryItemsEl.innerHTML = items.map(function(item) {
                const lineTotal = item.price * item.qty;
                total += lineTotal;
                count += item.qty;
                return '<div class="summary-row"><span class="summary-item-name">' +
                    escapeHtml(item.name) + '<span class="summary-qty">x' + item.qty + '</span></span>' +
                    '<span class="summary-item-price">' + formatCurrency(lineTotal) + '</span></div>';
            }).join('');
        }

        summaryTotalEl.textContent = formatCurrency(total);

        if (orderBar) {
            if (count > 0) {
                orderBar.hidden = false;
                document.body.classList.add('order-bar-active');
                orderBarCount.textContent = count + (count === 1 ? ' item' : ' items');
                orderBarTotal.textContent = formatCurrency(total);
            } else {
                orderBar.hidden = true;
                document.body.classList.remove('order-bar-active');
            }
        }
    }

    // ---- QUANTITY STEPPERS ----
    function initQuantitySteppers() {
        document.querySelectorAll('.order-item').forEach(function(item) {
            const input = item.querySelector('.qty-input');
            const minusBtn = item.querySelector('.qty-minus');
            const plusBtn = item.querySelector('.qty-plus');

            minusBtn.addEventListener('click', function() {
                const current = parseInt(input.value, 10) || 0;
                input.value = Math.max(0, current - 1);
                updateSummary();
            });

            plusBtn.addEventListener('click', function() {
                const current = parseInt(input.value, 10) || 0;
                input.value = Math.min(99, current + 1);
                updateSummary();
            });

            input.addEventListener('input', function() {
                let val = parseInt(input.value, 10);
                if (isNaN(val) || val < 0) val = 0;
                if (val > 99) val = 99;
                input.value = val;
                updateSummary();
            });
        });
    }

    // ---- BUILD ORDER TEXT ----
    function buildOrderText() {
        const items = getOrderItems();
        const name = document.getElementById('orderName').value.trim();
        const groupInput = document.getElementById('orderGroup');
        const group = groupInput ? groupInput.value.trim() : '';
        const email = document.getElementById('orderEmail').value.trim();
        const timeInput = document.getElementById('orderTime');
        const time = timeInput ? timeInput.value.trim() : '';
        const allergens = Array.prototype.slice.call(document.querySelectorAll('input[name="allergen"]:checked'))
            .map(function(el) { return el.value; });
        const notes = document.getElementById('dietaryNotes').value.trim();

        let total = 0;
        const lines = [];

        lines.push(EVENT_CONFIG.eventName.toUpperCase() + ' PRE-ORDER');
        lines.push('The Pavilion Coffee');
        lines.push('');
        lines.push('Name: ' + name);
        if (group) lines.push('Department / Year Group: ' + group);
        if (email) lines.push('Email: ' + email);
        if (time) lines.push('Preferred collection time: ' + time);
        lines.push('');
        lines.push('ITEMS ORDERED');

        if (items.length === 0) {
            lines.push('(no items selected)');
        } else {
            items.forEach(function(item) {
                const lineTotal = item.price * item.qty;
                total += lineTotal;
                const priceText = item.price > 0 ? formatCurrency(lineTotal) : '(price confirmed in store)';
                lines.push('- ' + item.name + '  x' + item.qty + '  ' + priceText);
            });
        }

        lines.push('');
        lines.push('TOTAL: ' + formatCurrency(total));

        if (allergens.length > 0 || notes) {
            lines.push('');
            if (allergens.length > 0) {
                lines.push('Allergens / dietary requirements: ' + allergens.join(', '));
            }
            if (notes) {
                lines.push('Additional notes: ' + notes);
            }
        }

        return lines.join('\n');
    }

    // ---- VALIDATION ----
    function validateForm() {
        const name = document.getElementById('orderName').value.trim();
        const items = getOrderItems();
        const errorEl = document.getElementById('formError');

        if (!name) {
            errorEl.textContent = 'Please enter your name so we know who the order is for.';
            document.getElementById('orderName').focus();
            return false;
        }
        if (items.length === 0) {
            errorEl.textContent = 'Please select at least one item before submitting.';
            return false;
        }
        errorEl.textContent = '';
        return true;
    }

    // ---- SUBMIT (Web3Forms) ----
    function initFormSubmit() {
        const form = document.getElementById('orderForm');
        const confirmationPanel = document.getElementById('confirmationPanel');
        const submitBtn = document.getElementById('submitOrderBtn');
        const errorEl = document.getElementById('formError');

        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm()) return;

            const name = document.getElementById('orderName').value.trim();
            const email = document.getElementById('orderEmail').value.trim();
            const orderText = buildOrderText();
            const subject = EVENT_CONFIG.eventName + ' Pre-Order - ' + name;
            const botcheckEl = form.querySelector('[name="botcheck"]');

            const payload = {
                access_key: EVENT_CONFIG.web3FormsAccessKey,
                subject: subject,
                from_name: name,
                message: orderText,
                botcheck: botcheckEl ? botcheckEl.checked : false
            };
            if (email) {
                payload.email = email;
                payload.replyto = email;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
            errorEl.textContent = '';
            if (confirmationPanel) confirmationPanel.hidden = true;

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            })
                .then(function(response) {
                    return response.json().then(function(data) {
                        return { ok: response.ok, data: data };
                    });
                })
                .then(function(result) {
                    if (result.ok && result.data && result.data.success) {
                        if (confirmationPanel) {
                            confirmationPanel.textContent = 'Thanks — your order has been sent to us.';
                            confirmationPanel.hidden = false;
                            confirmationPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        showToast('Order sent!');
                        form.reset();
                        updateSummary();
                    } else {
                        errorEl.textContent = 'Something went wrong sending your order. Please try again, or email us directly at ' + EVENT_CONFIG.orderEmail + '.';
                    }
                })
                .catch(function() {
                    errorEl.textContent = 'Could not send your order — please check your connection and try again, or email us directly at ' + EVENT_CONFIG.orderEmail + '.';
                })
                .finally(function() {
                    submitBtn.textContent = 'Send Order';
                    submitBtn.disabled = false;
                });
        });
    }

    // ---- ORDER BAR JUMP LINK ----
    function initOrderBar() {
        const jumpBtn = document.getElementById('orderBarJump');
        if (!jumpBtn) return;

        jumpBtn.addEventListener('click', function() {
            const summary = document.getElementById('orderSummary');
            if (summary) {
                summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // ---- INJECT EVENT DETAILS ----
    function injectEventConfig() {
        document.querySelectorAll('[data-event-date]').forEach(function(el) {
            el.textContent = EVENT_CONFIG.eventDateText;
        });
        document.querySelectorAll('[data-order-deadline]').forEach(function(el) {
            el.textContent = EVENT_CONFIG.orderDeadlineText;
        });
    }

    function init() {
        setTimeout(hideLoadingScreen, CONFIG.loadingTime);

        injectEventConfig();
        initHeaderScroll();
        initScrollAnimations();
        initRevealFallback();
        initQuantitySteppers();
        initFormSubmit();
        initOrderBar();
        addToastAnimation();
        updateSummary();

        setTimeout(function() {
            document.querySelectorAll('.order-hero .fade-in').forEach(function(el) {
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