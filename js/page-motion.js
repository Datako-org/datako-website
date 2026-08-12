(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealItems = [...document.querySelectorAll('[data-page-reveal]')];
    // cover-reveal : opt-in, posé à la main sur les H1 et les moments
    // structurants. Aucun titre ne s'anime sans avoir été marqué.
    const coverReveals = [...document.querySelectorAll('.reveal')];
    const cameras = [...document.querySelectorAll('[data-camera]')];
    const valueChain = document.querySelector('[data-value-chain]');
    const chainSteps = valueChain ? [...valueChain.querySelectorAll('[data-chain-step]')] : [];
    const timers = [];

    const clearTimers = () => {
        timers.forEach(timer => window.clearTimeout(timer));
        timers.length = 0;
    };

    const setChainStep = index => {
        if (!valueChain) return;
        valueChain.dataset.step = String(index);
        chainSteps.forEach((step, stepIndex) => {
            step.classList.toggle('is-current', stepIndex === index);
            step.classList.toggle('is-complete', stepIndex < index);
        });
    };

    const completeChain = () => {
        if (!valueChain) return;
        valueChain.dataset.step = String(Math.max(0, chainSteps.length - 1));
        valueChain.classList.add('is-complete');
        chainSteps.forEach(step => {
            step.classList.remove('is-current');
            step.classList.add('is-complete');
        });
    };

    const playChain = () => {
        if (!valueChain || valueChain.dataset.played === 'true') return;
        valueChain.dataset.played = 'true';
        setChainStep(0);
        chainSteps.forEach((_, index) => {
            if (!index) return;
            timers.push(window.setTimeout(() => setChainStep(index), index * 1050));
        });
        timers.push(window.setTimeout(completeChain, chainSteps.length * 1050));
    };

    const useStaticState = () => {
        clearTimers();
        revealItems.forEach(item => item.classList.add('is-visible'));
        coverReveals.forEach(item => item.classList.add('is-revealed'));
        // Sans ça, la caméra resterait sur son état d'arrivée — inclinée et
        // transparente — pour les personnes en mouvement réduit.
        cameras.forEach(camera => camera.classList.add('is-settled'));
        completeChain();
    };

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        useStaticState();
        return;
    }

    if (revealItems.length) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
        revealItems.forEach(item => revealObserver.observe(item));
    }

    if (coverReveals.length) {
        const coverObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                coverObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        coverReveals.forEach(item => coverObserver.observe(item));
    }

    if (valueChain) {
        const chainObserver = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            chainObserver.disconnect();
            playChain();
        }, { threshold: 0.32 });
        chainObserver.observe(valueChain);
    }

    // ── Caméra produit ────────────────────────────────────────────────────
    // Réf 04 : une caméra au-dessus de l'interface. Volontairement sans zoom —
    // les captures pèsent 44 Ko, un agrandissement les détruirait — et
    // volontairement brève : le hero pose le produit, c'est M3 qui démontre.
    // Le repos est plat : l'inclinaison n'existe que le temps de l'arrivée,
    // puis la parallaxe reste sous 1,6° pour ne jamais déformer un chiffre.
    const finePointer = window.matchMedia('(min-width: 1100px) and (pointer: fine)');

    if (cameras.length) {
        const settleObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-settled');
                settleObserver.unobserve(entry.target);
            });
        }, { threshold: 0.25 });
        cameras.forEach(camera => settleObserver.observe(camera));

        cameras.forEach(camera => {
            let frame = 0;
            camera.addEventListener('pointermove', event => {
                if (!finePointer.matches) return;
                if (frame) return;
                frame = requestAnimationFrame(() => {
                    frame = 0;
                    const box = camera.getBoundingClientRect();
                    const x = (event.clientX - box.left) / box.width - 0.5;
                    const y = (event.clientY - box.top) / box.height - 0.5;
                    camera.style.setProperty('--cam-y', (x * 1.6).toFixed(2));
                    camera.style.setProperty('--cam-x', (-y * 1).toFixed(2));
                });
            });
            camera.addEventListener('pointerleave', () => {
                camera.style.setProperty('--cam-y', '0');
                camera.style.setProperty('--cam-x', '0');
            });
        });

        // Trajet narratif : la caméra va chercher les chiffres marqués
        // data-focus, dans l'ordre, puis recule et s'arrête pour de bon. Elle
        // ne rejoue pas — un mouvement qui reboucle cesse de vouloir dire
        // quelque chose. La parallaxe reprend la main une fois posée.
        cameras.filter(camera => camera.querySelector('[data-focus]')).forEach(camera => {
            const stops = [...camera.querySelectorAll('[data-focus]')]
                .map(target => target.dataset.focus);
            let started = false;

            const travel = () => {
                if (started) return;
                started = true;
                stops.forEach((stop, index) => {
                    window.setTimeout(() => { camera.dataset.travelling = stop; }, 700 + index * 1250);
                });
                window.setTimeout(() => { camera.dataset.travelling = '0'; }, 700 + stops.length * 1250);
                // L'attribut est retiré pour rendre le contrôle à la parallaxe,
                // qui écrit sur les mêmes transformations.
                window.setTimeout(() => { delete camera.dataset.travelling; }, 2100 + stops.length * 1250);
            };

            const travelObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    travelObserver.unobserve(entry.target);
                    travel();
                });
            }, { threshold: 0.45 });
            travelObserver.observe(camera);
        });
    }

    // ── Vitrine des modules (hero Solutions) ────────────────────────────
    // Rotation automatique entre Fleet, Distribution et Stations. La pause
    // est évaluée AU MOMENT du tick plutôt que pilotée par mouseenter et
    // mouseleave : une paire d'événements manquée suffisait à figer la
    // rotation définitivement.
    const showcase = document.querySelector('[data-module-showcase]');

    if (showcase) {
        const rail = showcase.querySelector('.showcase-rail');
        const screen = showcase.querySelector('.showcase-screen');
        const label = showcase.querySelector('[data-showcase-label]');
        const tabs = [...rail.querySelectorAll('button[data-showcase]')];
        const panes = [...showcase.querySelectorAll('.showcase-stack [data-showcase]')];
        // Le libellé de la barre de fenêtre voyage sur l'onglet lui-même :
        // il vient ainsi du dictionnaire et reste traduisible.
        let stopped = false;

        const show = tab => {
            const name = tab.dataset.showcase;
            tabs.forEach(other => other.setAttribute('aria-selected', String(other === tab)));
            panes.forEach(pane => pane.classList.toggle('is-active', pane.dataset.showcase === name));
            if (tab.dataset.caption) label.textContent = tab.dataset.caption;
        };

        rail.addEventListener('click', event => {
            const tab = event.target.closest('button[data-showcase]');
            if (!tab) return;
            // Un clic rend la main au visiteur : la rotation s'arrête pour de bon.
            stopped = true;
            show(tab);
        });

        if (!reducedMotion.matches) {
            window.setInterval(() => {
                if (stopped || document.hidden) return;
                if (screen.matches(':hover') || rail.matches(':hover')) return;
                if (screen.contains(document.activeElement) || rail.contains(document.activeElement)) return;
                const current = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
                show(tabs[(current + 1) % tabs.length]);
            }, 4000);
        }
    }

    reducedMotion.addEventListener?.('change', event => {
        if (event.matches) useStaticState();
    });
})();
