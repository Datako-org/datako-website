document.addEventListener('DOMContentLoaded', () => {

    // --- LANGUAGE LOGIC START ---
    const isEnglish = window.location.pathname.includes('/en/');
    const savedLang = localStorage.getItem('datako_lang');
    const currentPath = window.location.pathname;
    const filename = currentPath.split('/').pop() || 'index.html';
    const frToEnRoutes = {
        'mentions-legales.html': 'legal.html',
        'politique-confidentialite.html': 'privacy.html',
        'merci.html': 'thanks.html'
    };
    const enToFrRoutes = Object.fromEntries(Object.entries(frToEnRoutes).map(([fr, en]) => [en, fr]));
    const localizedFilename = targetLanguage => targetLanguage === 'en'
        ? (frToEnRoutes[filename] || filename)
        : (enToFrRoutes[filename] || filename);
    const WHATSAPP_PHONE = "+224612434545";
    // Auto-Redirect based on preference (only if explicitly saved)
    if (savedLang === 'en' && !isEnglish) {
        // Redirect to EN
        window.location.href = 'en/' + localizedFilename('en');
    } else if (savedLang === 'fr' && isEnglish) {
        // Redirect to FR (Root)
        window.location.href = '../' + localizedFilename('fr');
    }

    // Language Switcher Injection
    const navMenu = document.querySelector(".nav-menu");
    if (navMenu) {
        const li = document.createElement('li');
        li.className = 'nav-item';

        li.innerHTML = `
            <div class="lang-switcher" aria-label="${isEnglish ? 'Language' : 'Langue'}">
                <button type="button" class="lang-opt ${!isEnglish ? 'active' : ''}" data-lang="fr" lang="fr" aria-pressed="${!isEnglish}">FR</button>
                <span class="lang-divider" aria-hidden="true">/</span>
                <button type="button" class="lang-opt ${isEnglish ? 'active' : ''}" data-lang="en" lang="en" aria-pressed="${isEnglish}">EN</button>
            </div>
        `;
        navMenu.appendChild(li);

        // Bind Events
        li.querySelectorAll('.lang-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                const lang = opt.getAttribute('data-lang');
                if ((lang === 'en' && isEnglish) || (lang === 'fr' && !isEnglish)) return; // Already here

                localStorage.setItem('datako_lang', lang);

                if (lang === 'en') {
                    window.location.href = isEnglish ? '#' : 'en/' + localizedFilename('en');
                } else {
                    window.location.href = isEnglish ? '../' + localizedFilename('fr') : '#';
                }
            });
        });
    }
    // --- LANGUAGE LOGIC END ---

    // Theme control — light by default, explicit choice persisted. Visitors
    // who already picked dark keep it: only the fallback changed.
    const root = document.documentElement;
    const themeStorageKey = 'datako_theme';
    const getTheme = () => localStorage.getItem(themeStorageKey) || 'light';
    // Les captures produit existent en deux versions. On échange la source
    // plutôt que d'empiler deux <img> masqués : un navigateur télécharge une
    // image en display:none, même en loading="lazy" — les deux variantes
    // partaient donc sur le réseau. Ici une seule est demandée.
    const swapShots = theme => {
        document.querySelectorAll('[data-shot-light]').forEach(img => {
            const next = theme === 'dark' ? img.dataset.shotDark : img.dataset.shotLight;
            if (!next || img.getAttribute('src') === next) return;
            // Les deux variantes n'ont pas le même rapport : sans mise à jour
            // des dimensions intrinsèques, la boîte réservée serait fausse.
            const size = (theme === 'dark' ? img.dataset.shotDarkSize : img.dataset.shotLightSize || '').split('x');
            if (size.length === 2) {
                img.setAttribute('width', size[0]);
                img.setAttribute('height', size[1]);
            }
            img.setAttribute('src', next);
        });
    };

    const setTheme = (theme, persist = true) => {
        root.dataset.theme = theme;
        if (persist) localStorage.setItem(themeStorageKey, theme);
        swapShots(theme);

        document.querySelectorAll('.theme-toggle').forEach(button => {
            const nextTheme = theme === 'dark' ? 'light' : 'dark';
            const label = isEnglish
                ? `Use ${nextTheme} theme`
                : `Activer le thème ${nextTheme === 'dark' ? 'sombre' : 'clair'}`;
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
            button.setAttribute('aria-pressed', String(theme === 'dark'));
            button.dataset.themeCurrent = theme;
        });
    };

    let themeToggle = document.querySelector('.theme-toggle');
    const headerNav = document.querySelector('.header nav');
    if (!themeToggle && headerNav) {
        themeToggle = document.createElement('button');
        themeToggle.type = 'button';
        themeToggle.className = 'theme-toggle';
        // Icônes vectorielles plutôt que dessinées en CSS : le soleil était un
        // cercle et quatre points cardinaux, ce qui se lisait comme un losange.
        // Huit rayons pour le soleil, un croissant franc pour la lune.
        themeToggle.innerHTML = `
            <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2"/>
                <path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>
            </svg>
            <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z"/>
            </svg>
        `;
        headerNav.appendChild(themeToggle);
    }
    setTheme(getTheme(), false);

    themeToggle?.addEventListener('click', () => {
        setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });

    // Plus d'écoute du thème système : le site part en clair quoi qu'il
    // arrive, et suivre l'OS ferait basculer la page sous les yeux d'un
    // visiteur qui n'a rien demandé.

    // Accessible mobile navigation. Legacy div toggles are upgraded to real buttons.
    let hamburger = document.querySelector('.hamburger');
    if (hamburger && hamburger.tagName !== 'BUTTON') {
        const menuButton = document.createElement('button');
        menuButton.type = 'button';
        menuButton.className = hamburger.className;
        menuButton.innerHTML = hamburger.innerHTML;
        hamburger.replaceWith(menuButton);
        hamburger = menuButton;
    }

    if (hamburger && navMenu) {
        const menuId = navMenu.id || 'primary-navigation';
        const menuLabel = isEnglish ? 'Main navigation' : 'Navigation principale';
        navMenu.id = menuId;
        navMenu.setAttribute('aria-label', menuLabel);
        hamburger.setAttribute('aria-controls', menuId);
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', isEnglish ? 'Open menu' : 'Ouvrir le menu');

        const backdrop = document.createElement('button');
        backdrop.type = 'button';
        backdrop.className = 'nav-backdrop';
        backdrop.tabIndex = -1;
        backdrop.setAttribute('aria-label', isEnglish ? 'Close menu' : 'Fermer le menu');
        document.body.appendChild(backdrop);

        let focusBeforeMenu = null;
        const mobileMenuQuery = window.matchMedia('(max-width: 1080px)');
        const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const menuIsOpen = () => navMenu.classList.contains('active');
        const setMenuAvailability = available => {
            navMenu.inert = !available;
            if (available) navMenu.removeAttribute('aria-hidden');
            else navMenu.setAttribute('aria-hidden', 'true');
        };

        const syncMenuMode = () => {
            if (mobileMenuQuery.matches) setMenuAvailability(menuIsOpen());
            else setMenuAvailability(true);
        };

        const openMenu = () => {
            focusBeforeMenu = document.activeElement;
            setMenuAvailability(true);
            hamburger.classList.add('active');
            navMenu.classList.add('active');
            backdrop.classList.add('active');
            document.body.classList.add('nav-open');
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.setAttribute('aria-label', isEnglish ? 'Close menu' : 'Fermer le menu');
            requestAnimationFrame(() => navMenu.querySelector(focusableSelector)?.focus());
        };

        const closeMenu = ({ restoreFocus = true } = {}) => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.classList.remove('nav-open');
            setMenuAvailability(!mobileMenuQuery.matches);
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', isEnglish ? 'Open menu' : 'Ouvrir le menu');
            if (restoreFocus && focusBeforeMenu instanceof HTMLElement) focusBeforeMenu.focus();
        };

        hamburger.addEventListener('click', () => menuIsOpen() ? closeMenu() : openMenu());
        backdrop.addEventListener('click', () => closeMenu());

        navMenu.querySelectorAll('a, .lang-opt').forEach(item => {
            item.addEventListener('click', () => closeMenu({ restoreFocus: false }));
        });

        document.addEventListener('keydown', event => {
            if (!menuIsOpen()) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu();
                return;
            }

            if (event.key !== 'Tab') return;
            const focusableItems = [
                ...navMenu.querySelectorAll(focusableSelector),
                ...(themeToggle ? [themeToggle] : []),
                hamburger
            ];
            const firstItem = focusableItems[0];
            const lastItem = focusableItems[focusableItems.length - 1];

            if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
            } else if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1080 && menuIsOpen()) closeMenu({ restoreFocus: false });
            syncMenuMode();
        });

        mobileMenuQuery.addEventListener?.('change', syncMenuMode);
        syncMenuMode();
    }

    // Active Link Highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Simple check: matches filename or is index match
        const isMatch = href === filename ||
            (filename === '' && href === 'index.html') ||
            (href.endsWith(filename) && filename !== '');

        if (isMatch) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Floating Button (Optional)
    const floatBtn = document.querySelector('.floating-btn');
    // Logic preserved

    // Modal Logic
    const openModalBtns = document.querySelectorAll('[data-open-modal]');
    const closeModalBtns = document.querySelectorAll('.modal-close');
    const modals = document.querySelectorAll('.modal-overlay');

    if (openModalBtns.length > 0) {
        let modalTrigger = null;
        const modalFocusable = 'button:not([disabled]), a[href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

        modals.forEach((modal, index) => {
            const dialog = modal.querySelector('.modal-container');
            const title = dialog?.querySelector('h2');
            if (dialog) {
                dialog.setAttribute('role', 'dialog');
                dialog.setAttribute('aria-modal', 'true');
                dialog.setAttribute('tabindex', '-1');
            }
            if (title && dialog) {
                title.id ||= `modal-title-${index + 1}`;
                dialog.setAttribute('aria-labelledby', title.id);
            }
            modal.setAttribute('aria-hidden', 'true');
        });

        const closeModal = (modal, restoreFocus = true) => {
            if (!modal) return;
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
            if (restoreFocus && modalTrigger instanceof HTMLElement) modalTrigger.focus();
            modalTrigger = null;
        };

        const openModal = (modal, trigger) => {
            modalTrigger = trigger;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('no-scroll');
            requestAnimationFrame(() => {
                const initialFocus = modal.querySelector('.modal-close, input:not([type="hidden"]), select, textarea, button');
                initialFocus?.focus();
            });
        };

        openModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = btn.getAttribute('data-open-modal');
                const modal = document.getElementById(modalId);
                if (modal) openModal(modal, btn);
            });
        });

        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay')));
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        });

        document.addEventListener('keydown', (e) => {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (!activeModal) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal(activeModal);
                return;
            }

            if (e.key === 'Tab') {
                const focusable = [...activeModal.querySelectorAll(modalFocusable)];
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (!first || !last) return;
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // Shared Contact Form Component (Bilingual) - Netlify Forms Version
    const formContainer = document.getElementById('contact-form-container');
    if (formContainer) {
        // Translations for form
        const t = isEnglish ? {
            ph_firstname: "First Name",
            ph_lastname: "Last Name",
            ph_email: "Professional Email",
            ph_message: "Your Message",
            opt_default: "Subject of your request",
            opt_1: "Consulting & Projects",
            opt_2: "Training",
            opt_3: "Recruitment / Partnership",
            opt_4: "Other",
            btn: "Send Message",
            privacy: "We never share your information."
        } : {
            ph_firstname: "Prénom",
            ph_lastname: "Nom",
            ph_email: "Email professionnel",
            ph_message: "Votre message",
            opt_default: "Sujet de votre demande",
            opt_1: "Consulting & Projets",
            opt_2: "Formation",
            opt_3: "Recrutement / Partenariat",
            opt_4: "Autre",
            btn: "Envoyer le message",
            privacy: "Nous ne partageons jamais vos informations."
        };

        const formName = isEnglish ? 'contact-en' : 'contact-fr';
        const formAction = isEnglish ? '/en/thanks' : '/merci';

        const contactFormHTML = `
        <form
            name="${formName}" 
            method="POST" 
            data-netlify="true"
            action="${formAction}"
            netlify-honeypot="bot-field"
            id="contactForm"
            class="modal-form">
            
            <!-- Champ caché obligatoire pour Netlify -->
            <input type="hidden" name="form-name" value="${formName}" />
            
            <!-- Anti-spam honeypot (masqué) -->
            <p style="display: none;">
                <label>Don't fill this out: <input name="bot-field" /></label>
            </p>
            
            <div class="form-row">
                <label class="form-field"><span>${t.ph_firstname}</span><input type="text" name="prenom" autocomplete="given-name" placeholder="${t.ph_firstname}" required></label>
                <label class="form-field"><span>${t.ph_lastname}</span><input type="text" name="nom" autocomplete="family-name" placeholder="${t.ph_lastname}" required></label>
            </div>
            <label class="form-field"><span>${t.ph_email}</span><input type="email" name="email" autocomplete="email" placeholder="${t.ph_email}" required></label>
            <label class="form-field"><span>${t.opt_default}</span><select name="sujet" required>
                <option value="" disabled selected>${t.opt_default}</option>
                <option value="consulting">${t.opt_1}</option>
                <option value="formation">${t.opt_2}</option>
                <option value="recrutement">${t.opt_3}</option>
                <option value="autre">${t.opt_4}</option>
            </select></label>
            <label class="form-field"><span>${t.ph_message}</span><textarea name="message" rows="5" placeholder="${t.ph_message}" required></textarea></label>
            <button type="submit" class="site-btn site-btn-primary">${t.btn}</button>
            <div class="form-reassurance-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ${t.privacy}
            </div>
        </form>
    `;
        formContainer.innerHTML = contactFormHTML;
    }

    // Scroll Reveal Animation (Preserved)
    const processSteps = document.querySelectorAll('.process-step');
    if (processSteps.length > 0) {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: "0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        processSteps.forEach((step, index) => {
            step.style.transitionDelay = `${index * 100}ms`;
            observer.observe(step);
        });
    }
    // --- WHATSAPP FLOATING BUTTON START ---

    const waMessages = isEnglish ? {
        text: "Hello, I'm contacting you via the Datakö website to discuss a Data / AI need.",
        tooltip: "WhatsApp"
    } : {
        text: "Bonjour, je vous contacte via le site Datakö pour échanger sur un besoin Data / IA.",
        tooltip: "Discuter sur WhatsApp"
    };

    const waEncoded = encodeURIComponent(waMessages.text);
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${waEncoded}`;

    const waBtn = document.createElement('a');
    waBtn.className = 'whatsapp-float-btn';
    waBtn.href = waUrl;
    waBtn.target = '_blank';
    waBtn.setAttribute('rel', 'noopener noreferrer');
    waBtn.setAttribute('data-tooltip', waMessages.tooltip);
    waBtn.setAttribute('aria-label', waMessages.tooltip);

    // WhatsApp Icon SVG
    waBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    `;

    document.body.appendChild(waBtn);
    const contactHero = document.querySelector('.home-hero, .fleet-hero, .stations-hero');
    if (contactHero && 'IntersectionObserver' in window) {
        waBtn.classList.add('hero-delayed');
        const waObserver = new IntersectionObserver(entries => {
            const heroVisible = entries.some(entry => entry.isIntersecting);
            waBtn.classList.toggle('is-visible', !heroVisible);
        }, { threshold: 0.08 });
        waObserver.observe(contactHero);
    }
    // --- WHATSAPP FLOATING BUTTON END ---

});
