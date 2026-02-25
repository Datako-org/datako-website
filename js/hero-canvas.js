/**
 * Premium Hero Animation - Particle Network (Canvas API)
 * Replaces the static image with a subtle, flowing data network.
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('hero-canvas-container');
    if (!container) return; // Only run on pages with the hero canvas container

    // Check degraded environment (Mobile or Reduced Motion)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768; // Simple mobile check

    if (prefersReducedMotion || isMobile) {
        // Graceful fallback for mobile or accessibility
        container.style.background = 'radial-gradient(circle at 50% 50%, rgba(58, 122, 254, 0.15) 0%, transparent 70%)';
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none'; // so we don't steal clicks
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });

    // Tunable params
    const particleCount = 25; // Less particles to not clutter the image
    const connectDistance = 120; // Shorter connection lines
    const baseSpeed = 0.08; // Even slower drift
    const opacity = 0.25; // Subtle overlay opacity

    let particles = [];
    let animationFrameId;

    // Virtual mouse for parallax relative to the window
    let parallax = { x: 0, y: 0 };
    let targetParallax = { x: 0, y: 0 };

    const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const width = container.clientWidth;
        const height = container.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    };

    class Particle {
        constructor() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * baseSpeed;
            this.vy = (Math.random() - 0.5) * baseSpeed;
            this.radius = Math.random() * 1.5 + 0.6;
            this.baseX = this.x;
            this.baseY = this.y;
        }

        update() {
            this.baseX += this.vx;
            this.baseY += this.vy;

            // Bounce off the container walls
            if (this.baseX < 0 || this.baseX > container.clientWidth) this.vx *= -1;
            if (this.baseY < 0 || this.baseY > container.clientHeight) this.vy *= -1;

            // Apply global parallax effect subtly
            this.x = this.baseX + parallax.x;
            this.y = this.baseY + parallax.y;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity + 0.2})`;
            ctx.fill();
        }
    }

    const init = () => {
        if (!container.clientWidth || !container.clientHeight) return; // Prevent sizing bug if display none
        resize();
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
        // Silky smooth interpolation for mouse parallax
        parallax.x += (targetParallax.x - parallax.x) * 0.02;
        parallax.y += (targetParallax.y - parallax.y) * 0.02;

        ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectDistance) {
                    ctx.beginPath();
                    const lineOpacity = (1 - (distance / connectDistance)) * opacity;
                    ctx.strokeStyle = `rgba(58, 122, 254, ${lineOpacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
        // Scale mouse tracking to the whole window for maximum effect
        targetParallax.x = (e.clientX - window.innerWidth / 2) * 0.04;
        targetParallax.y = (e.clientY - window.innerHeight / 2) * 0.04;
    };

    // Intersection Observer keeps CPU cycles low (Animation only runs when visible)
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // Re-init if container sized changed while hidden
            if (canvas.width === 0) init();
            if (!animationFrameId) animate();
        } else {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        }
    });

    // Make sure container is sized properly before init
    setTimeout(() => {
        init();
        animate();
    }, 100); // Small delay to guarantee CSS loads boundaries

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMouseMove);
    observer.observe(container);
});
