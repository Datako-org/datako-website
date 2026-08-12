(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const story = document.querySelector('[data-data-story]');
    const journey = document.querySelector('[data-decision-journey]');
    const revealItems = document.querySelectorAll('[data-reveal]');
    // La home ne charge pas page-motion.js : sans cet observateur, un titre
    // marqué .reveal resterait masqué par son cache.
    const coverReveals = [...document.querySelectorAll('.reveal')];
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

    // Step labels are read from the markup and the announcement wording comes from
    // data-step-message, so src/locales stays the single source of truth for both the
    // visible steps and what screen readers hear.
    const ownText = element => [...element.childNodes]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent)
        .join('')
        .trim();

    const announcements = (host, labels) => {
        const pattern = host?.dataset.stepMessage || '';
        const locale = document.documentElement.lang || 'fr';
        return labels.map((label, index) => pattern
            .replace('{step}', String(index + 1))
            .replace('{total}', String(labels.length))
            .replace('{label}', label.toLocaleLowerCase(locale)));
    };

    const storyLabels = [...document.querySelectorAll('[data-story-label]')].map(ownText);
    const storyMessages = announcements(story, storyLabels);
    const journeyLabels = [...document.querySelectorAll('[data-journey-step] strong')]
        .map(element => element.textContent.trim());
    const journeyMessages = announcements(journey, journeyLabels);
    const journeyStepDuration = 1700;

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
        const liveRegion = journey.querySelector('[data-journey-live]');
        if (panelLabel) panelLabel.textContent = journeyLabels[4];
        if (liveRegion) liveRegion.textContent = journeyMessages[4];
        journey.dataset.played = 'true';
    };

    const setJourneyStep = (index, steps) => {
        journey.dataset.step = String(index);
        const panelLabel = journey.querySelector('[data-journey-panel-label]');
        const liveRegion = journey.querySelector('[data-journey-live]');
        if (panelLabel) panelLabel.textContent = journeyLabels[index];
        if (liveRegion) liveRegion.textContent = journeyMessages[index];
        steps.forEach((item, itemIndex) => {
            item.classList.toggle('is-active', itemIndex === index);
            item.classList.toggle('is-past', itemIndex < index);
        });
    };

    const resetJourney = () => {
        if (!journey) return;
        journey.classList.remove('is-complete');
        journey.querySelectorAll('[data-journey-step]').forEach(step => {
            step.classList.remove('is-active', 'is-past');
        });
    };

    const playJourney = ({ replay = false } = {}) => {
        if (!journey || (journey.dataset.played === 'true' && !replay)) return;
        if (reducedMotion.matches) {
            completeJourney();
            return;
        }

        resetJourney();
        journey.dataset.played = 'true';
        const steps = [...journey.querySelectorAll('[data-journey-step]')];
        setJourneyStep(0, steps);
        steps.forEach((step, index) => {
            if (index === 0) return;
            later(() => {
                setJourneyStep(index, steps);
            }, index * journeyStepDuration);
        });
        later(completeJourney, steps.length * journeyStepDuration);
    };

    const useStaticState = () => {
        clearTimers();
        setStoryStep(3);
        if (story) story.dataset.played = 'true';
        completeJourney();
        revealItems.forEach(item => item.classList.add('is-revealed'));
        coverReveals.forEach(item => item.classList.add('is-revealed'));
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

    journey?.querySelector('[data-journey-replay]')?.addEventListener('click', () => {
        clearTimers();
        playJourney({ replay: true });
    });

    reducedMotion.addEventListener?.('change', event => {
        if (event.matches) useStaticState();
    });
})();
