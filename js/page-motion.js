(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealItems = [...document.querySelectorAll('[data-page-reveal]')];
    // cover-reveal : opt-in, posé à la main sur les H1 et les moments
    // structurants. Aucun titre ne s'anime sans avoir été marqué.
    const coverReveals = [...document.querySelectorAll('.reveal')];
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

    reducedMotion.addEventListener?.('change', event => {
        if (event.matches) useStaticState();
    });
})();
