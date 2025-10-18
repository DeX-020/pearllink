/* ========================================
   PEARLLINK - CONSOLIDATED JAVASCRIPT
   Business Marketplace - Clean & Organized
   ======================================== */

// ========================================
// 1. ERROR HANDLING & UTILITIES
// ========================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    showNotification('A network error occurred. Please check your connection.', 'error');
});

// Utility functions
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

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Highlight/animate elements
function microHighlight(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) {
        el.classList.remove('toggle-highlight');
        // Restart animation
        void el.offsetWidth;
        el.classList.add('toggle-highlight');
    }
}

// Microinteraction progress bar (top-line loader)
function showProgressBar() {
    if (!document.getElementById('page-progress-bar')) {
        const bar = document.createElement('div');
        bar.className = 'loading-progress-bar';
        bar.id = 'page-progress-bar';
        document.body.appendChild(bar);
    }
}
function hideProgressBar() {
    const bar = document.getElementById('page-progress-bar');
    if (bar) bar.remove();
}

// ========================================
// 2. MAIN PEARLLINK APPLICATION CLASS
// ========================================

class PearllinkApp {
    constructor() {
        this.currentUser = null;
        this.businesses = [];
        this.filteredBusinesses = [];
        this.currentPage = 1;
        this.businessesPerPage = 9;
        this.isKeyboardNavigation = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupAccessibilityFeatures();
        this.loadSampleBusinesses();
        this.setupAnimations();
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupSearchAndFilters();
        this.setupPerformanceMonitoring();
        
        console.log('✅ Pearllink App initialized successfully');
    }

    // ========================================
    // 3. EVENT LISTENERS & NAVIGATION
    // ========================================

