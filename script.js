
// Solar System 3D Simulation
class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.isPaused = false;
        this.isDarkMode = true;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.labelElement = document.getElementById('planet-label');
        this.planetNameElement = this.labelElement.querySelector('.planet-name');
        this.planetFactElement = this.labelElement.querySelector('.planet-fact');
        
        // Animation speeds for each planet
        this.planetSpeeds = {
            mercury: 1.0,
            venus: 1.0,
            earth: 1.0,
            mars: 1.0,
            jupiter: 1.0,
            saturn: 1.0,
            uranus: 1.0,
            neptune: 1.0
        };
        
        // Planet data with realistic relative sizes and distances
        this.planetData = {
            mercury: { size: 0.4, distance: 8, speed: 0.04, color: 0x8C7853 },
            venus: { size: 0.9, distance: 12, speed: 0.03, color: 0xFFC649 },
            earth: { size: 1.0, distance: 16, speed: 0.02, color: 0x6B93D6 },
            mars: { size: 0.5, distance: 20, speed: 0.018, color: 0xC1440E },
            jupiter: { size: 3.0, distance: 28, speed: 0.013, color: 0xD8CA9D },
            saturn: { size: 2.5, distance: 36, speed: 0.01, color: 0xFAD5A5 },
            uranus: { size: 1.8, distance: 44, speed: 0.007, color: 0x4FD0E7 },
            neptune: { size: 1.7, distance: 52, speed: 0.006, color: 0x4B70DD }
        };

        // Planet facts
        this.planetFacts = {
            Sun: "The Sun is a massive ball of hot plasma that contains 99.86% of the Solar System's mass.",
            Mercury: "Mercury is the smallest planet and closest to the Sun, with extreme temperature variations.",
            Venus: "Venus is the hottest planet in our solar system with surface temperatures of 900°F (475°C).",
            Earth: "Earth is the only known planet with life and has liquid water covering 71% of its surface.",
            Mars: "Mars is known as the Red Planet due to iron oxide (rust) on its surface.",
            Jupiter: "Jupiter is the largest planet and has over 80 moons, including the four largest discovered by Galileo.",
            Saturn: "Saturn is famous for its beautiful ring system made of ice and rock particles.",
            Uranus: "Uranus rotates on its side and has a unique blue-green color due to methane in its atmosphere.",
            Neptune: "Neptune is the windiest planet with storms reaching speeds of up to 1,200 mph (2,000 km/h)."
        };
        
        this.planets = {};
        this.sun = null;
        this.stars = null;
        this.controls = null;
        this.planetMeshes = []; // Array to store planet meshes for raycasting
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createStars();
        this.createSun();
        this.createPlanets();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 30, 60);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }
    
    createLights() {
        // Sun light (point light)
        const sunLight = new THREE.PointLight(0xFFFFAA, 2, 200);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
        
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
    }
    
    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        this.stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.stars);
    }
    
    createSun() {
        const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFDD00,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.5
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.userData = { name: 'Sun' };
        this.scene.add(this.sun);
        
        // Add sun glow effect
        const glowGeometry = new THREE.SphereGeometry(4, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFDD00,
            transparent: true,
            opacity: 0.3
        });
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(sunGlow);
    }
    
    createPlanets() {
        Object.keys(this.planetData).forEach(planetName => {
            const data = this.planetData[planetName];
            
            // Create planet
            const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
            const planetMaterial = new THREE.MeshPhongMaterial({
                color: data.color,
                shininess: 30
            });
            
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            planet.position.x = data.distance;
            planet.castShadow = true;
            planet.receiveShadow = true;
            planet.userData = { name: planetName.charAt(0).toUpperCase() + planetName.slice(1) };
            
            // Create orbit line
            const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = -Math.PI / 2;
            this.scene.add(orbit);
            
            // Store planet with its data
            this.planets[planetName] = {
                mesh: planet,
                data: data,
                angle: Math.random() * Math.PI * 2 // Random starting position
            };
            
            this.planetMeshes.push(planet); // Add to raycasting array
            this.scene.add(planet);
        });
    }
    
    setupControls() {
        // Mouse controls for camera
        let mouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let cameraAngleX = 0;
        let cameraAngleY = 0;
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => {
            mouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            mouseDown = false;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            // Update mouse position for raycasting
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            
            // Check for planet intersection
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects([this.sun, ...this.planetMeshes]);
            
            if (intersects.length > 0) {
                const planetName = intersects[0].object.userData.name;
                const fact = this.planetFacts[planetName];
                
                this.planetNameElement.textContent = planetName;
                this.planetFactElement.textContent = fact;
                this.labelElement.style.display = 'block';
                this.labelElement.style.left = e.clientX + 10 + 'px';
                this.labelElement.style.top = e.clientY - 10 + 'px';
            } else {
                this.labelElement.style.display = 'none';
            }
            
            if (!mouseDown) return;
            
            const deltaX = e.clientX - mouseX;
            const deltaY = e.clientY - mouseY;
            
            cameraAngleX += deltaX * 0.01;
            cameraAngleY += deltaY * 0.01;
            
            cameraAngleY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraAngleY));
            
            const radius = 60;
            this.camera.position.x = radius * Math.cos(cameraAngleY) * Math.sin(cameraAngleX);
            this.camera.position.y = radius * Math.sin(cameraAngleY);
            this.camera.position.z = radius * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);
            
            this.camera.lookAt(0, 0, 0);
            
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Hide label when mouse leaves canvas
        canvas.addEventListener('mouseleave', () => {
            this.labelElement.style.display = 'none';
        });
        
        // Zoom controls
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const direction = e.deltaY > 0 ? 1 : -1;
            
            this.camera.position.multiplyScalar(1 + direction * zoomSpeed);
        });
        
        // Touch controls for mobile
        let lastTouchDistance = 0;
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                mouseDown = true;
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        });
        
        canvas.addEventListener('touchend', () => {
            mouseDown = false;
            this.labelElement.style.display = 'none';
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && mouseDown) {
                const deltaX = e.touches[0].clientX - mouseX;
                const deltaY = e.touches[0].clientY - mouseY;
                
                cameraAngleX += deltaX * 0.01;
                cameraAngleY += deltaY * 0.01;
                
                cameraAngleY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraAngleY));
                
                const radius = 60;
                this.camera.position.x = radius * Math.cos(cameraAngleY) * Math.sin(cameraAngleX);
                this.camera.position.y = radius * Math.sin(cameraAngleY);
                this.camera.position.z = radius * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);
                
                this.camera.lookAt(0, 0, 0);
                
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (lastTouchDistance > 0) {
                    const scale = distance / lastTouchDistance;
                    this.camera.position.multiplyScalar(1 / scale);
                }
                lastTouchDistance = distance;
            }
        });
    }
    
    setupEventListeners() {
        // Pause/Resume button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            const btn = document.getElementById('pauseBtn');
            btn.textContent = this.isPaused ? 'Resume' : 'Pause';
        });
        
        // Theme toggle
        document.getElementById('themeBtn').addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            const btn = document.getElementById('themeBtn');
            btn.textContent = this.isDarkMode ? 'Light Mode' : 'Dark Mode';
            
            if (this.isDarkMode) {
                this.scene.background = new THREE.Color(0x000011);
                document.body.style.background = 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)';
            } else {
                this.scene.background = new THREE.Color(0x87CEEB);
                document.body.style.background = 'linear-gradient(135deg, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%)';
            }
        });
        
        // Speed sliders
        Object.keys(this.planetData).forEach(planetName => {
            const slider = document.getElementById(`${planetName}-speed`);
            const valueDisplay = document.getElementById(`${planetName}-value`);
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.planetSpeeds[planetName] = value;
                valueDisplay.textContent = `${value.toFixed(1)}x`;
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isPaused) {
            const elapsedTime = this.clock.getElapsedTime();
            
            // Rotate sun
            this.sun.rotation.y += 0.01;
            
            // Animate planets
            Object.keys(this.planets).forEach(planetName => {
                const planet = this.planets[planetName];
                const speed = planet.data.speed * this.planetSpeeds[planetName];
                
                // Update angle
                planet.angle += speed;
                
                // Calculate new position
                planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance;
                planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance;
                
                // Rotate planet on its axis
                planet.mesh.rotation.y += 0.02;
            });
            
            // Rotate stars slowly
            if (this.stars) {
                this.stars.rotation.y += 0.0005;
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when page loads
window.addEventListener('load', () => {
    new SolarSystem();
});
