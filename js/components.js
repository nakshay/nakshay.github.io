// Component loader utility
class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        try {
        
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
                
            } 
        } catch (error) {
            
            this.loadFallbackComponent(elementId);
        }
    }

    static loadFallbackComponent(elementId) {
        if (elementId === 'header-component') {
            const headerHTML = `
                <nav class="navbar">
                    <div class="nav-container">
                        <div class="nav-logo">
                            <a href="index.html">Akshay Naik</a>
                        </div>
                        <ul class="nav-menu">
                            <li><a href="index.html" class="nav-link">Home</a></li>
                            <li><a href="blog.html" class="nav-link">Blog</a></li>
                            <li><a href="projects.html" class="nav-link">Projects</a></li>
                            <li><a href="about.html" class="nav-link">About</a></li>
                        </ul>
                        <div class="hamburger">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </div>
                    </div>
                </nav>
            `;
            document.getElementById(elementId).innerHTML = headerHTML;
        } else if (elementId === 'footer-component') {
            const footerHTML = `
                <footer class="footer">
                    <div class="container">
                        <div class="footer-content">
                            <div class="social-links">
                                <a href="mailto:inbox.akshaynaik@gmail.com" class="social-link">
                                    <i class="fas fa-envelope"></i>
                                </a>
                                <a href="https://twitter.com/_akshaynaik" target="_blank" class="social-link">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="https://linkedin.com/in/akshayrajendranaik" target="_blank" class="social-link">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                                <a href="https://github.com/nakshay" target="_blank" class="social-link">
                                    <i class="fab fa-github"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            `;
            document.getElementById(elementId).innerHTML = footerHTML;
        }
    }

    static initializeNavigation() {
        // Mobile Navigation Toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }));

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }

        // Set active navigation link based on current page
        this.setActiveNavigationLink();
    }

    static setActiveNavigationLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === currentPage || 
                (currentPage === 'index.html' && href === 'index.html') ||
                (currentPage.includes('blog/') && href === 'blog.html') ||
                (currentPage === 'about.html' && href === 'about.html') ||
                (currentPage === 'projects.html' && href === 'projects.html')) {
                link.classList.add('active');
            }
        });
    }

    static async loadAllComponents() {
        
        
        // Try different paths
        const paths = [
            './components/',
            '../components/',
            '/components/'
        ];
        
        for (const basePath of paths) {
            try {
                
                await Promise.all([
                    this.loadComponent('header-component', basePath + 'header.html'),
                    this.loadComponent('footer-component', basePath + 'footer.html')
                ]);
                
                // If we get here, components loaded successfully
                this.initializeNavigation();
                return;
            } catch (error) {
                continue;
            }
        }
        
    
        this.loadFallbackComponent('header-component');
        this.loadFallbackComponent('footer-component');
        this.initializeNavigation();
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadAllComponents();
}); 