    setupEventListeners() {
        // Navigation scroll effect with throttling
        window.addEventListener('scroll', throttle(() => {
            this.handleScroll();
        }, 16));

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Focus management for screen readers
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });

        // Mobile menu toggle with ARIA updates
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navMenu.classList.contains('active');
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', !isExpanded);
                
                // Focus management
                if (!isExpanded) {
                    const firstLink = navMenu.querySelector('.nav-link');
                    if (firstLink) firstLink.focus();
                }
            });
        }

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Hero buttons
        const browseBusinessesBtn = document.getElementById('browseBusinesses');
        const sellBusinessBtn = document.getElementById('sellBusiness');
        
        if (browseBusinessesBtn) {
            browseBusinessesBtn.addEventListener('click', () => {
                this.scrollToSection('browse');
            });
        }
        
        if (sellBusinessBtn) {
            sellBusinessBtn.addEventListener('click', () => {
                this.scrollToSection('sell');
            });
        }

        // Keyboard navigation detection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.isKeyboardNavigation = true;
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            this.isKeyboardNavigation = false;
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupKeyboardNavigation() {
        // Arrow key navigation for business listings
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const businessListings = document.querySelectorAll('.business-listing');
                if (businessListings.length > 0) {
                    e.preventDefault();
                    this.navigateBusinessListings(e.key === 'ArrowDown' ? 1 : -1);
                }
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="block"]');
                if (openModal) {
                    this.hideModal(openModal.id);
                }
            }
        });
    }

    navigateBusinessListings(direction) {
        const businessListings = Array.from(document.querySelectorAll('.business-listing'));
        const currentFocused = document.activeElement.closest('.business-listing');
        
        if (currentFocused) {
            const currentIndex = businessListings.indexOf(currentFocused);
            const nextIndex = currentIndex + direction;
            
            if (nextIndex >= 0 && nextIndex < businessListings.length) {
                const nextListing = businessListings[nextIndex];
                const focusableElement = nextListing.querySelector('button, a, input, select, textarea');
                if (focusableElement) {
                    focusableElement.focus();
                }
            }
        } else if (businessListings.length > 0) {
            // Focus first listing if none is focused
            const firstListing = businessListings[0];
            const focusableElement = firstListing.querySelector('button, a, input, select, textarea');
            if (focusableElement) {
                focusableElement.focus();
            }
        }
    }

    // ========================================
    // 4. ACCESSIBILITY FEATURES
    // ========================================

    setupAccessibilityFeatures() {
        this.setupLiveRegions();
        this.setupFocusManagement();
        this.setupHighContrastMode();
        this.setupReducedMotion();
    }

    setupLiveRegions() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal[style*="block"]');
                if (modal) {
                    this.trapFocusInModal(e, modal);
                }
            }
        });
    }

    trapFocusInModal(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    setupHighContrastMode() {
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        if (window.matchMedia) {
            window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
                if (e.matches) {
                    document.body.classList.add('high-contrast');
                } else {
                    document.body.classList.remove('high-contrast');
                }
            });
        }
    }

    setupReducedMotion() {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }

        if (window.matchMedia) {
            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
                if (e.matches) {
                    document.body.classList.add('reduced-motion');
                } else {
                    document.body.classList.remove('reduced-motion');
                }
            });
        }
    }

    // ========================================
    // 5. SCROLL & NAVIGATION HANDLING
    // ========================================

    handleScroll() {
        const navbar = document.getElementById('navbar');
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        this.updateActiveNavLink();
        this.triggerAnimations();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // ========================================
    // 6. ANIMATIONS & INTERSECTIONS
    // ========================================

    setupAnimations() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!prefersReducedMotion) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);

            // Observe elements for animation
            document.querySelectorAll('.feature-card').forEach((el, index) => {
                el.classList.add('bounce-in');
                el.style.transitionDelay = `${index * 0.1}s`;
                observer.observe(el);
            });

            document.querySelectorAll('.business-listing').forEach((el, index) => {
                el.classList.add('fade-in');
                el.style.transitionDelay = `${index * 0.1}s`;
                observer.observe(el);
            });

            document.querySelectorAll('.about-card').forEach((el, index) => {
                el.classList.add('scale-in');
                el.style.transitionDelay = `${index * 0.1}s`;
                observer.observe(el);
            });

            document.querySelectorAll('.hero-text').forEach(el => {
                el.classList.add('slide-in-left');
                observer.observe(el);
            });

            document.querySelectorAll('.hero-visual').forEach(el => {
                el.classList.add('slide-in-right');
                observer.observe(el);
            });

            // Add animations to stats
            document.querySelectorAll('.stat').forEach((el, index) => {
                el.classList.add('rotate-in');
                el.style.transitionDelay = `${index * 0.2}s`;
                observer.observe(el);
            });
        }
    }

    triggerAnimations() {
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setTimeout(() => {
                document.querySelectorAll('.hero-text, .hero-visual').forEach(el => {
                    el.classList.add('visible');
                });
            }, 300);
        }
    }

    // ========================================
    // 7. MODAL MANAGEMENT
    // ========================================

    setupModals() {
        // Login modal
        const loginBtn = document.getElementById('loginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeLogin = document.getElementById('closeLogin');
        const switchToSignup = document.getElementById('switchToSignup');

        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                this.showModal('loginModal');
            });
        }

        if (closeLogin) {
            closeLogin.addEventListener('click', () => {
                this.hideModal('loginModal');
            });
        }

        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('loginModal');
                this.showModal('signupModal');
            });
        }

        // Signup modal
        const signupBtn = document.getElementById('signupBtn');
        const signupModal = document.getElementById('signupModal');
        const closeSignup = document.getElementById('closeSignup');
        const switchToLogin = document.getElementById('switchToLogin');

        if (signupBtn && signupModal) {
            signupBtn.addEventListener('click', () => {
                this.showModal('signupModal');
            });
        }

        if (closeSignup) {
            closeSignup.addEventListener('click', () => {
                this.hideModal('signupModal');
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('signupModal');
                this.showModal('loginModal');
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus first focusable element
            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Announce modal opening
            this.announceToScreenReader(`${modalId.replace('Modal', '')} modal opened`);
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            
            // Return focus to trigger element
            const triggerElement = document.querySelector(`[aria-controls="${modalId}"]`);
            if (triggerElement) {
                triggerElement.focus();
            }
            
            // Announce modal closing
            this.announceToScreenReader(`${modalId.replace('Modal', '')} modal closed`);
        }
    }

    // ========================================
    // 8. FORM HANDLING & VALIDATION
    // ========================================

    setupForms() {
        // Enhanced form validation and accessibility
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Real-time validation and progress tracking
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                    this.updateFormProgress(form);
                });

                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                    this.updateFormProgress(form);
                });

                input.addEventListener('focus', () => {
                    this.highlightFormGroup(input);
                });
            });
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(e);
            });
        }

        // Sell business form
        const sellBusinessForm = document.getElementById('sellBusinessForm');
        if (sellBusinessForm) {
            sellBusinessForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSellBusinessForm(e);
            });
        }

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm(e);
            });
        }

        // Start selling button
        const startSellingBtn = document.getElementById('startSelling');
        if (startSellingBtn) {
            startSellingBtn.addEventListener('click', () => {
                this.scrollToSection('sell');
            });
        }
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        // Add submitting class to form
        form.classList.add('submitting');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // Remove submitting class after validation
        setTimeout(() => {
            form.classList.remove('submitting');
        }, 100);
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';

        // Only validate if field has content or if it's being submitted
        const isBeingSubmitted = field.form && field.form.classList.contains('submitting');
        
        // Required field validation
        if (field.hasAttribute('required') && !value && isBeingSubmitted) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (fieldType === 'password' && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            }
        }

        // Confirm password validation
        if (field.id === 'signupConfirmPassword' && value) {
            const passwordField = document.getElementById('signupPassword');
            if (passwordField && passwordField.value !== value) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }
        }

        // Show/hide error
        if (isValid) {
            this.clearFieldError(field);
        } else {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.setAttribute('aria-invalid', 'true');
        field.classList.add('error');
        field.classList.remove('success');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorDiv);
        
        // Announce error to screen readers
        this.announceToScreenReader(`Error: ${message}`);
    }

    clearFieldError(field) {
        field.removeAttribute('aria-invalid');
        field.classList.remove('error');
        
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        // Add success state if field has value
        if (field.value.trim()) {
            field.classList.add('success');
        } else {
            field.classList.remove('success');
        }
    }

    updateFormProgress(form) {
        const progressBar = form.querySelector('.form-progress-bar');
        if (!progressBar) return;

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
        const progress = (filledInputs.length / inputs.length) * 100;

        progressBar.style.width = `${progress}%`;
        
        // Add animation class for smooth transition
        progressBar.style.transition = 'width 0.5s ease';
    }

    highlightFormGroup(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            // Remove highlight from other groups
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('highlighted');
            });
            
            // Add highlight to current group
            formGroup.classList.add('highlighted');
            
            // Remove highlight after a delay
            setTimeout(() => {
                formGroup.classList.remove('highlighted');
            }, 2000);
        }
    }

    // ========================================
    // 9. FORM SUBMISSION HANDLERS
    // ========================================

    async handleLogin(e) {
        this.showLoading();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await simulateDelay(1000);
            
            this.currentUser = {
                id: 1,
                email: email,
                name: 'John Doe'
            };
            
            this.hideLoading();
            this.hideModal('loginModal');
            this.showNotification('Login successful!', 'success');
            this.updateAuthUI();
            this.announceToScreenReader('Login successful');
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Login failed. Please try again.', 'error');
            this.announceToScreenReader('Login failed');
        }
    }

    async handleSignup(e) {
        this.showLoading();
        
        const firstName = document.getElementById('signupFirstName').value;
        const lastName = document.getElementById('signupLastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
            this.hideLoading();
            this.showNotification('Passwords do not match.', 'error');
            return;
        }
        
        try {
            await simulateDelay(1500);
            
            this.currentUser = {
                id: Date.now(),
                email: email,
                name: `${firstName} ${lastName}`
            };
            
            this.hideLoading();
            this.hideModal('signupModal');
            this.showNotification('Account created successfully!', 'success');
            this.updateAuthUI();
            this.announceToScreenReader('Account created successfully');
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Signup failed. Please try again.', 'error');
            this.announceToScreenReader('Signup failed');
        }
    }

    async handleSellBusinessForm(e) {
        this.showLoading();
        
        const formData = {
            name: document.getElementById('businessName').value,
            industry: document.getElementById('businessIndustry').value,
            revenue: document.getElementById('annualRevenue').value,
            years: document.getElementById('yearsInBusiness').value
        };
        
        try {
            await simulateDelay(2000);
            
            this.hideLoading();
            this.showNotification('Thank you! We\'ll contact you within 24 hours with your free valuation.', 'success');
            this.announceToScreenReader('Business valuation request submitted successfully');
            e.target.reset();
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Submission failed. Please try again.', 'error');
            this.announceToScreenReader('Submission failed');
        }
    }

    async handleContactForm(e) {
        this.showLoading();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        try {
            await simulateDelay(1500);
            
            this.hideLoading();
            this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            this.announceToScreenReader('Message sent successfully');
            e.target.reset();
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Message failed to send. Please try again.', 'error');
            this.announceToScreenReader('Message failed to send');
        }
    }

    // ========================================
    // 10. SEARCH & FILTER FUNCTIONALITY
    // ========================================

    setupSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        const industryFilter = document.getElementById('industryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const locationFilter = document.getElementById('locationFilter');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        // Search functionality with debouncing
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.filterBusinesses();
            }, 300));
        }
        
        // Filter functionality
        [industryFilter, priceFilter, locationFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => {
                    this.filterBusinesses();
                });
            }
        });
        
        // Load more functionality
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreBusinesses();
            });
        }
    }

    filterBusinesses() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const industryFilter = document.getElementById('industryFilter')?.value || '';
        const priceFilter = document.getElementById('priceFilter')?.value || '';
        const locationFilter = document.getElementById('locationFilter')?.value || '';
        
        this.filteredBusinesses = this.businesses.filter(business => {
            const matchesSearch = business.title.toLowerCase().includes(searchTerm) ||
                                business.description.toLowerCase().includes(searchTerm) ||
                                business.location.toLowerCase().includes(searchTerm);
            
            const matchesIndustry = !industryFilter || business.industry === industryFilter;
            const matchesPrice = !priceFilter || this.matchesPriceRange(business.price, priceFilter);
            const matchesLocation = !locationFilter || this.matchesLocation(business.location, locationFilter);
            
            return matchesSearch && matchesIndustry && matchesPrice && matchesLocation;
        });
        
        this.currentPage = 1;
        this.renderBusinesses();
        
        // Announce results to screen readers
        const resultCount = this.filteredBusinesses.length;
        this.announceToScreenReader(`${resultCount} businesses found`);
    }

    matchesPriceRange(price, range) {
        switch (range) {
            case '0-100000':
                return price < 100000;
            case '100000-500000':
                return price >= 100000 && price <= 500000;
            case '500000-1000000':
                return price > 500000 && price <= 1000000;
            case '1000000+':
                return price > 1000000;
            default:
                return true;
        }
    }

    matchesLocation(location, filter) {
        const locationMap = {
            'us': ['CA', 'NY', 'TX', 'FL', 'WA', 'MI', 'AZ', 'CO', 'MA'],
            'canada': ['ON', 'BC', 'AB', 'QC'],
            'uk': ['London', 'Manchester', 'Birmingham'],
            'australia': ['Sydney', 'Melbourne', 'Brisbane']
        };
        
        if (!locationMap[filter]) return true;
        
        return locationMap[filter].some(region => location.includes(region));
    }

    // ========================================
    // 11. BUSINESS DATA & RENDERING
    // ========================================

    loadSampleBusinesses() {
        this.businesses = [
            {
                id: 1,
                title: "Tech Startup SaaS Platform",
                industry: "technology",
                price: 2500000,
                location: "San Francisco, CA",
                description: "Profitable SaaS platform with 10,000+ active users and recurring revenue of $500K annually.",
                revenue: 500000,
                employees: 15,
                yearsInBusiness: 3,
                roi: 25,
                image: "fas fa-laptop-code",
                featured: true
            },
            {
                id: 2,
                title: "Boutique Coffee Chain",
                industry: "restaurant",
                price: 850000,
                location: "Seattle, WA",
                description: "Established coffee chain with 5 locations and loyal customer base.",
                revenue: 1200000,
                employees: 45,
                yearsInBusiness: 8,
                roi: 18,
                image: "fas fa-coffee",
                featured: true
            },
            {
                id: 3,
                title: "E-commerce Fashion Store",
                industry: "retail",
                price: 450000,
                location: "Los Angeles, CA",
                description: "Online fashion retailer with strong social media presence and growing sales.",
                revenue: 800000,
                employees: 8,
                yearsInBusiness: 4,
                roi: 22,
                image: "fas fa-shopping-bag",
                featured: false
            },
            {
                id: 4,
                title: "Manufacturing Company",
                industry: "manufacturing",
                price: 3200000,
                location: "Detroit, MI",
                description: "Established manufacturing company specializing in automotive parts.",
                revenue: 4500000,
                employees: 120,
                yearsInBusiness: 15,
                roi: 12,
                image: "fas fa-industry",
                featured: true
            },
            {
                id: 5,
                title: "Digital Marketing Agency",
                industry: "services",
                price: 650000,
                location: "Austin, TX",
                description: "Full-service digital marketing agency with Fortune 500 clients.",
                revenue: 950000,
                employees: 25,
                yearsInBusiness: 6,
                roi: 20,
                image: "fas fa-bullhorn",
                featured: false
            },
            {
                id: 6,
                title: "Restaurant Franchise",
                industry: "restaurant",
                price: 1200000,
                location: "Miami, FL",
                description: "Popular restaurant franchise with prime location and established customer base.",
                revenue: 1800000,
                employees: 35,
                yearsInBusiness: 10,
                roi: 15,
                image: "fas fa-utensils",
                featured: true
            },
            {
                id: 7,
                title: "Fitness Studio Chain",
                industry: "services",
                price: 750000,
                location: "Denver, CO",
                description: "Modern fitness studio chain with 3 locations and growing membership base.",
                revenue: 1100000,
                employees: 30,
                yearsInBusiness: 5,
                roi: 19,
                image: "fas fa-dumbbell",
                featured: false
            },
            {
                id: 8,
                title: "Construction Company",
                industry: "manufacturing",
                price: 2800000,
                location: "Phoenix, AZ",
                description: "Established construction company with government contracts and steady revenue.",
                revenue: 3800000,
                employees: 85,
                yearsInBusiness: 12,
                roi: 14,
                image: "fas fa-hard-hat",
                featured: false
            },
            {
                id: 9,
                title: "Mobile App Development",
                industry: "technology",
                price: 950000,
                location: "Boston, MA",
                description: "Mobile app development company with successful apps in app stores.",
                revenue: 750000,
                employees: 12,
                yearsInBusiness: 4,
                roi: 28,
                image: "fas fa-mobile-alt",
                featured: true
            }
        ];
        
        this.filteredBusinesses = [...this.businesses];
        this.renderBusinesses();
    }

    renderBusinesses() {
        const businessesGrid = document.getElementById('businessesGrid');
        if (!businessesGrid) return;
        
        const startIndex = (this.currentPage - 1) * this.businessesPerPage;
        const endIndex = startIndex + this.businessesPerPage;
        const businessesToShow = this.filteredBusinesses.slice(startIndex, endIndex);
        
        // Show skeleton loading first
        this.showSkeletonLoading(businessesGrid, businessesToShow.length);
        
        // Then render actual content after a short delay
        setTimeout(() => {
            businessesGrid.innerHTML = businessesToShow.map(business => this.createBusinessCard(business)).join('');
            
            // Re-observe new elements for animations
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                        }
                    });
                }, { threshold: 0.1 });
                
                businessesGrid.querySelectorAll('.business-listing').forEach(el => {
                    el.classList.add('fade-in');
                    observer.observe(el);
                });
            }
        }, 500);
        
        // Update load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            const hasMore = endIndex < this.filteredBusinesses.length;
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
        }
    }

    showSkeletonLoading(container, count) {
        const skeletonCards = Array.from({ length: count }, () => `
            <div class="skeleton-card">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        `).join('');
        
        container.innerHTML = skeletonCards;
    }

    createBusinessCard(business) {
        const formattedPrice = this.formatCurrency(business.price);
        const formattedRevenue = this.formatCurrency(business.revenue);
        
        return `
            <div class="business-listing" data-business-id="${business.id}" role="listitem">
                <div class="business-image">
                    <i class="${business.image}" aria-hidden="true"></i>
                </div>
                <div class="business-content">
                    <div class="business-header">
                        <div>
                            <div class="business-title">${business.title}</div>
                            <div class="business-industry">${this.formatIndustry(business.industry)}</div>
                        </div>
                        <div class="business-price">${formattedPrice}</div>
                    </div>
                    <p class="business-description">${business.description}</p>
                    <div class="business-stats">
                        <div class="stat-item">
                            <i class="fas fa-dollar-sign" aria-hidden="true"></i>
                            <span>Revenue: ${formattedRevenue}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-users" aria-hidden="true"></i>
                            <span>${business.employees} employees</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-calendar" aria-hidden="true"></i>
                            <span>${business.yearsInBusiness} years</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-chart-line" aria-hidden="true"></i>
                            <span>${business.roi}% ROI</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                            <span>${business.location}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-star" aria-hidden="true"></i>
                            <span>${business.featured ? 'Featured' : 'Standard'}</span>
                        </div>
                    </div>
                    <div class="business-actions">
                        <button class="btn-primary btn-small" onclick="app.viewBusiness(${business.id})" aria-label="View details for ${business.title}">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                            View Details
                        </button>
                        <button class="btn-secondary btn-small" onclick="app.contactSeller(${business.id})" aria-label="Contact seller for ${business.title}">
                            <i class="fas fa-envelope" aria-hidden="true"></i>
                            Contact Seller
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Enhanced search and filter functionality
    setupSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        const industryFilter = document.getElementById('industryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const locationFilter = document.getElementById('locationFilter');
        const sortSelect = document.getElementById('sortSelect');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterBusinesses());
        }
        if (industryFilter) {
            industryFilter.addEventListener('change', () => this.filterBusinesses());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.filterBusinesses());
        }
        if (locationFilter) {
            locationFilter.addEventListener('change', () => this.filterBusinesses());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.sortBusinesses());
        }
    }

    filterBusinesses() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const industry = document.getElementById('industryFilter')?.value || '';
        const priceRange = document.getElementById('priceFilter')?.value || '';
        const location = document.getElementById('locationFilter')?.value || '';

        const filteredBusinesses = this.businesses.filter(business => {
            const matchesSearch = !searchTerm || 
                business.title.toLowerCase().includes(searchTerm) ||
                business.description.toLowerCase().includes(searchTerm) ||
                business.location.toLowerCase().includes(searchTerm) ||
                business.industry.toLowerCase().includes(searchTerm);

            const matchesIndustry = !industry || business.industry === industry;
            const matchesLocation = !location || business.location === location;
            
            let matchesPrice = true;
            if (priceRange) {
                const price = business.price;
                if (priceRange === '0-100000') matchesPrice = price < 100000;
                else if (priceRange === '100000-500000') matchesPrice = price >= 100000 && price <= 500000;
                else if (priceRange === '500000-1000000') matchesPrice = price > 500000 && price <= 1000000;
                else if (priceRange === '1000000+') matchesPrice = price > 1000000;
            }

            return matchesSearch && matchesIndustry && matchesLocation && matchesPrice;
        });

        this.displayBusinesses(filteredBusinesses);
        this.updateResultsCounter(filteredBusinesses.length);
    }

    sortBusinesses() {
        const sortValue = document.getElementById('sortSelect')?.value || 'featured';
        const currentBusinesses = this.getCurrentDisplayedBusinesses();

        let sortedBusinesses = [...currentBusinesses];

        switch (sortValue) {
            case 'price-low':
                sortedBusinesses.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedBusinesses.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                sortedBusinesses.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'oldest':
                sortedBusinesses.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                break;
            case 'featured':
            default:
                sortedBusinesses.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
        }

        this.displayBusinesses(sortedBusinesses);
    }

    getCurrentDisplayedBusinesses() {
        // Get currently displayed businesses from DOM or maintain a filtered list
        return this.businesses;
    }

    updateResultsCounter(count) {
        const counter = document.getElementById('resultsCount');
        if (counter) {
            counter.textContent = count;
            counter.style.transform = 'scale(1.1)';
            setTimeout(() => {
                counter.style.transform = 'scale(1)';
            }, 200);
        }
    }

    updateSectionStats() {
        const totalBusinesses = this.businesses.length;
        const avgPrice = this.businesses.length > 0 
            ? this.businesses.reduce((sum, business) => sum + business.price, 0) / this.businesses.length 
            : 0;
        const industries = new Set(this.businesses.map(business => business.industry)).size;

        const totalBusinessesEl = document.getElementById('totalBusinesses');
        const avgPriceEl = document.getElementById('avgPrice');
        const totalIndustriesEl = document.getElementById('totalIndustries');

        if (totalBusinessesEl) {
            this.animateCounter(totalBusinessesEl, totalBusinesses);
        }
        if (avgPriceEl) {
            avgPriceEl.textContent = this.formatCurrency(avgPrice);
        }
        if (totalIndustriesEl) {
            this.animateCounter(totalIndustriesEl, industries);
        }
    }

    animateCounter(element, targetValue) {
        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    formatIndustry(industry) {
        const industryMap = {
            'technology': 'Technology',
            'retail': 'Retail',
            'restaurant': 'Restaurant',
            'manufacturing': 'Manufacturing',
            'services': 'Services'
        };
        return industryMap[industry] || industry;
    }

    loadMoreBusinesses() {
        this.currentPage++;
        this.renderBusinesses();
        this.announceToScreenReader(`Loaded page ${this.currentPage} of business listings`);
    }

    viewBusiness(businessId) {
        this.microHighlight(document.querySelector('.business-listing[data-business-id="'+businessId+'"]'));
        const business = this.businesses.find(b => b.id === businessId);
        if (business) {
            this.showNotification(`Viewing details for ${business.title}`, 'info');
            this.announceToScreenReader(`Viewing details for ${business.title}`);
        }
    }

    contactSeller(businessId) {
        this.microHighlight(document.querySelector('.business-listing[data-business-id="'+businessId+'"] .btn-secondary'));
        const business = this.businesses.find(b => b.id === businessId);
        if (business) {
            this.showNotification(`Contacting seller for ${business.title}`, 'info');
            this.announceToScreenReader(`Contacting seller for ${business.title}`);
        }
    }

    // ========================================
    // 12. USER INTERFACE & NOTIFICATIONS
    // ========================================

    updateAuthUI() {
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth && this.currentUser) {
            navAuth.innerHTML = `
                <div class="user-menu">
                    <span>Welcome, ${this.currentUser.name}</span>
                    <button class="btn-secondary" onclick="app.logout()" aria-label="Logout">Logout</button>
                </div>
            `;
        }
    }

    logout() {
        this.currentUser = null;
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) {
            navAuth.innerHTML = `
                <button class="btn-secondary" id="loginBtn">Login</button>
                <button class="btn-primary" id="signupBtn">Sign Up</button>
            `;
            // Re-setup event listeners for the new buttons
            this.setupModals();
        }
        this.showNotification('Logged out successfully', 'info');
        this.announceToScreenReader('Logged out successfully');
    }

    showLoading() {
        showProgressBar();
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'block';
        }
    }

    hideLoading() {
        hideProgressBar();
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}" aria-hidden="true"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" 
                    onclick="this.parentElement.remove()" 
                    aria-label="Close notification">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'info': 'info-circle',
            'warning': 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    // ========================================
    // 13. PERFORMANCE MONITORING
    // ========================================

    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if (window.performance) {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                if (loadTime > 3000) {
                    console.warn('Slow page load detected:', loadTime + 'ms');
                }
            }
        });

        // Monitor Core Web Vitals
        this.observeWebVitals();
    }

    observeWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    // ========================================
    // 14. NAVIGATION SETUP
    // ========================================

    setupNavigation() {
        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('nav-menu');
            const navToggle = document.getElementById('nav-toggle');
            
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// ========================================
// 15. INITIALIZATION & STARTUP
// ========================================

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PearllinkApp();
});

// Enhanced loading with accessibility
window.addEventListener('load', () => {
    // Add loading animation to hero cards
    const heroCards = document.querySelectorAll('.business-card');
    heroCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Add parallax effect to hero section (with reduced motion check)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;
            const heroParticles = document.querySelector('.hero-particles');
            if (heroParticles) {
                heroParticles.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        }, 16));
    }
});

// Browser support check
function checkBrowserSupport() {
    const features = {
        'CSS Grid': CSS.supports('display', 'grid'),
        'CSS Flexbox': CSS.supports('display', 'flex'),
        'CSS Custom Properties': CSS.supports('--custom', 'value'),
        'ES6 Classes': typeof class {} === 'function',
        'Fetch API': typeof fetch !== 'undefined',
        'Intersection Observer': typeof IntersectionObserver !== 'undefined'
    };
    
    const unsupported = Object.entries(features).filter(([name, supported]) => !supported);
    
    if (unsupported.length > 0) {
        console.warn('Unsupported features:', unsupported.map(([name]) => name));
        if (window.app) {
            window.app.showNotification('Your browser may not support all features. Please update your browser for the best experience.', 'warning');
        }
    }
}

// Run browser support check
checkBrowserSupport();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PearllinkApp;
}

console.log('✅ Pearllink JavaScript loaded successfully');
