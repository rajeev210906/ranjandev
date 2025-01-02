// Form handling
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Add your form submission logic here
    alert('Thank you for your message! I will get back to you soon.');
    contactForm.reset();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is on Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    const mobileNotice = document.getElementById('mobile-notice');
    const windowsDownload = document.getElementById('windows-download');
    const androidDownload = document.getElementById('android-download');

    if (isAndroid) {
        mobileNotice.style.display = 'block';
        windowsDownload.classList.remove('active');
        androidDownload.classList.add('active');
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    }

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('download-card')) {
                    entry.target.style.transitionDelay = `${Array.from(entry.target.parentNode.children).indexOf(entry.target) * 0.1}s`;
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all feature cards and changelog items
    document.querySelectorAll('.feature-card, .change-item, .download-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Add class for animation when element becomes visible
    document.querySelectorAll('.visible').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // Parallax effect for hero section
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const hero = document.querySelector('.hero');
                const scrolled = window.pageYOffset;
                hero.style.backgroundPosition = `center ${scrolled * 0.5}px`;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Download button hover effect
    document.querySelectorAll('.btn:not(:disabled):not(.coming-soon)').forEach(button => {
        button.addEventListener('mouseover', e => {
            button.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseout', e => {
            button.style.transform = 'translateY(0)';
        });
    });

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    menuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuBtn.querySelector('i').classList.toggle('fa-bars');
        menuBtn.querySelector('i').classList.toggle('fa-times');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').classList.add('fa-bars');
            menuBtn.querySelector('i').classList.remove('fa-times');
        });
    });
});
