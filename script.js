document.addEventListener('DOMContentLoaded', () => {

    // -------------------
    // Theme Toggle Script
    // -------------------
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = '<i class="fas fa-sun"></i>';
    const moonIcon = '<i class="fas fa-moon"></i>';

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = moonIcon;
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = sunIcon;
        }
    };

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // Start in dark mode
    applyTheme('dark');


    // -------------------
    // 3D Scene: the cube opens and turns as the page scrolls
    // -------------------
    // style.css does the 3D; this only feeds it numbers.
    const scene = document.querySelector('.scene');
    const header = document.querySelector('header');
    const updateScene = () => {
        // fully open after scrolling ~90% of the first screen
        const open = Math.min(window.scrollY / (window.innerHeight * 0.9), 1);
        scene.style.setProperty('--open', open.toFixed(3));
        scene.style.setProperty('--spin', (window.scrollY * 0.08).toFixed(1) + 'deg');
        // reading-progress line under the header
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        header.style.setProperty('--progress', scrollable > 0 ? (window.scrollY / scrollable).toFixed(4) : 0);
    };
    window.addEventListener('scroll', updateScene, { passive: true });
    updateScene();


    // -------------------
    // Cursor-driven 3D (mouse devices only)
    // -------------------
    // Writes cursor positions (-0.5 to 0.5) into CSS variables; style.css turns them into rotations.
    if (window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
        // the hero cube turns toward the cursor; the hero text drifts the other way
        const heroContent = document.querySelector('.hero-content');
        window.addEventListener('mousemove', (e) => {
            const mx = (e.clientX / window.innerWidth - 0.5).toFixed(3);
            const my = (e.clientY / window.innerHeight - 0.5).toFixed(3);
            [scene, heroContent].forEach(el => {
                el.style.setProperty('--mx', mx);
                el.style.setProperty('--my', my);
            });
        }, { passive: true });

        // cards tilt toward the cursor
        document.querySelectorAll('.skill-item, .service-card, .project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--tx', (e.clientX - rect.left) / rect.width - 0.5);
                card.style.setProperty('--ty', 0.5 - (e.clientY - rect.top) / rect.height);
            });
            card.addEventListener('mouseleave', () => {
                card.style.removeProperty('--tx');
                card.style.removeProperty('--ty');
            });
        });
    }


    // -------------------
    // Mobile Menu
    // -------------------
    const menuToggle = document.getElementById('menuToggle');
    const setMenu = (open) => {
        header.classList.toggle('nav-open', open);
        menuToggle.setAttribute('aria-expanded', open);
        menuToggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
    };
    menuToggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
    // choosing a destination closes the menu
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => setMenu(false)));


    // -------------------
    // Gameplay Video Player
    // -------------------
    const video = document.getElementById('showcaseVideo');
    const controls = document.querySelector('.player-controls');
    const seek = controls.querySelector('.player-seek');
    const volume = controls.querySelector('.player-volume');
    const timeLabel = controls.querySelector('.player-time');
    const formatTime = (seconds) => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
    const setIcon = (action, name) => {
        controls.querySelector(`[data-action="${action}"] i`).className = 'fas fa-' + name;
    };

    const playerActions = {
        play: () => video.paused ? video.play() : video.pause(),
        stop: () => {
            video.pause();
            video.currentTime = 0;
        },
        mute: () => {
            video.muted = !video.muted;
            // unmuting with the slider at zero would still be silent
            if (!video.muted && video.volume === 0) video.volume = 1;
        },
        fullscreen: () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                // iPhone Safari only has the webkit-prefixed call
                (video.requestFullscreen || video.webkitEnterFullscreen).call(video);
            }
        }
    };
    controls.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) playerActions[button.dataset.action]();
    });
    video.addEventListener('click', playerActions.play);

    // the controls follow the video's own events, so they stay right however playback changes
    const syncTime = () => {
        const duration = video.duration || Number(seek.max);
        seek.max = duration;
        seek.value = video.currentTime;
        timeLabel.textContent = formatTime(video.currentTime) + ' / ' + formatTime(duration);
    };
    ['loadedmetadata', 'timeupdate', 'seeked'].forEach(type => video.addEventListener(type, syncTime));
    ['play', 'pause'].forEach(type => video.addEventListener(type, () => setIcon('play', video.paused ? 'play' : 'pause')));
    video.addEventListener('volumechange', () => {
        const silent = video.muted || video.volume === 0;
        setIcon('mute', silent ? 'volume-xmark' : 'volume-high');
        volume.value = silent ? 0 : video.volume;
    });

    seek.addEventListener('input', () => {
        video.currentTime = seek.value;
    });
    volume.addEventListener('input', () => {
        video.volume = volume.value;
        video.muted = Number(volume.value) === 0;
    });


    // -------------------
    // Smooth Scrolling & Active Nav Link on Scroll
    // -------------------
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links a, .hero-buttons a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const headerOffset = 80;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - headerOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });
        const activeNavLinks = document.querySelectorAll('.nav-links a');
        activeNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSectionId) {
                link.classList.add('active');
            }
        });
    }, { passive: true });


    // -------------------
    // Fade In Animation on Scroll
    // -------------------
    const faders = document.querySelectorAll('.fade-in');
    // threshold 0: the project grid is taller than the screen, so a fixed share of it may never be visible at once
    const appearOptions = {
        threshold: 0,
        rootMargin: "0px 0px -12% 0px"
    };
    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // index each child so grids can stagger their cards (see flip-in in style.css)
                [...entry.target.children].forEach((child, i) => child.style.setProperty('--i', i));
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

});