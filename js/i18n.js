class I18n {
    constructor() {
        this.languages = ['pl', 'uk', 'en'];
        this.defaultLang = 'pl';
        this.currentLang = this.getSavedLanguage();
        this.translations = {};

        this.init();
    }

    async init() {
        await this.loadTranslations();
        this.applyLanguage(this.currentLang);
        this.setupLanguageSwitcher();
    }

    getSavedLanguage() {
        const savedLang = localStorage.getItem('selectedLanguage');
        const browserLang = navigator.language.slice(0, 2);
        return savedLang || (this.languages.includes(browserLang) ? browserLang : this.defaultLang);
    }

    async loadTranslations() {
        const requests = this.languages.map(lang =>
            fetch(`lang/${lang}.json`)
                .then(response => response.json())
                .then(data => { this.translations[lang] = data; })
                .catch(() => console.error(`Failed to load ${lang} translations`))
        );

        await Promise.all(requests);
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) return;

        document.documentElement.lang = lang;
        localStorage.setItem('selectedLanguage', lang);

        // Обновляем meta-теги
        document.title = this.translations[lang].meta.title;
        document.querySelector('meta[name="description"]').content = this.translations[lang].meta.description;

        // Обновляем контент страницы
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const keys = element.getAttribute('data-i18n').split('.');
            let value = this.translations[lang];

            keys.forEach(key => {
                if (key.includes('[') && key.includes(']')) {
                    const arrayKey = key.split('[')[0];
                    const index = key.match(/\[(\d+)\]/)[1];
                    value = value?.[arrayKey]?.[index];
                } else {
                    value = value?.[key];
                }
            });

            if (value !== undefined) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                } else {
                    element.innerHTML = value;
                }
            }
        });

        // Обновляем списки услуг
        this.updateServicesList(lang);

        // Обновляем активный язык в селекторе
        document.querySelector('.language-code').textContent = lang.toUpperCase();
        document.querySelectorAll('.language-item').forEach(item => {
            item.classList.toggle('active', item.dataset.lang === lang);
        });
    }

    updateServicesList(lang) {
        const services = this.translations[lang]?.services;
        if (!services) return;

        // Женские услуги
        const womenList = document.getElementById('women-services-list');
        if (womenList) {
            womenList.innerHTML = services.women_services.map(service => `
                <div class="service-item">
                    <div class="service-name">${service.name}</div>
                    <div class="service-dots"></div>
                    <div class="service-price">${service.price}</div>
                </div>
            `).join('');
        }
        const menList = document.getElementById('men-services-list');
        if (menList) {
            menList.innerHTML = services.men_services.map(service => `
                <div class="service-item">
                    <div class="service-name">${service.name}</div>
                    <div class="service-dots"></div>
                    <div class="service-price">${service.price}</div>
                </div>
            `).join('');
        }
        // Аналогично для мужских и детских услуг
    }

    setupLanguageSwitcher() {
        const trigger = document.querySelector('.language-trigger');
        const dropdown = document.querySelector('.language-dropdown');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.querySelectorAll('.language-link, .language-link-burger').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = e.currentTarget.dataset.lang;
                this.applyLanguage(lang);
                dropdown.classList.remove('active');
            });
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});