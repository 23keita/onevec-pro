        // Utility functions with error handling
        function throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        function safeQuerySelector(selector) {
            try {
                return document.querySelector(selector);
            } catch (error) {
                console.warn(`Erreur sélecteur: ${selector}`, error);
                return null;
            }
        }

        function safeQuerySelectorAll(selector) {
            try {
                return document.querySelectorAll(selector);
            } catch (error) {
                console.warn(`Erreur sélecteur: ${selector}`, error);
                return [];
            }
        }

        // State object for cached elements and shared data
        const appState = {
            navLinks: [],
            sections: [],
            contactSection: null,
            floatingCta: null,
            lastActiveElement: null,
        }

        // Real-time date updates with error handling
        function updateDates() {
            try {
                const now = new Date();
                const months = [
                    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                ];
                
                const currentDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
                
                safeQuerySelectorAll('.current-date').forEach(element => {
                    if (element) {
                        element.textContent = currentDate;
                    }
                });
                
                const yearElement = safeQuerySelector('#current-year');
                if (yearElement) {
                    yearElement.textContent = now.getFullYear();
                }
            } catch (error) {
                console.warn('Erreur mise à jour dates:', error);
            }
        }
        
        // Initialize dates safely
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', updateDates);
        } else {
            updateDates();
        }
        
        // Update dates every minute
        setInterval(updateDates, 60000);

        // Mobile menu toggle with error handling
        function initMobileMenu() {
            const mobileMenuBtn = safeQuerySelector('#mobile-menu-btn');
            const mobileMenu = safeQuerySelector('#mobile-menu');
            
            if (mobileMenuBtn && mobileMenu) {
                mobileMenuBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    try {
                        mobileMenu.classList.toggle('hidden');
                        const isExpanded = !mobileMenu.classList.contains('hidden');
                        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
                    } catch (error) {
                        console.warn('Erreur menu mobile:', error);
                    }
                });
            }
        }

        // Smooth scrolling with error handling
        function initSmoothScrolling() {
            safeQuerySelectorAll('a[href^="#"]').forEach(anchor => {
                if (anchor) {
                    anchor.addEventListener('click', function (e) {
                        try {
                            e.preventDefault();
                            const targetId = this.getAttribute('href');
                            const target = safeQuerySelector(targetId);
                            
                            if (target) {
                                target.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                                
                                // Close mobile menu if open
                                const mobileMenu = safeQuerySelector('#mobile-menu');
                                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                                    mobileMenu.classList.add('hidden');
                                }
                            }
                        } catch (error) {
                            console.warn('Erreur scroll:', error);
                            // Fallback to normal navigation
                            window.location.hash = this.getAttribute('href');
                        }
                    });
                }
            });
        }

        // Quote modal functions with error handling
        function openQuoteModal() {
            try {
                const modal = safeQuerySelector('#quote-modal');
                const closeBtn = safeQuerySelector('#close-quote-modal-btn');
                if (modal) {
                    appState.lastActiveElement = document.activeElement;
                    modal.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                    if (closeBtn) {
                        closeBtn.focus();
                    }
                }
            } catch (error) {
                console.warn('Erreur ouverture modal:', error);
            }
        }

        function closeQuoteModal() {
            try {
                const modal = safeQuerySelector('#quote-modal');
                if (modal) {
                    modal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                    if (appState.lastActiveElement) {
                        appState.lastActiveElement.focus();
                    }
                }
            } catch (error) {
                console.warn('Erreur fermeture modal:', error);
            }
        }

        // Initialize modal events
        function initModal() {
            const modal = safeQuerySelector('#quote-modal');
            if (modal) {
                // Close modal on background click
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        closeQuoteModal();
                    }
                });

                // Event listeners for modal buttons
                const openModalHeroBtn = safeQuerySelector('#open-quote-modal-hero');
                if (openModalHeroBtn) {
                    openModalHeroBtn.addEventListener('click', openQuoteModal);
                }
                const openModalFloatingBtn = safeQuerySelector('#open-quote-modal-floating');
                if (openModalFloatingBtn) {
                    openModalFloatingBtn.addEventListener('click', openQuoteModal);
                }
                const closeModalBtn = safeQuerySelector('#close-quote-modal-btn');
                if (closeModalBtn) {
                    closeModalBtn.addEventListener('click', closeQuoteModal);
                }
            }

            // Close modal with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeQuoteModal();
                }
            });
        }

        // Security functions with enhanced validation
        function sanitizeInput(input) {
            try {
                if (typeof input !== 'string') return '';
                return input.replace(/[<>\"'&]/g, function(match) {
                    const escapeMap = {
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#x27;',
                        '&': '&amp;'
                    };
                    return escapeMap[match];
                }).trim();
            } catch (error) {
                console.warn('Erreur sanitization:', error);
                return '';
            }
        }

        function validateInput(input, type = 'text') {
            try {
                const sanitized = sanitizeInput(input);
                
                switch(type) {
                    case 'email':
                        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitized);
                    case 'phone':
                        return /^\+?[0-9\s\-\(\)]{8,20}$/.test(sanitized);
                    case 'name':
                        return /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/.test(sanitized) && sanitized.length >= 2;
                    case 'text':
                        return sanitized.length > 0 && sanitized.length <= 1000;
                    default:
                        return sanitized.length > 0;
                }
            } catch (error) {
                console.warn('Erreur validation:', error);
                return false;
            }
        }

        // Rate limiting with localStorage fallback
        const rateLimiter = {
            attempts: new Map(),
            maxAttempts: 5,
            timeWindow: 300000,
            
            canSubmit: function(formId) {
                try {
                    const now = Date.now();
                    const key = formId + '_' + (navigator.userAgent || 'unknown').substring(0, 50);
                    
                    if (!this.attempts.has(key)) {
                        this.attempts.set(key, []);
                    }
                    
                    const attempts = this.attempts.get(key);
                    const validAttempts = attempts.filter(time => now - time < this.timeWindow);
                    this.attempts.set(key, validAttempts);
                    
                    if (validAttempts.length >= this.maxAttempts) {
                        return false;
                    }
                    
                    validAttempts.push(now);
                    return true;
                } catch (error) {
                    console.warn('Erreur rate limiting:', error);
                    return true; // Allow submission if rate limiting fails
                }
            }
        };

        function showValidationMessage(input, message, isValid = false) {
            try {
                if (!input || !input.parentNode) return;
                
                const existingMessage = input.parentNode.querySelector('.validation-message');
                if (existingMessage) {
                    existingMessage.remove();
                }

                const messageDiv = document.createElement('div');
                messageDiv.className = `validation-message text-sm mt-2 ${isValid ? 'text-green-500' : 'text-red-500'}`;
                messageDiv.innerHTML = `<i class="fas ${isValid ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-1"></i>${sanitizeInput(message)}`;
                input.parentNode.appendChild(messageDiv);

                input.style.borderColor = isValid ? '#10b981' : '#ef4444';
            } catch (error) {
                console.warn('Erreur affichage message:', error);
            }
        }

        function setupEmailValidation(emailInput) {
            if (!emailInput) return;
            
            emailInput.addEventListener('input', function() {
                try {
                    const email = this.value.trim();
                    
                    if (email === '') {
                        const existingMessage = this.parentNode.querySelector('.validation-message');
                        if (existingMessage) {
                            existingMessage.remove();
                        }
                        this.style.borderColor = '';
                        return;
                    }

                    if (validateInput(email, 'email')) {
                        showValidationMessage(this, 'Adresse email valide', true);
                    } else {
                        showValidationMessage(this, 'Veuillez entrer une adresse email valide');
                    }
                } catch (error) {
                    console.warn('Erreur validation email:', error);
                }
            });

            emailInput.addEventListener('blur', function() {
                try {
                    const email = this.value.trim();
                    if (email && !validateInput(email, 'email')) {
                        showValidationMessage(this, 'Format email incorrect (exemple: nom@domaine.com)');
                    }
                } catch (error) {
                    console.warn('Erreur blur email:', error);
                }
            });
        }

        function secureFormSubmit(form, formId) {
            try {
                if (!form) return false;
                
                if (!rateLimiter.canSubmit(formId)) {
                    alert('Trop de tentatives. Veuillez attendre 5 minutes avant de réessayer.');
                    return false;
                }

                const inputs = form.querySelectorAll('input, textarea, select');
                const formData = {};
                let isValid = true;

                inputs.forEach(input => {
                    try {
                        const value = sanitizeInput(input.value || '');
                        const fieldName = input.name || input.type || 'field';
                        
                        let validationType = 'text';
                        if (input.type === 'email') validationType = 'email';
                        else if (input.type === 'tel') validationType = 'phone';
                        else if (input.name === 'name' || (input.placeholder && input.placeholder.toLowerCase().includes('nom'))) validationType = 'name';

                        if (input.required && !validateInput(value, validationType)) {
                            isValid = false;
                            showValidationMessage(input, `${fieldName} invalide ou requis`);
                        } else if (value) {
                            formData[fieldName] = value;
                            if (input.required) {
                                showValidationMessage(input, 'Valide', true);
                            }
                        }
                    } catch (error) {
                        console.warn('Erreur validation input:', error);
                        isValid = false;
                    }
                });

                return isValid;
            } catch (error) {
                console.warn('Erreur form submit:', error);
                return false;
            }
        }

        // Form submission handlers
        function initForms() {
            const contactForm = safeQuerySelector('#contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    if (!secureFormSubmit(this, 'contact')) {
                        return;
                    }
                    
                    const submitBtn = this.querySelector('button[type="submit"]');
                    if (!submitBtn) return;
                    
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Envoi en cours...';
                    
                    setTimeout(() => {
                        try {
                            alert('Merci pour votre message ! Nous vous contacterons bientôt.\n\nNote: Ceci est un formulaire de démonstration sécurisé.');
                            this.reset();
                            this.querySelectorAll('.validation-message').forEach(msg => {
                                if (msg) msg.remove();
                            });
                            this.querySelectorAll('input, textarea').forEach(input => {
                                if (input) input.style.borderColor = '';
                            });
                        } catch (error) {
                            console.warn('Erreur reset form:', error);
                        } finally {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalText;
                        }
                    }, 2000);
                });
            }

            const quoteForm = safeQuerySelector('#quote-form');
            if (quoteForm) {
                quoteForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    if (!secureFormSubmit(this, 'quote')) {
                        return;
                    }
                    
                    const submitBtn = this.querySelector('button[type="submit"]');
                    if (!submitBtn) return;
                    
                    const originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Traitement...';
                    
                    setTimeout(() => {
                        try {
                            alert('Votre demande de devis a été reçue ! Nous vous contacterons dans les 24h.\n\nNote: Ceci est un formulaire de démonstration sécurisé.');
                            this.reset();
                            closeQuoteModal();
                        } catch (error) {
                            console.warn('Erreur quote form:', error);
                        } finally {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalText;
                        }
                    }, 2000);
                });
            }
        }

        // Navigation highlighting with throttling
        function handleScroll() {
            try {
                const scrollY = window.scrollY;
                let current = '';

                appState.sections.forEach(section => {
                    if (section) {
                        const sectionTop = section.offsetTop - 100;
                        if (scrollY >= sectionTop) {
                            current = section.getAttribute('id');
                        }
                    }
                });

                appState.navLinks.forEach(link => {
                    if (link) {
                        link.classList.remove('active');
                        const href = link.getAttribute('href');
                        if (href === `#${current}`) {
                            link.classList.add('active');
                        }
                    }
                });

                // Handle floating CTA visibility using classes for better performance
                if (appState.contactSection && appState.floatingCta) {
                    const contactSectionTop = appState.contactSection.getBoundingClientRect().top;
                    if (contactSectionTop < window.innerHeight) {
                        appState.floatingCta.classList.add('hidden');
                    } else {
                        appState.floatingCta.classList.remove('hidden');
                    }
                }
            } catch (error) {
                console.warn('Erreur scroll handler:', error);
            }
        }

        // Intersection Observer for animations with error handling
        function initAnimations() {
            try {
                if (!('IntersectionObserver' in window)) {
                    // Fallback for older browsers: just make them visible
                    safeQuerySelectorAll('.ig-fade-in, .ig-slide-up').forEach(el => {
                        if (el) {
                            el.style.transform = 'translateY(0)';
                        }
                    });
                    return;
                }

                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        try {
                            if (entry.isIntersecting && entry.target) {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translateY(0)';
                            }
                        } catch (error) {
                            console.warn('Erreur animation observer:', error);
                        }
                    });
                }, observerOptions);

                // Observe all animated elements
                safeQuerySelectorAll('.ig-fade-in, .ig-slide-up').forEach(el => {
                    if (el) {
                        el.style.opacity = '0';
                        el.style.transform = 'translateY(20px)';
                        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        observer.observe(el);
                    }
                });
            } catch (error) {
                console.warn('Erreur init animations:', error);
            }
        }

        // Global error handlers
        window.addEventListener('error', function(e) {
            console.error('Erreur JavaScript:', e.error);
            return true;
        });

        window.addEventListener('unhandledrejection', function(e) {
            console.error('Promise rejetée:', e.reason);
            e.preventDefault();
        });

        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(function() {
                    try {
                        const perfData = performance.getEntriesByType('navigation')[0];
                        if (perfData && perfData.loadEventEnd > 3000) {
                            console.warn('Page lente à charger:', perfData.loadEventEnd + 'ms');
                        }
                    } catch (error) {
                        console.warn('Erreur performance monitoring:', error);
                    }
                }, 100);
            });
        }

        // Initialize everything when DOM is ready
        function initializeApp() {
            try {
                // Cache DOM elements for performance
                appState.navLinks = safeQuerySelectorAll('.ig-nav-link');
                appState.sections = safeQuerySelectorAll('section[id]');
                appState.contactSection = safeQuerySelector('#contact');
                appState.floatingCta = safeQuerySelector('.ig-floating-cta');

                initMobileMenu();
                initSmoothScrolling();
                initModal();
                initForms();
                initAnimations();

                // Setup email validation
                const contactEmailInput = safeQuerySelector('#contact-form input[type="email"]');
                setupEmailValidation(contactEmailInput);

                // Add scroll listener with throttling
                const throttledScrollHandler = throttle(handleScroll, 150);
                window.addEventListener('scroll', throttledScrollHandler, { passive: true });

                // Initial call to set correct state on load
                handleScroll();

                console.log('Application initialisée avec succès');
            } catch (error) {
                console.error('Erreur initialisation:', error);
            }
        }

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
        } else {
            initializeApp();
        }