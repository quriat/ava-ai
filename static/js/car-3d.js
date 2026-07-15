// static/js/car-3d.js
class CarShowcase {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.car = null;
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
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
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 120px;">
        🚗
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
    this.container.addEventListener('mousemove', (e) => {
      if (!this.car) return;
      
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      this.car.rotation.y = x * 0.3;
      this.car.rotation.x = y * 0.1;
    });
    
    // Reset on mouse leave
    this.container.addEventListener('mouseleave', () => {
      if (this.car) {
        this.car.rotation.y = 0;
        this.car.rotation.x = 0;
      }
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Subtle idle rotation
    if (this.car) {
      this.car.rotation.y += 0.002;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('car-3d-container');
  if (container) {
    new CarShowcase(container);
  }
});
