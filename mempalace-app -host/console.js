// ------------------------------------------------------------
// ADVANCED FUZZY SEARCH + AUTO-FOCUS + MOVEMENT LOCK
// ------------------------------------------------------------
const Console = {
  app: null,
  input: null,

  init(app) {
    this.app = app;
    this.input = document.getElementById("searchInput");

    // ------------------------------------------------------------
    // DISABLE MOVEMENT WHEN SEARCH BAR IS ACTIVE
    // ------------------------------------------------------------
    this.input.addEventListener("focus", () => {
      movement.disableMovement();

      // Reset camera when clicking search bar
      if (MemPalaceMemory.resetCamera) {
        MemPalaceMemory.resetCamera();
      }
    });

    // Keep movement disabled while typing
    this.input.addEventListener("keydown", () => {
      movement.disableMovement();
    });

    // Also disable movement on input (typing)
    this.input.addEventListener("input", () => {
      movement.disableMovement();
    });

    // ------------------------------------------------------------
    // RE-ENABLE MOVEMENT WHEN CLICKING BACK INTO 3D SCENE
    // ------------------------------------------------------------
    document.getElementById("scene-container").addEventListener("mousedown", () => {
      movement.enableMovement();
    });

    // ------------------------------------------------------------
    // LIVE FUZZY SEARCH
    // ------------------------------------------------------------
    this.input.addEventListener("input", () => {
      const q = this.input.value.toLowerCase().trim();

      // Clear hover glow
      MemPalaceMemory.clearHoverGlow();

      // EMPTY SEARCH → RESET CAMERA
      if (!q) {
        if (MemPalaceMemory.resetCamera) {
          MemPalaceMemory.resetCamera();
        }
        return;
      }

      // Split query into words
      const words = q.split(/\s+/);

      let foundContent = null;

      // SEARCH LIVE FLOATING MEMORY NODES
      for (const node of MemPalaceMemory.memory) {
        const c = node.userData.content;

        const combined = [
          c.wingName || "",
          c.roomDate || "",
          c.closetTopic || "",
          c.drawerContent || ""
        ]
        .join(" ")
        .toLowerCase();

        const allMatch = words.every(w => combined.includes(w));

        if (allMatch) {
          foundContent = c;
          break;
        }
      }

      // Auto-focus on first match
      if (foundContent) {
        MemPalaceMemory.focusOn(foundContent);
      }
    });
  },

  update() {}
};