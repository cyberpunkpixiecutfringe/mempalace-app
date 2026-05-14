// ------------------------------------------------------------
// WORLD / GALAXY BACKGROUND CLUSTER
// ------------------------------------------------------------
const Cluster = {
  gridGroup: null,
  galaxyParticles: null,
  gridHelper: null,
  textSprites: [],

  // ------------------------------------------------------------
  // SKY ENGINE
  // ------------------------------------------------------------
  sky: {
    time: 0,
    cycleDuration: 120,
    starField: null,
    ambient: null,
    sunLight: null,
    sunPulse: 0,
    cloudGroup: null,

    // ------------------------------------------------------------
    // INIT SKY
    // ------------------------------------------------------------
    init(scene) {

      // Neutral ambient (no blue tint)
      this.ambient = new THREE.AmbientLight(0x222222, 0.4);
      scene.add(this.ambient);

      // Sun directional light
      this.sunLight = new THREE.DirectionalLight(0xfff4cc, 0.0);
      this.sunLight.position.set(80, 140, 60);
      scene.add(this.sunLight);

      // -------------------------------
      // ROUND STAR TEXTURE
      // -------------------------------
      const starCanvas = document.createElement("canvas");
      starCanvas.width = starCanvas.height = 64;
      const ctx = starCanvas.getContext("2d");
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const starTex = new THREE.CanvasTexture(starCanvas);

      // -------------------------------
      // STAR FIELD
      // -------------------------------
      const starGeo = new THREE.BufferGeometry();
      const positions = [];
      for (let i = 0; i < 800; i++) {
        positions.push(
          (Math.random() - 0.5) * 2600,
          (Math.random() - 0.5) * 2600,
          (Math.random() - 0.5) * 2600
        );
      }
      starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

      const starMat = new THREE.PointsMaterial({
        map: starTex,
        color: 0xffffff,
        size: 14,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        opacity: 0
      });

      this.starField = new THREE.Points(starGeo, starMat);
      scene.add(this.starField);

      // -------------------------------
      // SOFT NEBULA CLOUDS (NO CIRCLES)
      // -------------------------------
      this.cloudGroup = new THREE.Group();
      scene.add(this.cloudGroup);

      const cloudCanvas = document.createElement("canvas");
      cloudCanvas.width = cloudCanvas.height = 256;
      const cctx = cloudCanvas.getContext("2d");
      const cgrad = cctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      cgrad.addColorStop(0, "rgba(255,255,255,0.20)");
      cgrad.addColorStop(0.4, "rgba(255,255,255,0.07)");
      cgrad.addColorStop(1, "rgba(255,255,255,0)");
      cctx.fillStyle = cgrad;
      cctx.fillRect(0, 0, 256, 256);
      const cloudTex = new THREE.CanvasTexture(cloudCanvas);

      for (let i = 0; i < 12; i++) {
        const cloudMat = new THREE.SpriteMaterial({
          map: cloudTex,
          color: 0xffffff,
          transparent: true,
          opacity: 0.0,
          depthWrite: false
        });

        const cloud = new THREE.Sprite(cloudMat);
        const s = 600 + Math.random() * 400;

        cloud.scale.set(
          s * (0.6 + Math.random() * 0.4),
          s,
          1
        );

        cloud.position.set(
          (Math.random() - 0.5) * 1600,
          60 + Math.random() * 200,
          -400 - Math.random() * 800
        );

        cloud.userData.speed = 0.01 + Math.random() * 0.03;

        this.cloudGroup.add(cloud);
      }
    },

    // ------------------------------------------------------------
    // UPDATE SKY
    // ------------------------------------------------------------
    update(renderer, dt) {
      this.time += dt;
      const sec = this.time % this.cycleDuration;

      const color = new THREE.Color(0x000000);
      let intensity = 1.0;

      // NIGHT → DAWN
      if (sec < 30) {
        const p = sec / 30;
        color.copy(new THREE.Color("#000000")).lerp(new THREE.Color("#222222"), p);
        intensity = 0.1 + p * 0.4;
      }
      // DAY
      else if (sec < 60) {
        const p = (sec - 30) / 30;
        color.copy(new THREE.Color("#222222")).lerp(new THREE.Color("#ffffff"), p);
        intensity = 0.5 + p * 0.5;
      }
      // SUNSET
      else if (sec < 90) {
        const p = (sec - 60) / 30;
        color.copy(new THREE.Color("#ffffff")).lerp(new THREE.Color("#442266"), p);
        intensity = 1.0 - p * 0.5;
      }
      // DEEP NIGHT
      else {
        const p = (sec - 90) / 30;
        color.copy(new THREE.Color("#442266")).lerp(new THREE.Color("#000000"), p);
        intensity = 0.2;
      }

      this.ambient.color.copy(color);
      this.ambient.intensity = intensity;

      // STAR OPACITY
      let starOpacity = 0.0;
      if (sec < 30) starOpacity = 0.8 * (1.0 - sec / 30);
      else if (sec < 60) starOpacity = 0.1;
      else if (sec < 90) starOpacity = 0.1 + 0.4 * ((sec - 60) / 30);
      else starOpacity = 0.5 + 0.4 * ((sec - 90) / 30);
      this.starField.material.opacity = starOpacity;

      // SUN PULSE
      this.sunPulse = (Math.sin(this.time * 0.6) + 1) * 0.5;
      this.sunLight.intensity = 0.2 + this.sunPulse * 0.6;

      // SUN MOVEMENT
      const sunAngle = (sec / this.cycleDuration) * Math.PI * 2;
      this.sunLight.position.set(
        Math.cos(sunAngle) * 200,
        120 + Math.sin(sunAngle) * 80,
        80
      );

      // CLOUD MOTION
      this.cloudGroup.children.forEach((cloud, i) => {
        cloud.position.x += Math.sin(this.time * 0.02 + i) * cloud.userData.speed;
        cloud.position.z += Math.cos(this.time * 0.015 + i * 1.7) * cloud.userData.speed;

        let op = 0.0;
        if (sec < 30) op = 0.15 * (sec / 30);
        else if (sec < 60) op = 0.25;
        else if (sec < 90) op = 0.25 + 0.15 * ((sec - 60) / 30);
        else op = 0.3 * (1.0 - (sec - 90) / 30);

        cloud.material.opacity = op;
      });

      // PURE BLACK SPACE
      renderer.setClearColor(0x000000);
    }
  },

  // ------------------------------------------------------------
  // INIT CLUSTER
  // ------------------------------------------------------------
  init(app) {
    this.app = app;

    // GRID
    this.gridGroup = new THREE.Group();
    app.scene.add(this.gridGroup);

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x00ccff,
      opacity: 0.25,
      transparent: true
    });

    const gridHelper = new THREE.GridHelper(400, 40, 0x00ccff, 0x00ccff);
    gridHelper.material = gridMaterial;
    this.gridGroup.add(gridHelper);
    this.gridHelper = gridHelper;

    // GALAXY PARTICLES
    this.galaxyParticles = new THREE.Group();
    app.scene.add(this.galaxyParticles);

    for (let i = 0; i < 1500; i++) {
      const geo = new THREE.SphereGeometry(0.22, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0x00ccff });
      const p = new THREE.Mesh(geo, mat);

      p.position.set(
        (Math.random() - 0.5) * 800,
        Math.random() * 300,
        (Math.random() - 0.5) * 800
      );

      this.galaxyParticles.add(p);
    }

    // INIT SKY
    this.sky.init(app.scene);
  },

  // ------------------------------------------------------------
  // UPDATE LOOP
  // ------------------------------------------------------------
  update(app, dt) {

    // FLOATING PARTICLES
    this.galaxyParticles.children.forEach(p => {
      p.position.y -= 0.15;
      if (p.position.y < 0) p.position.y = 300;
    });

    // GRID MOTION
    this.gridHelper.rotation.z += 0.0005;
    this.gridHelper.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1;

    // SKY UPDATE
    this.sky.update(app.renderer, dt);

    // TEXT GLOW
    const glow = this.sky.sunPulse * 0.6 + this.sky.sunLight.intensity * 0.5;
    this.updateTextGlow(glow);
  },

  // ------------------------------------------------------------
  // TEXT GLOW
  // ------------------------------------------------------------
  updateTextGlow(strength) {
    const s = THREE.MathUtils.clamp(strength, 0, 1);

    this.textSprites.forEach(txt => {
      if (!txt.material) return;

      const cyan = new THREE.Color("#00ccff");
      const white = new THREE.Color("#ffffff");

      txt.material.color.copy(cyan.clone().lerp(white, s));
      txt.material.opacity = 0.7 + s * 0.5;
    });
  }
};