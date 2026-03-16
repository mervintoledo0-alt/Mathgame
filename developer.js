// Developer Page JavaScript

// Initialize web animation
document.addEventListener('DOMContentLoaded', () => {
    console.log('Developer page loaded successfully!');
    
    // Add random web lines to background
    const webBg = document.querySelector('.web-background');
    if (webBg) {
        for (let i = 0; i < 8; i++) {
            const line = document.createElement('div');
            line.className = 'web-line animated';
            line.style.left = `${Math.random() * 100}%`;
            line.style.top = `${Math.random() * 100}%`;
            line.style.transform = `rotate(${Math.random() * 360}deg)`;
            line.style.animationDuration = `${15 + Math.random() * 20}s`;
            webBg.appendChild(line);
        }
    }
    
    // Team card hover effects
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const badge = card.querySelector('.spider-badge i');
            badge.style.animation = 'pulse 0.5s infinite';
            
            // Add glow effect
            card.style.boxShadow = '0 15px 30px rgba(209, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            const badge = card.querySelector('.spider-badge i');
            badge.style.animation = '';
            
            // Remove glow effect
            card.style.boxShadow = '0 15px 30px rgba(209, 0, 0, 0.2)';
        });
    });
    
    // ========== COLLAPSIBLE TEAM CARDS ==========
    // Wrap expandable content and add toggle functionality
    teamCards.forEach(card => {
        const memberRole = card.querySelector('.member-role');
        const memberBio = card.querySelector('.member-bio');
        
        if (memberBio && memberRole) {
            // Create wrapper for expandable content
            const cardDetails = document.createElement('div');
            cardDetails.className = 'card-details';
            
            // Move bio, skills, and contact to card-details
            const memberSkills = card.querySelector('.member-skills');
            const memberContact = card.querySelector('.member-contact');
            
            cardDetails.appendChild(memberBio.cloneNode(true));
            if (memberSkills) cardDetails.appendChild(memberSkills.cloneNode(true));
            if (memberContact) cardDetails.appendChild(memberContact.cloneNode(true));
            
            // Remove originals
            memberBio.remove();
            if (memberSkills) memberSkills.remove();
            if (memberContact) memberContact.remove();
            
            // Create toggle button
            const toggleBtn = document.createElement('p');
            toggleBtn.className = 'expand-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> View Details';
            toggleBtn.style.cursor = 'pointer';
            
            // Insert toggle button and card-details
            memberRole.insertAdjacentElement('afterend', toggleBtn);
            toggleBtn.insertAdjacentElement('afterend', cardDetails);
            
            // Start as collapsed
            card.classList.add('collapsed');
            
            // Add click handler to toggle
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.toggle('collapsed');
                card.classList.toggle('expanded');
                
                const icon = toggleBtn.querySelector('i');
                if (card.classList.contains('expanded')) {
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Details';
                } else {
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> View Details';
                }
            });
        }
    });
    
    // Stats counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.textContent);
                const suffix = entry.target.textContent.includes('+') ? '+' : '';
                animateCount(entry.target, 0, target, 1500, suffix);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    statNumbers.forEach(number => {
        observer.observe(number);
    });
    
    // Animate count function
    function animateCount(element, start, end, duration, suffix = '') {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = current + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Mobile menu toggle (reuse from main script)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                // Scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // Active nav link on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Easter egg - Spider click effect
    let spiderClickCount = 0;
    const spiderLogo = document.querySelector('.spider-icon');
    
    if (spiderLogo) {
        spiderLogo.addEventListener('click', () => {
            spiderClickCount++;
            
            if (spiderClickCount === 9) {
                // Create web explosion effect
                for (let i = 0; i < 9; i++) {
                    createWebParticle();
                }
                
                // Show secret message for 9 developers
                const message = document.createElement('div');
                message.className = 'secret-message';
                message.innerHTML = `
                    <div class="message-content">
                        <i class="fas fa-spider"></i>
                        <h3>TEAM OF 9 DISCOVERED!</h3>
                        <p>You found the secret for our 9 developers team!</p>
                        <p>Each developer brings unique skills to create the best math game.</p>
                        <button onclick="this.parentElement.parentElement.remove()">Close</button>
                    </div>
                `;
                document.body.appendChild(message);
                
                // Reset counter
                spiderClickCount = 0;
            }
        });
    }
    
    function createWebParticle() {
        const particle = document.createElement('div');
        particle.className = 'web-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 5 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDuration = `${Math.random() * 2 + 1}s`;
        particle.style.backgroundColor = getRandomRed();
        
        document.querySelector('.dev-hero').appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 3000);
    }
    
    function getRandomRed() {
        const reds = ['#d10000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc'];
        return reds[Math.floor(Math.random() * reds.length)];
    }
});

// Add CSS for web particles and secret message
const extraStyle = document.createElement('style');
extraStyle.textContent = `
    .web-particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: #d10000;
        border-radius: 50%;
        animation: floatParticle 2s linear forwards;
        pointer-events: none;
        z-index: 1;
    }
    
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) translateX(20px) scale(0);
            opacity: 0;
        }
    }
    
    .secret-message {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    }
    
    .message-content {
        background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
        border: 3px solid #d10000;
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        text-align: center;
        animation: scaleIn 0.3s ease;
    }
    
    .message-content i {
        font-size: 4rem;
        color: #d10000;
        margin-bottom: 20px;
        animation: pulse 1s infinite;
    }
    
    .message-content h3 {
        font-family: 'Montserrat', sans-serif;
        font-size: 2rem;
        margin-bottom: 15px;
        color: white;
    }
    
    .message-content p {
        color: #ccc;
        margin-bottom: 10px;
        line-height: 1.5;
    }
    
    .message-content button {
        background: #d10000;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
        transition: all 0.3s ease;
    }
    
    .message-content button:hover {
        background: #ff0000;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(209, 0, 0, 0.3);
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(extraStyle);