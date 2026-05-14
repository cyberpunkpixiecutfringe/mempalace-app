// app.js
// ------------------------------------------------------------
// MEMPALACE ENGINE CORE — STAR-GALAXY + FPS MOVEMENT
// ------------------------------------------------------------
const App = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,

  palaceData: [],
  modules: [],

  // ------------------------------------------------------------
  // REGISTER PLUGIN
  // ------------------------------------------------------------
  register(mod) {
    this.modules.push(mod);
  },

  // ------------------------------------------------------------
  // INIT ENGINE
  // ------------------------------------------------------------
  async init() {

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x001010, 50, 400);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 40, 120);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("scene-container").appendChild(this.renderer.domElement);

    // OrbitControls (disabled later by movement plugin)
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x404040));
    const dir = new THREE.DirectionalLight(0x00eaff, 1.2);
    dir.position.set(40, 80, 60);
    this.scene.add(dir);

    // Init plugins
    this.modules.forEach(m => m.init && m.init(this));

    // Resize event
    window.addEventListener("resize", () => this.onResize());

    // Start loop
    this.animate();
  },

  // ------------------------------------------------------------
  // RESIZE HANDLER
  // ------------------------------------------------------------
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  // ------------------------------------------------------------
  // MAIN LOOP
  // ------------------------------------------------------------
  animate() {
    requestAnimationFrame(() => this.animate());

    // Update plugins (movement, memory, cluster, attachments, etc.)
    this.modules.forEach(m => m.update && m.update(this, 0.016));

    // OrbitControls disabled by movement plugin
    // this.controls.update();  <-- DO NOT ENABLE

    // Render
    this.renderer.render(this.scene, this.camera);
  }
};

// ------------------------------------------------------------
// REGISTER PLUGINS (FINAL ORDER)
// ------------------------------------------------------------

// Galaxy background
App.register(Cluster);

// JSON loader (loads encrypted .mpmem + JSON)
App.register(MemPalaceLoad);

// Floating Wing Text Memory System
App.register(MemPalaceMemory);

// Attachments (thumbnails + carousel viewer)
App.register(MemPalaceAttachment);

// UI + Console
App.register(UI);
App.register(Console);

// Movement (WASD + QE + mouse look)
App.register(movement);

// ------------------------------------------------------------
// START ENGINE
// ------------------------------------------------------------
App.init();