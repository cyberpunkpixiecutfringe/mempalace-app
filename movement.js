// movement.js
// ------------------------------------------------------------
// FPS MOVEMENT — WASD + QE + MOUSE LOOK (auto-disable on UI)
// ------------------------------------------------------------
const movement = {
  keys: {},
  pitch: 0,
  yaw: 0,
  sensitivity: 0.002,
  speed: 0.6,
  enabled: true,
  mouseDown: false,
  lastX: null,
  lastY: null,

  init(app) {
    this.app = app;

    // Disable OrbitControls
    app.controls.enabled = false;

    // ------------------------------------------------------------
    // MOUSE LOOK (hold left mouse button)
    // ------------------------------------------------------------
    app.renderer.domElement.addEventListener("mousedown", e => {
      if (!this.enabled) return;
      this.mouseDown = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      this.mouseDown = false;
      this.lastX = null;
      this.lastY = null;
    });

    window.addEventListener("mousemove", e => {
      if (!this.enabled || !this.mouseDown) return;

      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.yaw -= dx * this.sensitivity;
      this.pitch -= dy * this.sensitivity;

      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    });

    // ------------------------------------------------------------
    // KEYBOARD INPUT
    // ------------------------------------------------------------
    window.addEventListener("keydown", e => {
      if (!this.enabled) return;
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", e => {
      this.keys[e.code] = false;
    });

    // ------------------------------------------------------------
    // AUTO-DISABLE WHEN TYPING IN ANY UI INPUT
    // ------------------------------------------------------------
    const disableTargets = [
      document.getElementById("searchInput"),
      document.getElementById("field-wing"),
      document.getElementById("field-room"),
      document.getElementById("field-closet"),
      document.getElementById("field-drawer")
    ];

    disableTargets.forEach(el => {
      if (!el) return;

      el.addEventListener("focus", () => {
        this.disableMovement();
      });

      // Do NOT auto-enable on blur — only clicking scene should enable
      el.addEventListener("blur", () => {});
    });

    // ------------------------------------------------------------
    // CLICKING 3D SCENE RE-ENABLES MOVEMENT
    // ------------------------------------------------------------
    document.getElementById("scene-container").addEventListener("mousedown", () => {
      // Only enable if overlay is hidden
      if (UI && UI.overlay && UI.overlay.classList.contains("hidden")) {
        this.enableMovement();
      }
    });
  },

  // ------------------------------------------------------------
  // PUBLIC MOVEMENT CONTROL
  // ------------------------------------------------------------
  disableMovement() {
    this.enabled = false;
    this.mouseDown = false;
  },

  enableMovement() {
    this.enabled = true;
  },

  // ------------------------------------------------------------
  // UPDATE LOOP
  // ------------------------------------------------------------
  update(app, dt) {
    if (!this.enabled) return;

    const cam = app.camera;

    cam.rotation.order = "YXZ";
    cam.rotation.y = this.yaw;
    cam.rotation.x = this.pitch;

    const dir = new THREE.Vector3();

    if (this.keys["KeyW"]) dir.z -= 1;
    if (this.keys["KeyS"]) dir.z += 1;
    if (this.keys["KeyA"]) dir.x -= 1;
    if (this.keys["KeyD"]) dir.x += 1;
    if (this.keys["KeyQ"]) dir.y -= 1;
    if (this.keys["KeyE"]) dir.y += 1;

    if (dir.length() > 0) {
      dir.normalize();
      dir.applyEuler(cam.rotation);
      cam.position.addScaledVector(dir, this.speed);
    }
  }
};
