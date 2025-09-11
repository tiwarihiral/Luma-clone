// Luma Ray2 Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all functionality
    initVideoObserver();
    initPromptCopy();
    initSmoothScrolling();
    initHeaderBehavior();
    initVideoControls();
    
    console.log('Luma Ray2 website initialized');
});

/**
 * Lazy loading for videos using Intersection Observer
 */
function initVideoObserver() {
    const videoElements = document.querySelectorAll('video[data-src]');
    
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    const src = video.getAttribute('data-src');
                    
                    if (src) {
                        video.src = src;
                        video.removeAttribute('data-src');
                        video.classList.add('loaded');
                        
                        // Start playing when loaded
                        video.addEventListener('loadeddata', () => {
                            video.play().catch(e => {
                                console.log('Video autoplay prevented:', e);
                            });
                        });
                    }
                    
                    observer.unobserve(video);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        videoElements.forEach(video => {
            videoObserver.observe(video);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        videoElements.forEach(video => {
            const src = video.getAttribute('data-src');
            if (src) {
                video.src = src;
                video.removeAttribute('data-src');
            }
        });
    }
}

/**
 * Copy prompt text to clipboard functionality
 */
function initPromptCopy() {
    const videoContainers = document.querySelectorAll('.video-container[title*="copy"]');
    
    videoContainers.forEach(container => {
        container.addEventListener('click', function() {
            const videoItem = this.closest('.video-item');
            const promptElement = videoItem.querySelector('.prompt-text');
            
            if (promptElement) {
                const promptText = promptElement.textContent.trim();
                
                // Try to use the modern clipboard API
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(promptText).then(() => {
                        showCopyFeedback(this, 'Prompt copied!');
                    }).catch(err => {
                        console.error('Failed to copy prompt:', err);
                        fallbackCopyText(promptText);
                    });
                } else {
                    // Fallback for older browsers
                    fallbackCopyText(promptText);
                }
            }
        });
    });
}


/**
 * Fallback copy method for older browsers
 */
function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback(document.body, 'Prompt copied!');
        } else {
            console.error('Fallback copy failed');
        }
    } catch (err) {
        console.error('Fallback copy error:', err);
    }
    
    document.body.removeChild(textArea);
}

/**
 * Show visual feedback when prompt is copied
 */
function showCopyFeedback(element, message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 2000);
}

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Header scroll behavior and sticky sections
 */
function initHeaderBehavior() {
    const header = document.querySelector('.header');
    const sectionHeaders = document.querySelectorAll('[data-section-title="true"]');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // Update active section
        updateActiveSection();
    }, 16)); // ~60fps
}

/**
 * Update active section based on scroll position
 */
function updateActiveSection() {
    const sections = document.querySelectorAll('.section');
    const scrollPosition = window.scrollY + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.id;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Add active state logic here if needed
        }
    });
}

/**
 * Enhanced video controls and interactions
 */
function initVideoControls() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Pause video when not in viewport
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (video.paused) {
                            video.play().catch(e => console.log('Video play prevented:', e));
                        }
                    } else {
                        if (!video.paused) {
                            video.pause();
                        }
                    }
                });
            }, {
                threshold: 0.5
            });
            
            videoObserver.observe(video);
        }
        
        // Handle video loading errors
        video.addEventListener('error', function() {
            console.error('Video failed to load:', this.src);
            // Optionally show a placeholder or retry mechanism
        });
        
        // Preload next videos when current one starts playing
        video.addEventListener('play', function() {
            preloadNearbyVideos(this);
        });
    });
}

/**
 * Preload videos near the currently playing one
 */
function preloadNearbyVideos(currentVideo) {
    const allVideos = Array.from(document.querySelectorAll('video[data-src]'));
    const currentIndex = Array.from(document.querySelectorAll('video')).indexOf(currentVideo);
    
    // Preload next 2 videos
    for (let i = 1; i <= 2; i++) {
        const nextVideo = allVideos[currentIndex + i];
        if (nextVideo && nextVideo.hasAttribute('data-src')) {
            const src = nextVideo.getAttribute('data-src');
            nextVideo.src = src;
            nextVideo.removeAttribute('data-src');
        }
    }
}

/**
 * Throttle function for performance optimization
 */
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
    }
}

/**
 * Debounce function for resize events
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Handle window resize events
 */
window.addEventListener('resize', debounce(() => {
    // Recalculate any layout-dependent functionality
    updateVideoSizes();
}, 250));

/**
 * Update video container sizes on resize
 */
function updateVideoSizes() {
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach(container => {
        // Force recalculation of aspect ratios or sizes if needed
        const video = container.querySelector('video');
        if (video) {
            // Any size-dependent updates can go here
        }
    });
}

/**
 * Accessibility improvements
 */
function initAccessibility() {
    // Add keyboard navigation for video items
    const videoItems = document.querySelectorAll('.video-item');
    
    videoItems.forEach(item => {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Play video and copy prompt');
        
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', initAccessibility);

// Export functions for potential external use
window.LumaRay2 = {
    initVideoObserver,
    initPromptCopy,
    showCopyFeedback,
    throttle,
    debounce
};
document.querySelector('.dream-machine-btn').addEventListener('click', function(e) {
  console.log('Dream Machine button clicked!');
});
document.addEventListener("DOMContentLoaded", () => {
  const icons = document.querySelectorAll(".footer-socials a svg");
  icons.forEach(icon => {
    icon.addEventListener("mouseenter", () => {
      icon.style.transform = "scale(1.2)";
    });
    icon.addEventListener("mouseleave", () => {
      icon.style.transform = "scale(1)";
    });
  });
});
document.querySelectorAll('video').forEach(video => {
  video.disablePictureInPicture = true;
});
