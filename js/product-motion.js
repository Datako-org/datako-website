(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sequences = [...document.querySelectorAll('[data-product-sequence]')];

    // Un pas de séquence peut déclarer la donnée qu'il produit via
    // data-fills="nom" ; la cible correspondante porte data-slot="nom" et se
    // remplit au moment exact où le pas apparaît. C'est ce lien qui fait la
    // démonstration : le cockpit se complète parce que le terrain a répondu,
    // pas en parallèle. La portée est le plus proche [data-sequence-scope],
    // pour que la cible puisse vivre hors de la séquence.
    const scopeOf = sequence => sequence.closest('[data-sequence-scope]') || document;

    const applyFills = (sequence, upTo) => {
        const scope = scopeOf(sequence);
        [...sequence.querySelectorAll('[data-sequence-step]')].forEach((step, index) => {
            const name = step.dataset.fills;
            if (!name) return;
            scope.querySelectorAll(`[data-slot="${name}"]`).forEach(target => {
                target.classList.toggle('is-filled', index <= upTo);
            });
        });
    };

    const finish = sequence => {
        const steps = [...sequence.querySelectorAll('[data-sequence-step]')];
        sequence.dataset.step = String(Math.max(0, steps.length - 1));
        sequence.classList.add('is-complete');
        steps.forEach(step => {
            step.classList.remove('is-current');
            step.classList.add('is-complete');
        });
        applyFills(sequence, steps.length - 1);
    };

    const play = sequence => {
        if (sequence.dataset.played === 'true') return;
        sequence.dataset.played = 'true';
        const steps = [...sequence.querySelectorAll('[data-sequence-step]')];
        const delay = Number(sequence.dataset.sequenceDelay) || 780;

        steps.forEach((step, index) => {
            window.setTimeout(() => {
                sequence.dataset.step = String(index);
                steps.forEach((candidate, candidateIndex) => {
                    candidate.classList.toggle('is-current', candidateIndex === index);
                    candidate.classList.toggle('is-complete', candidateIndex < index);
                });
                applyFills(sequence, index);
            }, index * delay);
        });
        window.setTimeout(() => finish(sequence), steps.length * delay);
    };

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        sequences.forEach(finish);
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            play(entry.target);
        });
    }, { threshold: 0.28, rootMargin: '0px 0px -5% 0px' });

    sequences.forEach(sequence => observer.observe(sequence));
    reducedMotion.addEventListener?.('change', event => {
        if (event.matches) sequences.forEach(finish);
    });
})();
