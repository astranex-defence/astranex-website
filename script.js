document.addEventListener('DOMContentLoaded', () => {
    // System Status Update
    const statusElement = document.querySelector('.system-status .active');
    const statusStates = ['ACTIVE', 'SCANNING', 'SECURE', 'MONITORING'];
    
    setInterval(() => {
        const randomState = statusStates[Math.floor(Math.random() * statusStates.length)];
        statusElement.textContent = randomState;
        
        // Blink effect
        statusElement.style.opacity = '0.5';
        setTimeout(() => {
            statusElement.style.opacity = '1';
        }, 100);
    }, 5000);

    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.content-section, .hero-content');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(section);
    });

    // Add visible class styling dynamically if not in CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Dashboard Mockup Animation
    const dashboardLog = document.querySelector('.side-panel');
    if(dashboardLog) {
        const logs = [
            'Detect: Sector 4', 'Anomaly: Neg', 'Path: Opt', 'Signal: Encrypted', 
            'Latency: 12ms', 'Grid: Nominal', 'Target: None', 'Mode: Auto'
        ];
        
        setInterval(() => {
            const newLog = logs[Math.floor(Math.random() * logs.length)];
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerText = newLog;
            logEntry.style.borderBottom = '1px solid #222';
            
            if(dashboardLog.children.length > 5) {
                dashboardLog.removeChild(dashboardLog.firstChild);
            }
            dashboardLog.appendChild(logEntry);
        }, 2000);
    }
});

document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        org: document.getElementById("org").value,
        message: document.getElementById("message").value
    };

    fetch("https://script.google.com/macros/s/AKfycby_sbDSaXX5Mqyu0KpnxKndmOcu6k8JREYxiB7MRS67YO0E24KHOsHUEoN4bpsUXqpB/exec", {
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert("Message sent successfully.");
        document.getElementById("contact-form").reset();
    })
    .catch(error => {
        alert("Error sending message.");
    });
});
