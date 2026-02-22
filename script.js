/* ==============================================
   ASTRANEX DEFENCE — Main Script
   Handles: nav, animations, status, form submit
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ──────────────────────────────────────────
       0. SCROLL PROGRESS BAR + SCROLL INDICATOR
       ────────────────────────────────────────── */
    const scrollBar = document.getElementById('scroll-progress');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const heroSection = document.getElementById('hero');

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // Drive the CSS variable that sets the progress bar width
        document.documentElement.style.setProperty('--scroll-pct', pct.toFixed(2) + '%');

        // Hide scroll indicator after user scrolls 10% of hero height
        if (scrollIndicator && heroSection) {
            const threshold = heroSection.offsetHeight * 0.1;
            scrollIndicator.style.opacity = scrollTop > threshold ? '0' : '';
            scrollIndicator.style.pointerEvents = scrollTop > threshold ? 'none' : '';
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* ──────────────────────────────────────────
       1. MOBILE HAMBURGER NAVIGATION
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

    hamburgerBtn.addEventListener('click', () => {
        const willOpen = !mobileMenu.classList.contains('open');
        toggleMenu(willOpen);
    });

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
       2. SCROLL-BASED SECTION ANIMATIONS
          (Intersection Observer — performant)
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
       3. SYSTEM STATUS TICKER
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
       4. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
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
       5. CONTACT FORM SUBMISSION
       ────────────────────────────────────────── */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'TRANSMITTING...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                org: document.getElementById('org').value.trim(),
                message: document.getElementById('message').value.trim()
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

}); // end DOMContentLoaded
