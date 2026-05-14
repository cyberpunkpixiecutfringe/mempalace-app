// mempalace.memory.js
// ------------------------------------------------------------
// FLOATING WING TITLES ONLY — PURE CANVAS TEXT SPRITES
// ------------------------------------------------------------
const MemPalaceMemory = {
  memory: [],
  group: null,
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector2(),
  focusedNode: null,

  init(app) {
    this.app = app;
    this.group = new THREE.Group();
    app.scene.add(this.group);

    this.loadPage(1);

    window.addEventListener("mousemove", e => this.onMouseMove(e));
    window.addEventListener("click", e => this.onClick(e));
  },

  // ------------------------------------------------------------
  // CLEAR MEMORY ITEMS
  // ------------------------------------------------------------
  clear() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.memory = [];
    this.focusedNode = null;
  },

  // ------------------------------------------------------------
  // LOAD PAGE (10 floating Wing titles)
  // ------------------------------------------------------------
  loadPage(page) {
    this.clear();

    const start = (page - 1) * 10;
    const end = start + 10;
    const pageData = this.app.palaceData.slice(start, end);

    pageData.forEach((content, index) => {
      const wing = this.createWingText(content, index);
      this.memory.push(wing);
      this.group.add(wing);
    });
  },

  // ------------------------------------------------------------
  // AUTO-FOCUS CAMERA ON A MEMORY NODE
  // ------------------------------------------------------------
  focusOn(content) {
    const node = this.memory.find(n => n.userData.content.id === content.id);
    if (!node) return;

    this.focusedNode = node;
    this.clearHoverGlow();

    node.traverse(obj => {
      if (obj.material && obj.material.color) {
        obj.material.color.set("#ffffff");
      }
    });

    movement.disableMovement();

    const cam = this.app.camera;

    const targetPos = new THREE.Vector3();
    node.getWorldPosition(targetPos);

    const finalPos = targetPos.clone().add(new THREE.Vector3(0, 0, 8));

    let t = 0;

    const animateFocus = () => {
      t += 0.04;

      cam.position.lerp(finalPos, 0.1);
      cam.lookAt(targetPos);

      if (t < 1) {
        requestAnimationFrame(animateFocus);
      } else {
        movement.enableMovement();
      }
    };

    animateFocus();
  },

  // ------------------------------------------------------------
  // RESET CAMERA BACK TO DEFAULT POSITION
  // ------------------------------------------------------------
  resetCamera() {
    this.focusedNode = null;
    this.clearHoverGlow();

    const cam = this.app.camera;

    const defaultPos = new THREE.Vector3(0, 40, 120);
    const defaultLook = new THREE.Vector3(0, 0, 0);

    let t = 0;

    const animateReset = () => {
      t += 0.04;

      cam.position.lerp(defaultPos, 0.1);
      cam.lookAt(defaultLook);

      if (t < 1) {
        requestAnimationFrame(animateReset);
      }
    };

    animateReset();
  },

  // ------------------------------------------------------------
  // CREATE TEXT SPRITE (WHITE ONLY)
  // ------------------------------------------------------------
  makeTextSprite(message, color = "#ffffff", fontSize = 48) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.font = `${fontSize}px Arial`;
    const textWidth = ctx.measureText(message).width;

    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#ffffff"; // FORCE WHITE
    ctx.textBaseline = "top";
    ctx.fillText(message, 10, 10);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / 40, canvas.height / 40, 1);

    return sprite;
  },

  // ------------------------------------------------------------
  // CREATE FLOATING WING TEXT
  // ------------------------------------------------------------
  createWingText(content, index) {
    const title = content.wingName || "Untitled";
    const group = new THREE.Group();

    const textSprite = this.makeTextSprite(title, "#ffffff");
    group.add(textSprite);

    const spacing = 25;
    const x = (index % 5) * spacing - 50;
    const y = (Math.floor(index / 5) * spacing) - 10;
    const z = -20 - Math.random() * 40;

    group.position.set(x, y, z);
    group.userData = { content };

    return group;
  },

  // ------------------------------------------------------------
  // HOVER GLOW (WHITE ONLY)
  // ------------------------------------------------------------
  hoverGlow(item) {
    item.traverse(obj => {
      if (obj.material && obj.material.color) {
        obj.material.color.set("#ffffff");
      }
    });
  },

  // ------------------------------------------------------------
  // CLEAR HOVER GLOW (NO CYAN ANYMORE)
  // ------------------------------------------------------------
  clearHoverGlow() {
    this.memory.forEach(item => {
      const keepWhite = (this.focusedNode && item === this.focusedNode);
      item.traverse(obj => {
        if (obj.material && obj.material.color) {
          obj.material.color.set("#ffffff"); // ALWAYS WHITE
        }
      });
    });
  },

  // ------------------------------------------------------------
  // CLICK INTERACTION
  // ------------------------------------------------------------
  onClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.app.camera);
    const hits = this.raycaster.intersectObjects(this.group.children, true);

    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj.parent && obj.parent !== this.group) obj = obj.parent;

      this.hoverGlow(obj);
      this.focusedNode = obj;

      if (UI && UI.open) UI.open(obj.userData.content);
    }
  },

  // ------------------------------------------------------------
  // MOUSE MOVE
  // ------------------------------------------------------------
  onMouseMove(e) {
    const rect = this.app.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  },

  // ------------------------------------------------------------
  // UPDATE LOOP
  // ------------------------------------------------------------
  update(app, dt) {
    this.clearHoverGlow();

    this.raycaster.setFromCamera(this.mouse, this.app.camera);
    const hits = this.raycaster.intersectObjects(this.group.children, true);

    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj.parent && obj.parent !== this.group) obj = obj.parent;
      this.hoverGlow(obj);
    }

    // Floating animation
    this.memory.forEach(m => {
      m.position.y += Math.sin(Date.now() * 0.001 + m.position.x) * 0.0004;
      m.position.x += Math.sin(Date.now() * 0.001 + m.position.y) * 0.0003;
    });
  }
};
