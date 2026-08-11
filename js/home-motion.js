(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const story = document.querySelector('[data-data-story]');
    const journey = document.querySelector('[data-decision-journey]');
    const revealItems = document.querySelectorAll('[data-reveal]');
    const timers = new Set();

    const later = (callback, delay) => {
        const timer = window.setTimeout(() => {
            timers.delete(timer);
            callback();
        }, delay);
        timers.add(timer);
        return timer;
    };

    const clearTimers = () => {
        timers.forEach(timer => window.clearTimeout(timer));
        timers.clear();
    };

    const storyMessages = [
        'Étape 1 sur 3 : données dispersées.',
        'Étape 2 sur 3 : information structurée.',
        'Étape 3 sur 3 : décision éclairée.'
    ];
    const journeyLabels = [
        'Données dispersées',
        'Données centralisées',
        'Données organisées',
        'Information exploitable',
        'Décision éclairée'
    ];

    const setStoryStep = step => {
        if (!story) return;
        story.dataset.step = String(step);
        const liveRegion = story.querySelector('[data-story-live]');
        if (liveRegion) liveRegion.textContent = storyMessages[Math.min(step, 2)];
    };

    const playStory = ({ replay = false } = {}) => {
        if (!story || reducedMotion.matches) return;
        if (story.dataset.played === 'true' && !replay) return;

        story.dataset.played = 'true';
        setStoryStep(0);
        later(() => setStoryStep(1), replay ? 180 : 700);
        later(() => setStoryStep(2), replay ? 900 : 1550);
        later(() => setStoryStep(3), replay ? 1650 : 2400);
    };

    const completeJourney = () => {
        if (!journey) return;
        journey.querySelectorAll('[data-journey-step]').forEach(step => {
            step.classList.remove('is-active');
            step.classList.add('is-past');
        });
        journey.classList.add('is-complete');
        journey.dataset.step = '4';
        const panelLabel = journey.querySelector('[data-journey-panel-label]');
        if (panelLabel) panelLabel.textContent = journeyLabels[4];
        journey.dataset.played = 'true';
    };

    const playJourney = () => {
        if (!journey || journey.dataset.played === 'true') return;
        if (reducedMotion.matches) {
            completeJourney();
            return;
        }

        journey.dataset.played = 'true';
        const steps = [...journey.querySelectorAll('[data-journey-step]')];
        steps.forEach((step, index) => {
            later(() => {
                journey.dataset.step = String(index);
                const panelLabel = journey.querySelector('[data-journey-panel-label]');
                if (panelLabel) panelLabel.textContent = journeyLabels[index];
                steps.forEach((item, itemIndex) => {
                    item.classList.toggle('is-active', itemIndex === index);
                    item.classList.toggle('is-past', itemIndex < index);
                });
            }, index * 390);
        });
        later(completeJourney, steps.length * 390 + 260);
    };

    const useStaticState = () => {
        clearTimers();
        setStoryStep(3);
        if (story) story.dataset.played = 'true';
        completeJourney();
        revealItems.forEach(item => item.classList.add('is-revealed'));
    };

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        useStaticState();
    } else {
        if (story) {
            const storyObserver = new IntersectionObserver(entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                storyObserver.disconnect();
                playStory();
            }, { threshold: 0.32 });
            storyObserver.observe(story);
        }

        if (journey) {
            const journeyObserver = new IntersectionObserver(entries => {
                if (!entries.some(entry => entry.isIntersecting)) return;
                journeyObserver.disconnect();
                playJourney();
            }, { threshold: 0.22, rootMargin: '0px 0px -8% 0px' });
            journeyObserver.observe(journey);
        }

        if (revealItems.length) {
            const revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-revealed');
                    revealObserver.unobserve(entry.target);
                });
            }, { threshold: 0.18 });
            revealItems.forEach(item => revealObserver.observe(item));
        }
    }

    story?.querySelector('[data-story-replay]')?.addEventListener('click', () => {
        clearTimers();
        playStory({ replay: true });
    });

    reducedMotion.addEventListener?.('change', event => {
        if (event.matches) useStaticState();
    });
})();
