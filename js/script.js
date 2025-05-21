// Общие утилиты
const Utils = {
    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    throttle: (func, limit) => {
        let lastFunc;
        let lastRan;
        return function () {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function () {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
};

// Scroll to top button
const initScrollToTop = () => {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) return;

    const toggleVisibility = Utils.throttle(() => {
        scrollToTopBtn.classList.toggle('active', window.scrollY > 300);
    }, 100);

    window.addEventListener('scroll', toggleVisibility);
    scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

// Mobile menu
const initBurgerMenu = () => {
    const burgerButton = document.getElementById('burgerButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;
    const breakpoint = 992; // Точка перехода на десктоп

    if (!burgerButton || !mobileMenu) return;

    // Функция закрытия меню
    const closeMenu = () => {
        mobileMenu.classList.add('d-none');
        body.style.overflow = 'auto';
        burgerButton.querySelector('i').classList.remove('bi-x-lg');
        burgerButton.querySelector('i').classList.add('bi-list');
    };

    // Функция проверки ширины экрана
    const checkScreenWidth = () => {
        if (window.innerWidth >= breakpoint && !mobileMenu.classList.contains('d-none')) {
            closeMenu();
        }
    };

    // Оригинальный код для toggleMenu
    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.toggle('d-none');
        body.style.overflow = isOpen ? 'auto' : 'hidden';

        const icon = burgerButton.querySelector('i');
        icon.classList.toggle('bi-list', isOpen);
        icon.classList.toggle('bi-x-lg', !isOpen);
    };

    // Слушатели событий
    burgerButton.addEventListener('click', toggleMenu);

    // Закрытие при клике на ссылку
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => !mobileMenu.classList.contains('d-none') && toggleMenu());
    });

    // Закрытие при клике вне меню
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) &&
            e.target !== burgerButton &&
            !burgerButton.contains(e.target) &&
            !mobileMenu.classList.contains('d-none')) {
            toggleMenu();
        }
    });

    // Проверка ширины экрана при загрузке и ресайзе
    window.addEventListener('load', checkScreenWidth);
    window.addEventListener('resize', Utils.debounce(checkScreenWidth, 100));
};

// Parallax effects
const initParallax = () => {
    // About section parallax
    const aboutBg = document.querySelector('.bg-image');
    if (aboutBg) {
        window.addEventListener('scroll', Utils.throttle(() => {
            aboutBg.style.transform = `scale(${1.1 + window.scrollY * 0.0002})`;
        }, 16));
    }

    // GSAP animations if available
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        // Hero parallax elements
        const parallaxElements = {
            bg: heroSection.querySelector('.parallax-bg'),
            text: heroSection.querySelector('.animated-text'),
            tagline: heroSection.querySelector('.tagline'),
            scrollBtn: heroSection.querySelector('.scroll-down-btn')
        };

        // Scroll-triggered animations
        if (parallaxElements.bg) {
            gsap.to(parallaxElements.bg, {
                y: 100,
                scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        if (parallaxElements.text && parallaxElements.tagline) {
            gsap.to([parallaxElements.text, parallaxElements.tagline], {
                y: 30,
                scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }

        // Initial animations
        const tl = gsap.timeline();
        if (parallaxElements.text) tl.to(parallaxElements.text, { y: 0, opacity: 1, duration: 1, ease: "power2.out" });
        if (parallaxElements.tagline) tl.to(parallaxElements.tagline, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0.3);
        if (parallaxElements.scrollBtn) tl.to(parallaxElements.scrollBtn, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0.6);

        // Mouse move parallax
        if (parallaxElements.bg && parallaxElements.text && parallaxElements.tagline) {
            window.addEventListener('mousemove', Utils.throttle((e) => {
                const x = (e.clientX - window.innerWidth / 2);
                const y = (e.clientY - window.innerHeight / 2);

                gsap.to(parallaxElements.bg, { x: x / 30, y: y / 30, ease: "power1.out", duration: 1 });
                gsap.to(parallaxElements.text, { x: x / 60, y: y / 60, ease: "power1.out", duration: 1 });
                gsap.to(parallaxElements.tagline, { x: x / 80, y: y / 80, ease: "power1.out", duration: 1 });
            }, 16));
        }

        // Smooth scroll for button
        if (parallaxElements.scrollBtn) {
            parallaxElements.scrollBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const href = e.currentTarget.getAttribute('href');

                // Анимация перед переходом
                gsap.to(window, {
                    scrollTo: { y: 0, autoKill: false },
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        window.location.href = href; // Переход после анимации
                    }
                });
            });
        }
    }
};

// Language selector (desktop only)
const initLanguageSelector = () => {
    if (window.innerWidth < 992) return;

    const selector = document.querySelector('.language-selector');
    const trigger = selector?.querySelector('.language-trigger');
    const dropdown = selector?.querySelector('.language-dropdown');
    const items = selector?.querySelectorAll('.language-item');

    if (!selector || !trigger || !dropdown) return;

    const toggleMenu = (show) => {
        const isExpanded = show ?? trigger.getAttribute('aria-expanded') === 'false';
        trigger.setAttribute('aria-expanded', isExpanded);
        dropdown.setAttribute('data-visible', isExpanded);
    };

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.language-code').textContent = item.dataset.lang.toUpperCase();
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            toggleMenu(false);
            console.log('Language changed to:', item.dataset.lang);
        });
    });

    document.addEventListener('click', () => toggleMenu(false));
};

