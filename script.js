// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Download button functionality
const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();

    // Create notification
    showNotification('¡Descarga iniciada!', 'Redirigiendo a MediaFire...');

    // Add download animation
    downloadBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        downloadBtn.style.transform = 'scale(1)';
    }, 200);

    // Redirect to MediaFire download
    setTimeout(() => {
        window.open('https://www.mediafire.com/file/ddfw0chgeo53qkb/HCEMetter_v1.0.0.rar/file', '_blank');
    }, 500);
});

// Notification system
function showNotification(title, message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${type === 'success' ? '✓' : 'ℹ'}</div>
            <div class="notification-text">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            background: var(--bg-card);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--border-radius-md);
            padding: 1rem 1.5rem;
            box-shadow: var(--shadow-xl);
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
        }
        
        .notification-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.25rem;
            flex-shrink: 0;
        }
        
        .notification-success .notification-icon {
            background: var(--success-color);
            color: white;
        }
        
        .notification-info .notification-icon {
            background: var(--primary-color);
            color: white;
        }
        
        .notification-text {
            flex: 1;
        }
        
        .notification-title {
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        
        .notification-message {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: var(--transition-fast);
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
        }
        
        @media (max-width: 768px) {
            .notification {
                left: 20px;
                right: 20px;
                max-width: none;
            }
        }
    `;

    if (!document.querySelector('style[data-notification-styles]')) {
        style.setAttribute('data-notification-styles', 'true');
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and step cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .step-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Parallax effect for hero image
window.addEventListener('scroll', () => {
    const heroImage = document.getElementById('heroImage');
    if (heroImage) {
        const scrolled = window.pageYOffset;
        heroImage.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add hover effect to floating cards
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.1) translateY(-10px)';
        card.style.zIndex = '10';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.zIndex = '';
    });
});

// Console easter egg
console.log('%c⚔️ HCE DPS Metter', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%c¡Gracias por visitar! Si encuentras algún bug, por favor repórtalo.', 'font-size: 14px; color: #667eea;');
console.log('%cDesarrollado con ❤️ para la comunidad de Albion Online', 'font-size: 12px; color: #a0a0b8;');



