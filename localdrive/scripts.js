document.addEventListener('DOMContentLoaded', function() {
    // Krishna flute music control
    const krishnaFlute = document.getElementById('krishna-flute');
    const musicToggle = document.getElementById('music-toggle');
    let musicPlaying = false;
    
    // Try to play music (browsers may block autoplay)
    krishnaFlute.volume = 0.5; // Set volume to 50%
    
    musicToggle.addEventListener('click', function() {
        if (musicPlaying) {
            krishnaFlute.pause();
            musicToggle.classList.add('muted');
            musicPlaying = false;
        } else {
            krishnaFlute.play().then(() => {
                musicToggle.classList.remove('muted');
                musicPlaying = true;
            }).catch(error => {
                console.log("Audio play failed: ", error);
                alert("Please interact with the page to enable the divine flute music.");
            });
        }
    });
    
    // Start playing as soon as possible with user interaction
    document.addEventListener('click', function musicInitializer() {
        krishnaFlute.play().then(() => {
            musicToggle.classList.remove('muted');
            musicPlaying = true;
            // Remove this event listener after first click
            document.removeEventListener('click', musicInitializer);
        }).catch(error => {
            console.log("Audio autoplay blocked: ", error);
        });
    }, { once: true });
    
    // Add special cursor trail effect for Krishna theme
    const createPeacockFeatherTrail = () => {
        const feather = document.createElement('div');
        feather.className = 'feather-trail';
        document.body.appendChild(feather);
        
        // Set initial position (near cursor)
        const setInitialPosition = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            feather.style.left = `${x}px`;
            feather.style.top = `${y}px`;
        };
        
        // Create animation
        const animateFeather = () => {
            feather.style.opacity = '0';
            feather.style.transform = 'translateY(20px) rotate(20deg)';
            
            // Remove element after animation
            setTimeout(() => {
                document.body.removeChild(feather);
            }, 1000);
        };
        
        // Return the feather element and functions
        return {
            feather,
            setInitialPosition,
            animateFeather
        };
    };
    
    // Create feather trail on clicks
    document.addEventListener('click', (e) => {
        if (Math.random() > 0.7) { // Only create trails 30% of the time
            const trail = createPeacockFeatherTrail();
            trail.setInitialPosition(e);
            trail.animateFeather();
        }
    });

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenuBtn) {
        // Create mobile navigation menu
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';
        
        // Clone the navigation for mobile
        const navClone = document.querySelector('nav ul').cloneNode(true);
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
        
        // Add components to mobile nav
        mobileNav.appendChild(closeBtn);
        mobileNav.appendChild(navClone);
        document.body.appendChild(mobileNav);
        
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.add('active');
        });
        
        // Close mobile menu when clicking a link
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
            });
        });
    }
    
    // FAQ accordion functionality
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', () => {
            // Toggle the active class on the clicked item
            item.classList.toggle('active');
            
            // Close other accordion items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Offset for fixed header
                behavior: 'smooth'
            });
        });
    });
    
    // Animation on scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .step, .download-card, .about-content, .accordion-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Apply initial animation styles
    const animatedElements = document.querySelectorAll('.feature-card, .step, .download-card, .about-content, .accordion-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Run animation on page load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
    
    // Create directory structure for images
    console.log("Don't forget to create the 'images' directory with the following files:");
    console.log("- localdrive-logo.png");
    console.log("- localdrive-screenshot.png");
    console.log("- krishna-illustration.png");
    console.log("- peacock-feather.svg");
    console.log("- peacock-cursor.png");
    console.log("- peacock-cursor-pointer.png");
    console.log("- flute.svg");
    console.log("- lotus.svg");
    console.log("- om-symbol.svg");
    console.log("- om-large.svg");
    console.log("- mandala.svg");
    console.log("- radha-krishna.svg");
    console.log("- tilak-symbol.svg");
    console.log("- swastika-symbol.svg");
    console.log("- shankha-symbol.svg");
    console.log("- subtle-pattern.png");
    console.log("- hindu-border.svg");
    console.log("- peacock-feather-small.svg");

    // YouTube Demo Video Functionality
    const videoFloatBtn = document.getElementById('videoFloatBtn');
    const videoModal = document.getElementById('videoModal');
    const videoClose = document.querySelector('.video-close');
    const youtubeVideo = document.getElementById('youtubeVideo');
    const videoThumbnail = document.getElementById('videoThumbnail');
    
    // YouTube video ID - replace with your actual YouTube video ID
    const youtubeVideoId = '4fG0y7n-w_0';
    
    // Function to open video modal
    function openVideoModal() {
        // Set YouTube embed URL with video ID
        youtubeVideo.src = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`;
        videoModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Function to close video modal
    function closeVideoModal() {
        youtubeVideo.src = ''; // Stop video playback
        videoModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Event listeners for video buttons
    if (videoFloatBtn) {
        videoFloatBtn.addEventListener('click', openVideoModal);
    }
    
    if (videoClose) {
        videoClose.addEventListener('click', closeVideoModal);
    }
    
    if (videoThumbnail) {
        videoThumbnail.addEventListener('click', openVideoModal);
    }
    
    // Close modal if clicking outside content
    window.addEventListener('click', function(event) {
        if (event.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Add these files to the list of required images
    console.log("- video-thumbnail.jpg");
});