// Header scroll effect
const initHeaderScroll = () => {
    const header = document.getElementById('mainHeader');
    const hero = document.getElementById('hero');

    if (!header || !hero) return;

    const updateHeader = Utils.throttle(() => {
        header.classList.toggle('scrolled', window.scrollY > hero.offsetHeight * 0.8);
    }, 100);

    window.addEventListener('scroll', updateHeader);
    updateHeader();
};

// Gallery slider
const initOptions = () => {
    const optionsContainer = document.querySelector('.options');
    const options = document.querySelectorAll('.option');
    const leftArrow = document.querySelector('.arrow-left');
    const rightArrow = document.querySelector('.arrow-right');

    optionsContainer.style.setProperty('--total-options', options.length);
    let currentActiveIndex = 0;
    let autoScrollInterval = null;
    const scrollDelay = 3000;

    const isMobile = () => window.innerWidth <= 768;

    const activateOption = (index) => {
        options.forEach((option) => option.classList.remove('active'));
        options[index].classList.add('active');
        currentActiveIndex = index;
    };

    const startAutoScroll = () => {
        if (autoScrollInterval) return;
        autoScrollInterval = setInterval(() => {
            let newIndex = (currentActiveIndex + 1) % options.length;
            activateOption(newIndex);
        }, scrollDelay);
    };

    const stopAutoScroll = () => {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    };

    optionsContainer.addEventListener('mouseleave', startAutoScroll);
    optionsContainer.addEventListener('mouseenter', stopAutoScroll);

    leftArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        stopAutoScroll();
        let newIndex = (currentActiveIndex - 1 + options.length) % options.length;
        activateOption(newIndex);
    });

    rightArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        stopAutoScroll();
        let newIndex = (currentActiveIndex + 1) % options.length;
        activateOption(newIndex);
    });

    // === 📱 Для мобилок: тап по слайду переключает на следующий ===
    optionsContainer.addEventListener('click', (event) => {
        const clickedOption = event.target.closest('.option');
        if (!clickedOption) return;

        stopAutoScroll();

        const clickedIndex = Array.from(options).indexOf(clickedOption);

        if (isMobile()) {
            let newIndex = (currentActiveIndex + 1) % options.length;
            activateOption(newIndex);
        } else {
            if (clickedIndex !== currentActiveIndex) {
                activateOption(clickedIndex);
            }
        }
    });

    // === Свайп-поддержка для мобильных ===
    let touchStartX = 0;

    optionsContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    optionsContainer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;

        if (Math.abs(deltaX) > 50) {
            stopAutoScroll();
            if (deltaX > 0) {
                let newIndex = (currentActiveIndex - 1 + options.length) % options.length;
                activateOption(newIndex);
            } else {
                let newIndex = (currentActiveIndex + 1) % options.length;
                activateOption(newIndex);
            }
        }
    });

    // Запуск
    activateOption(0);
    startAutoScroll();
};

document.addEventListener('DOMContentLoaded', initOptions);


// Portfolio initialization
const initPortfolio = () => {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Modal implementation would go here
        });
    });
};

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
    initScrollToTop();
    initBurgerMenu();
    initParallax();
    initHeaderScroll();
    initPortfolio();
    initGallery();

    // Desktop-only features
    if (window.innerWidth >= 992) {
        initLanguageSelector();
    }

    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init();
    }
});

// Handle window resize for responsive features
window.addEventListener('resize', Utils.debounce(() => {
    // Для language selector
    if (window.innerWidth >= 992) {
        initLanguageSelector();
    }

    // Для бургер-меню
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && !mobileMenu.classList.contains('d-none') && window.innerWidth >= 992) {
        mobileMenu.classList.add('d-none');
        document.body.style.overflow = 'auto';
        const burgerButton = document.getElementById('burgerButton');
        if (burgerButton) {
            burgerButton.querySelector('i').classList.remove('bi-x-lg');
            burgerButton.querySelector('i').classList.add('bi-list');
        }
    }
}, 250));

