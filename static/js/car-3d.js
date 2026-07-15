// static/js/car-3d.js
class CarShowcase {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.car = null;
    this.isInitialized = false;
    this._animationId = null;
    this._resizeObserver = null;
    this._boundMouseMove = null;
    this._boundMouseLeave = null;

    this.init();
  }
  
  init() {
    // Check for Three.js availability (CDN may fail to load)
    if (typeof THREE === 'undefined') {
      this.showFallback();
      return;
    }

    // Check for WebGL support
    if (!this.isWebGLSupported()) {
      this.showFallback();
      return;
    }

    this.setupScene();
    this.createCar();
    this.setupLights();
    this.setupControls();
    this.animate();
    this.isInitialized = true;
  }
  
  isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  showFallback() {
    this.container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:20px">
        <svg viewBox="0 0 120 50" width="200" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 35h80" stroke="#C8A861" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>
          <path d="M25 32c0-1.5 1-3 3-3h12l8-10h22l10 10h12c2 0 3 1.5 3 3v5c0 1-1 2-2 2h-1.5c-.5 2-2.5 3.5-5 3.5s-4.5-1.5-5-3.5H41.5c-.5 2-2.5 3.5-5 3.5s-4.5-1.5-5-3.5H30c-1 0-2-1-2-2v-5z" fill="#C8A861" opacity=".15"/>
          <path d="M30 32h60v5H30z" fill="#C8A861" opacity=".08"/>
          <circle cx="38" cy="36" r="4" stroke="#C8A861" stroke-width="1.5" fill="none" opacity=".5"/>
          <circle cx="38" cy="36" r="1.5" fill="#C8A861" opacity=".3"/>
          <circle cx="82" cy="36" r="4" stroke="#C8A861" stroke-width="1.5" fill="none" opacity=".5"/>
          <circle cx="82" cy="36" r="1.5" fill="#C8A861" opacity=".3"/>
        </svg>
      </div>
    `;
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  createCar() {
    this.car = new THREE.Group();
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    this.car.add(body);
    
    // Car top
    const topGeometry = new THREE.BoxGeometry(2.5, 0.8, 1.8);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(-0.3, 1.2, 0);
    top.castShadow = true;
    this.car.add(top);
    
    // Windows
    const windowGeometry = new THREE.BoxGeometry(2.2, 0.6, 1.6);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const windows = new THREE.Mesh(windowGeometry, windowMaterial);
    windows.position.set(-0.3, 1.2, 0);
    this.car.add(windows);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.3,
      roughness: 0.8
    });
    
    const wheelPositions = [
      [-1.4, 0.4, 1.1],
      [-1.4, 0.4, -1.1],
      [1.4, 0.4, 1.1],
      [1.4, 0.4, -1.1]
    ];
    
    wheelPositions.forEach(position => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(...position);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      this.car.add(wheel);
    });
    
    // Gold accent line
    const accentGeometry = new THREE.BoxGeometry(4.1, 0.05, 0.1);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xC8A861,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xC8A861,
      emissiveIntensity: 0.1
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(0, 0.5, 1.05);
    this.car.add(accent);
    
    this.scene.add(this.car);
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);
    
    // Gold accent light
    const goldLight = new THREE.PointLight(0xC8A861, 0.6, 20);
    goldLight.position.set(-3, 3, 3);
    this.scene.add(goldLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xC8A861, 0.3);
    rimLight.position.set(-5, 5, -5);
    this.scene.add(rimLight);
  }
  
  setupControls() {
    // Mouse rotation
    this._boundMouseMove = (e) => {
      if (!this.car) return;

      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      this.car.rotation.y = x * 0.3;
      this.car.rotation.x = y * 0.1;
    };
    this.container.addEventListener('mousemove', this._boundMouseMove);

    // Reset on mouse leave
    this._boundMouseLeave = () => {
      if (this.car) {
        this.car.rotation.y = 0;
        this.car.rotation.x = 0;
      }
    };
    this.container.addEventListener('mouseleave', this._boundMouseLeave);

    // Handle resize via ResizeObserver to catch container size changes
    this._resizeObserver = new ResizeObserver(() => {
      if (!this.camera || !this.renderer) return;

      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
    this._resizeObserver.observe(this.container);
  }
  
  animate() {
    this._animationId = requestAnimationFrame(() => this.animate());

    // Subtle idle rotation
    if (this.car) {
      this.car.rotation.y += 0.002;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    // Stop animation loop
    if (this._animationId !== null) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }

    // Remove event listeners
    if (this._boundMouseMove) {
      this.container.removeEventListener('mousemove', this._boundMouseMove);
      this._boundMouseMove = null;
    }
    if (this._boundMouseLeave) {
      this.container.removeEventListener('mouseleave', this._boundMouseLeave);
      this._boundMouseLeave = null;
    }

    // Disconnect ResizeObserver
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    // Dispose scene objects (geometries, materials, textures)
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => {
            // Dispose textures
            Object.values(material).forEach((value) => {
              if (value && typeof value === 'object' && typeof value.dispose === 'function') {
                value.dispose();
              }
            });
            material.dispose();
          });
        }
      });
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.car = null;
    this.isInitialized = false;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('car-3d-container');
  if (container) {
    new CarShowcase(container);
  }
});
