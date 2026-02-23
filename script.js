/* ==============================================
   ASTRANEX DEFENCE — Main Script
   Handles: nav, animations, status, form submit
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {

/* ──────────────────────────────────────────
   1. SCROLL PROGRESS BAR
   Calculates the user's scroll percentage and updates the CSS custom property '--scroll-pct' 
   used by the top progress bar.
   ────────────────────────────────────────── */
const scrollIndicator = document.querySelector('.scroll-indicator');
const heroSection = document.getElementById('hero');

function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    document.documentElement.style.setProperty('--scroll-pct', pct.toFixed(2) + '%');
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();


/* ──────────────────────────────────────────
   2. HERO SCROLL INDICATOR VISIBILITY
   Hides the bouncing scroll indicator when the user scrolls past the hero section to prevent distraction.
   ────────────────────────────────────────── */
if (scrollIndicator && heroSection) {
    const heroObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scrollIndicator.style.opacity = '1';
                    scrollIndicator.style.pointerEvents = 'auto';
                } else {
                    scrollIndicator.style.opacity = '0';
                    scrollIndicator.style.pointerEvents = 'none';
                }
            });
        },
        {
            threshold: 0.3
        }
    );

    heroObserver.observe(heroSection);
}
    /* ──────────────────────────────────────────
       3. MOBILE HAMBURGER NAVIGATION
       Handles opening and closing the mobile nav drawer, locking focus, and listening for outside clicks.
       ────────────────────────────────────────── */
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Toggle menu open/closed
    function toggleMenu(open) {
        const isOpen = open !== undefined ? open : mobileMenu.classList.toggle('open');
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (!isOpen) mobileMenu.classList.remove('open');
    }

    if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
        const willOpen = !mobileMenu.classList.contains('open');
        mobileMenu.classList.toggle('open', willOpen);
        hamburgerBtn.setAttribute('aria-expanded', willOpen);
        mobileMenu.setAttribute('aria-hidden', !willOpen);
       });
    }

    // Close mobile nav when any link is clicked
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on outside tap
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) &&
            !hamburgerBtn.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            toggleMenu(false);
            hamburgerBtn.focus();
        }
    });


    /* ──────────────────────────────────────────
       4. SCROLL-BASED SECTION ANIMATIONS
       Uses IntersectionObserver to inject highly performant fade-up CSS classes 
       when elements enter the scrolling viewport.
       ────────────────────────────────────────── */
    const ioOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, ioOptions);

    // Animate every content section and the hero content in
    document.querySelectorAll('.content-section, .hero-content').forEach(el => {
        el.classList.add('section-animate');
        observer.observe(el);
    });


    /* ──────────────────────────────────────────
       5. SYSTEM STATUS TICKER
       Cycles through an array of "tactical" status texts in the header with a fade animation.
       ────────────────────────────────────────── */
    const statusEl = document.querySelector('.system-status .active');
    const statusStates = ['ACTIVE', 'SCANNING', 'SECURE', 'MONITORING', 'NOMINAL'];

    if (statusEl) {
        setInterval(() => {
            statusEl.style.opacity = '0';
            setTimeout(() => {
                statusEl.textContent = statusStates[Math.floor(Math.random() * statusStates.length)];
                statusEl.style.opacity = '1';
            }, 200);
        }, 4500);
    }


    /* ──────────────────────────────────────────
       6. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
       Highlights the current navigation link based on which section the user is currently viewing.
       ────────────────────────────────────────── */
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav-link');
    const sectionIds = ['hero', 'mission', 'vision', 'team', 'about', 'contact'];

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.style.opacity = '1';
                    } else {
                        link.style.opacity = '';
                    }
                });
            }
        });
    }, { threshold: 0.4 });

    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) navObserver.observe(el);
    });


    /* ──────────────────────────────────────────
       7. CONTACT FORM SUBMISSION
       Intercepts form submission, disables the button to prevent double-sends, 
       sends data to Google Apps Script, and handles the "Transmitting" UI states.
       ────────────────────────────────────────── */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const orgInput = document.getElementById('org');
            const messageInput = document.getElementById('message');

            const nameValue = nameInput.value.trim();
            const emailValue = emailInput.value.trim();
            const orgValue = orgInput.value.trim();
            const messageValue = messageInput.value.trim();

            let hasError = false;

            const showError = (inputId, msg) => {
                const errorLog = document.getElementById(inputId + '-error');
                if (errorLog) {
                    errorLog.textContent = '> ERR: ' + msg;
                    errorLog.classList.add('active');
                }
                hasError = true;
            };

            // Clear previous errors
            document.querySelectorAll('.error-log').forEach(el => {
                el.textContent = '';
                el.classList.remove('active');
            });

            if (!nameValue) showError('name', 'REQ_PARAM_MISSING');
            if (!orgValue) showError('org', 'REQ_PARAM_MISSING');
            
            if (!emailValue) {
                showError('email', 'REQ_PARAM_MISSING');
            } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailValue)) {
                    showError('email', 'INVALID_DOMAIN_DETECTED');
                }
            }

            if (!messageValue) {
                showError('message', 'REQ_PARAM_MISSING');
            } else {
                const wordCount = messageValue.split(/\s+/).filter(word => word.length > 0).length;
                if (wordCount < 10) {
                    showError('message', 'MIN_10_WORDS_REQUIRED');
                }
            }

            if (hasError) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = '[ TRANSMISSION FAILED // CHECK PARAMETERS ]';
                submitBtn.classList.add('btn-error');
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.classList.remove('btn-error');
                }, 3000);
                
                // Add input listeners to clear errors once user starts typing
                ['name', 'email', 'org', 'message'].forEach(id => {
                    document.getElementById(id).addEventListener('input', function() {
                        const errEl = document.getElementById(id + '-error');
                        if (errEl) {
                            errEl.textContent = '';
                            errEl.classList.remove('active');
                        }
                    }, {once: true});
                });
                
                return;
            }
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'TRANSMITTING...';
            submitBtn.disabled = true;

            const formData = {
                name: nameValue,
                email: emailValue,
                org: orgValue,
                message: messageValue
            };

            try {
                const response = await fetch(
                    'https://script.google.com/macros/s/AKfycby_sbDSaXX5Mqyu0KpnxKndmOcu6k8JREYxiB7MRS67YO0E24KHOsHUEoN4bpsUXqpB/exec',
                    {
                        method: 'POST',
                        body: JSON.stringify(formData)
                    }
                );

                await response.json();
                submitBtn.textContent = 'MESSAGE SENT ✓';
                contactForm.reset();

                // Reset button after 4 s
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 4000);

            } catch (err) {
                console.error('Form submission error:', err);
                submitBtn.textContent = 'TRANSMISSION FAILED — RETRY';
                submitBtn.disabled = false;
            }
        });
    }

    /* ──────────────────────────────────────────
       8. TEAM MEMBER MODAL LOGIC
       Reads hidden data from the clicked team card and populates the fixed UI modal popup dynamically.
       ────────────────────────────────────────── */
    const teamModal = document.getElementById('team-modal');
    const modalCloseBtn = document.querySelector('.team-modal-close');
    const teamCards = document.querySelectorAll('.team-member');

    if (teamModal && teamCards.length > 0) {
        teamCards.forEach(card => {
            card.addEventListener('click', () => {
                const photoSrc = card.querySelector('.team-photo').getAttribute('src');
                const nameText = card.querySelector('h3').textContent;
                const roleText = card.querySelector('.role').textContent;
                const expertiseText = card.querySelector('.expertise').textContent;
                const linkedinAnchor = card.querySelector('.linkedin-link');
                const linkedinHref = linkedinAnchor ? linkedinAnchor.getAttribute('href') : '#';

                document.getElementById('modal-photo').setAttribute('src', photoSrc);
                document.getElementById('modal-name').textContent = nameText;
                document.getElementById('modal-role').textContent = roleText;
                document.getElementById('modal-expertise').textContent = expertiseText;
                document.getElementById('modal-linkedin').setAttribute('href', linkedinHref);

                teamModal.classList.add('open');
                document.body.style.overflow = 'hidden'; 
            });
        });

        const closeModal = () => {
            teamModal.classList.remove('open');
            document.body.style.overflow = '';
        };

        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

        teamModal.addEventListener('click', (e) => {
            if (e.target === teamModal || e.target.classList.contains('team-modal-backdrop')) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && teamModal.classList.contains('open')) {
                closeModal();
            }
        });
    }
    
    /* ──────────────────────────────────────────
       9. INIT LENIS SMOOTH SCROLLING
       Replaces the native browser scroll with a buttery-smooth physics-based scrolling library.
       ────────────────────────────────────────── */
    const lenis = new Lenis({
        autoRaf: true,
        duration: 1.5, // Smoother, slower scroll
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    /* ──────────────────────────────────────────
       10. CINEMATIC REVEAL EFFECT (BLUR & FADE-UP)
       Applies a unique frosted-blur reveal effect specifically for narrative text (Mission, Vision, About).
       ────────────────────────────────────────── */
    const revealElements = document.querySelectorAll('.section-title, .mission-text, .vision-text, .about-text');

    // Add initial state class to keep them hidden before JS observers kick in
    revealElements.forEach(el => el.classList.add('cinematic-initial'));

    const cinematicObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the revealed class which triggers the CSS transition
                entry.target.classList.add('cinematic-revealed');
                // Unobserve so it only happens once
                cinematicObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px' 
    });

    revealElements.forEach(el => cinematicObserver.observe(el));

    /* ──────────────────────────────────────────
       11. SMOOTH SCROLL ANCHOR LINKS (VIA LENIS)
       Intercepts anchor tags and utilizes Lenis engine to smoothly slide to the section cleanly.
       ────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Use lenis to smoothly slide to the element
                lenis.scrollTo(targetElement, {
                    offset: -80, // Offset for the fixed header
                    duration: 3, // Increased duration to make the scroll very slow and smooth
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });

    // Make the scroll indicator jump smoothly to mission section
    const scrollIndicatorObj = document.getElementById('hero-scroll');
    if (scrollIndicatorObj) {
        scrollIndicatorObj.addEventListener('click', () => {
            lenis.scrollTo('#mission', {
                offset: -80,
                duration: 3,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        });
    }

    /* ──────────────────────────────────────────
       12. LUCIDE ICONS INIT
       Converts all <i data-lucide="..."> HTML elements into interactive SVG icons.
       ────────────────────────────────────────── */
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ──────────────────────────────────────────
       13. TERMINAL HEADER TYPEWRITER EFFECT
       Creates a simulated command-line typing effect that triggers when the user reaches the Contact section.
       ────────────────────────────────────────── */
    const terminalHeader = document.querySelector('.terminal-header');
    if (terminalHeader) {
        const textToType = "SECURE CHANNEL  //  ASTRANEX-DEFENCE.SYS";
        const dotsHTML = `
            <span class="terminal-dot"></span>
            <span class="terminal-dot"></span>
            <span class="terminal-dot"></span>
        `;
        
        let i = 0;
        let isTyping = false;
        
        const typeWriterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting && !isTyping) {
                    isTyping = true;
                    terminalHeader.innerHTML = dotsHTML;
                    
                    const typeInterval = setInterval(() => {
                        if (i < textToType.length) {
                            terminalHeader.innerHTML = dotsHTML + " " + textToType.substring(0, i + 1) + "<span style='animation: pulse 1s infinite;'>_</span>";
                            i++;
                        } else {
                            clearInterval(typeInterval);
                            terminalHeader.innerHTML = dotsHTML + " " + textToType; 
                        }
                    }, 40);
                }
            });
        }, { threshold: 0.8 });
        
        // Initial clear to prevent flash of text before JS kicks in
        terminalHeader.innerHTML = dotsHTML;
        typeWriterObserver.observe(terminalHeader);
    }

    /* ──────────────────────────────────────────
       14. GHOSTLY TRAILING CURSOR EFFECT
       Creates a smooth, delayed physics-based glow that follows the custom cursor
       ────────────────────────────────────────── */
    const cursorGlow = document.getElementById('cursor-glow');
    
    if (cursorGlow) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        
        let glowX = mouseX;
        let glowY = mouseY;
        
        // Listen for mouse moves to update target coordinates
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Animation loop for physics calculation
        function animateGlow() {
            // Spring physics formula 
            const dx = mouseX - glowX;
            const dy = mouseY - glowY;
            
            glowX += dx * 0.08;
            glowY += dy * 0.08;
            
            // Apply the translated coordinates back to the DOM element
            cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
            
            requestAnimationFrame(animateGlow);
        }
        
        // Start the loop
        animateGlow();
    }

}); // end DOMContentLoaded
