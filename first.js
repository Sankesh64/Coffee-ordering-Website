// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to navigation links based on scroll position
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Contact submission now handled in enhanced-script.js

// Header background change on scroll
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.style.background = 'rgba(59, 20, 28, 0.98)';
        header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    } else {
        header.style.background = 'var(--primary-color)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// ==============================
// GSAP ANIMATIONS
// ==============================

// Register ScrollTrigger plugin safely
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ immediateRender: false, overwrite: "auto" });
}

// Initial page load animation
window.addEventListener('load', () => {
    // Animate hero section
    const heroTimeline = gsap.timeline();
    
    heroTimeline
        .from('.hero-details .title', {
            x: -100,
            duration: 1,
            ease: 'power3.out'
        })
        .from('.hero-details .subtitle', {
            x: -100,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.7')
        .from('.hero-details .description', {
            x: -100,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.7')
        .from('.hero-details .buttons .button', {
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.7)'
        }, '-=0.5')
        .from('.hero-image-wrapper', {
            x: 100,
            duration: 1.2,
            ease: 'power3.out'
        }, '-=1.5');

    // Animate navigation
    gsap.from('.navbar .nav-logo', {
        y: -50,
        duration: 0.8,
        ease: 'power2.out'
    });
    
    gsap.from('.navbar .nav-menu .nav-item', {
        y: -50,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
    });
});

// About Section Animation
gsap.from('.about-image-wrapper', {
    scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none none',
        once: true
    },
    x: -100,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.about-details .section-title', {
    scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    x: 100,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.about-details .text', {
    scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    x: 100,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.3
});

gsap.from('.about-details .learn-more', {
    scrollTrigger: {
        trigger: '.about-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    y: 50,
    duration: 0.8,
    ease: 'back.out(1.7)',
    delay: 0.6
});

// Coffee Varieties Cards Animation
gsap.from('.variety-card', {
    scrollTrigger: {
        trigger: '.varieties-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    y: 100,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
});

// Card hover animation enhancement
const varietyCards = document.querySelectorAll('.variety-card');
varietyCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        gsap.to(card.querySelector('.variety-image'), {
            scale: 1.15,
            rotation: 8,
            duration: 0.4,
            ease: 'power2.out'
        });
        
        gsap.to(card.querySelector('.card-badge'), {
            scale: 1.1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)'
        });
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card.querySelector('.variety-image'), {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
        
        gsap.to(card.querySelector('.card-badge'), {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)'
        });
    });
});

// Order button click animation
const orderButtons = document.querySelectorAll('.order-btn');
orderButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        gsap.to(btn, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            opacity: 0.6;
            pointer-events: none;
        `;
        
        const rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - 10) + 'px';
        ripple.style.top = (e.clientY - rect.top - 10) + 'px';
        
        btn.appendChild(ripple);
        
        gsap.to(ripple, {
            width: 200,
            height: 200,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ripple.remove()
        });
    });
});

// Menu Section Animation
gsap.from('.menu-section .section-title', {
    scrollTrigger: {
        trigger: '.menu-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    scale: 0.5,
    duration: 0.8,
    ease: 'back.out(1.7)'
});

gsap.from('.menu-item', {
    scrollTrigger: {
        trigger: '.menu-section',
        start: 'top 70%',
        toggleActions: 'play none none none',
        once: true
    },
    y: 80,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
});

// Testimonials Section Animation
gsap.from('.testimonials-section .section-title', {
    scrollTrigger: {
        trigger: '.testimonials-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    scale: 0.5,
    duration: 0.8,
    ease: 'back.out(1.7)'
});

gsap.from('.testimonial-item', {
    scrollTrigger: {
        trigger: '.testimonials-section',
        start: 'top 70%',
        toggleActions: 'play none none none',
        once: true
    },
    y: 80,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
});

// Gallery Section Animation
gsap.from('.gallery-section .section-title', {
    scrollTrigger: {
        trigger: '.gallery-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    scale: 0.5,
    duration: 0.8,
    ease: 'back.out(1.7)'
});

gsap.from('.gallery-item', {
    scrollTrigger: {
        trigger: '.gallery-section',
        start: 'top 70%',
        toggleActions: 'play none none none',
        once: true
    },
    scale: 0.8,
    duration: 0.8,
    stagger: 0.1,
    ease: 'back.out(1.5)'
});

// Contact Section Animation
gsap.from('.contact-form-wrapper', {
    scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    x: -100,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.contact-info-wrapper', {
    scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true
    },
    x: 100,
    duration: 1,
    ease: 'power3.out'
});

gsap.from('.contact-info-item', {
    scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 70%',
        toggleActions: 'play none none none',
        once: true
    },
    y: 50,
    duration: 0.6,
    stagger: 0.15,
    ease: 'back.out(1.7)'
});

// Footer Animation
gsap.from('.footer-section', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        toggleActions: 'play none none none',
        once: true
    },
    y: 50,
    duration: 0.8,
    stagger: 0.2,
    ease: 'power3.out'
});

// Parallax effect for hero section
gsap.to('.hero-image-wrapper', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    },
    y: 100,
    ease: 'none'
});

// Continuous floating animation for coffee varieties
gsap.to('.variety-image', {
    y: -10,
    duration: 2,
    ease: 'power1.inOut',
    stagger: {
        each: 0.2,
        repeat: -1,
        yoyo: true
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Coffee Website with GSAP Animations Loaded Successfully! ☕');
    
    // Create floating coffee beans background effect
    createFloatingBeans();

    // Safety net: if any animated element got stuck at opacity 0, restore visibility.
    setTimeout(() => {
        document.querySelectorAll(
            '.hero-image-wrapper, .about-image-wrapper, .variety-card, .menu-item, .testimonial-item, .gallery-item, .contact-form-wrapper, .contact-info-wrapper, .footer-section'
        ).forEach((el) => {
            if (window.getComputedStyle(el).opacity === '0') {
                el.style.opacity = '1';
                el.style.transform = 'none';
            }
        });
    }, 1200);
});

// Floating coffee beans animation
function createFloatingBeans() {
    const beansContainer = document.createElement('div');
    beansContainer.className = 'floating-beans';
    beansContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    `;
    
    for (let i = 0; i < 15; i++) {
        const bean = document.createElement('div');
        bean.textContent = '☕';
        bean.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 30 + 20}px;
            opacity: ${Math.random() * 0.1 + 0.05};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        beansContainer.appendChild(bean);
        
        gsap.to(bean, {
            y: `${Math.random() * 200 - 100}`,
            x: `${Math.random() * 200 - 100}`,
            rotation: 360,
            duration: Math.random() * 10 + 10,
            repeat: -1,
            yoyo: true,
            ease: 'none'
        });
    }
    
    document.body.prepend(beansContainer);
}

