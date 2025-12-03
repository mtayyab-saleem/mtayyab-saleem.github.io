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

    // Always start with light mode - changed from 'dark' to 'light'
    applyTheme('light');


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
    // Portfolio Filtering Script
    // -------------------
    const filterContainer = document.querySelector("#portfolio-filters");
    const portfolioItems = document.querySelectorAll("#portfolio-grid .portfolio-card-link");

    if (filterContainer) {
        filterContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("filter-btn")) {
                // Remove active class from old button
                filterContainer.querySelector(".active").classList.remove("active");
                // Add active class to new button
                event.target.classList.add("active");

                const filterValue = event.target.getAttribute("data-filter");

                portfolioItems.forEach(item => {
                    const itemCategory = item.getAttribute("data-category");
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.classList.remove('hide');
                    } else {
                        item.classList.add('hide');
                    }
                });
            }
        });
    }


    // -------------------
    // Fade In Animation on Scroll
    // -------------------
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px"
    };
    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

});