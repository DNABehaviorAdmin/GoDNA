document.addEventListener('DOMContentLoaded', () => {

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 1. Reveal Animations on Scroll --- */
    const revealSections = document.querySelectorAll('.reveal-section');

    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        });

        revealSections.forEach(section => revealObserver.observe(section));
    } else {
        revealSections.forEach(section => section.classList.add('active'));
    }

    /* --- 2. Magnetic Buttons --- */
    if (!prefersReducedMotion) {
        const magneticBtns = document.querySelectorAll('.magnetic-btn');

        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Strength of pull
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    /* --- 3. Spotlight Cards --- */
    const spotlightCards = document.querySelectorAll('.spotlight-card');

    document.addEventListener('mousemove', (e) => {
        spotlightCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* --- 4. 3D Tilt for Portrait Card (REMOVED) --- */
    // User requested removal of childish hover effects. Keeping comment for context.

    /* --- 5. Scroll Parallax (Hero) --- */
    if (!prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const parallaxElements = document.querySelectorAll('[data-parallax-speed]');

            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax-speed'));
                el.style.transform = `translateY(${scrollY * speed}px)`;
            });
        });
    }

    /* --- 6. Navigation & Scroll Logic --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Blur background before scroll
                document.body.style.transition = 'backdrop-filter 0.3s';

                targetElement.scrollIntoView({ behavior: 'smooth' });

                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    /* --- 7. Sticky Nav Glass --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('bg-slate-900/80', 'backdrop-blur-md', 'border-white/5', 'shadow-lg');
            navbar.classList.remove('border-white/0');
        } else {
            navbar.classList.remove('bg-slate-900/80', 'backdrop-blur-md', 'border-white/5', 'shadow-lg');
            navbar.classList.add('border-white/0');
        }
    });

    /* --- 8. Dynamic Accent & Active Link --- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Theme colors for sections
    const themes = {
        teal: '#2dd4bf',
        purple: '#a78bfa',
        blue: '#60a5fa'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const theme = entry.target.getAttribute('data-section-theme') || 'teal';

                // Update Nav Active State
                navLinks.forEach(link => {
                    link.classList.remove('text-accent', 'text-white');
                    link.classList.add('text-slate-400');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('text-accent');
                        link.classList.remove('text-slate-400');
                    }
                });

                // Subtle Theme HUE shift (optional, modifying root var)
                // document.documentElement.style.setProperty('--accent-glow', themes[theme]);
            }
        });
    }, { rootMargin: '-30% 0px -50% 0px' });

    sections.forEach(section => sectionObserver.observe(section));


    /* --- 9. Particles Canvas (Layer 2) --- */
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 1.5 + 0.5;
                this.alpha = Math.random() * 0.3 + 0.1;
                this.baseAlpha = this.alpha;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;

                // Mouse Repulsion
                if (mouse.x != null && !prefersReducedMotion) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 250) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (250 - distance) / 250;
                        const push = 1.5;
                        this.x -= forceDirectionX * force * push;
                        this.y -= forceDirectionY * force * push;
                        // Brighten near mouse
                        this.alpha = this.baseAlpha + force * 0.5;
                    } else {
                        this.alpha = this.baseAlpha;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < 40; i++) particles.push(new Particle());

        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }
});
