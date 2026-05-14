// mempalace.load.js
// ------------------------------------------------------------
// AUTO-DETECT ALL FILES IN /MemPalace-Data/
// Supports:
//  - .json (plain + encrypted)
//  - .mpmem (legacy AES encrypted memory files)
// Accepts both array JSON and single-object JSON
// ------------------------------------------------------------
const MemPalaceLoad = {
  palaceData: [],
  encryptionKey: "MemPalace-Galaxy-Secret-Key",

  init(app) {
    this.app = app;

    this.loadAll().then(() => {
      app.palaceData = this.palaceData;

      if (MemPalaceMemory && MemPalaceMemory.init) {
        MemPalaceMemory.init(app);
      }
    });
  },

  // ------------------------------------------------------------
  // LOAD ALL FILES FROM DIRECTORY
  // ------------------------------------------------------------
  async loadAll() {
    try {
      const res = await fetch("MemPalace-Data/");
      const html = await res.text();

      // Detect .json and .mpmem
      const files = [...html.matchAll(/href="([^"]+\.(json|mpmem))"/g)]
        .map(m => m[1]);

      console.log("Detected memory files:", files);

      for (const file of files) {
        const fullPath = "MemPalace-Data/" + file;

        if (file.endsWith(".json")) {
          await this.loadHybridJSON(fullPath);
        } else if (file.endsWith(".mpmem")) {
          await this.loadEncrypted(fullPath);
        }
      }

    } catch (err) {
      console.error("Directory listing failed:", err);
    }
  },

  // ------------------------------------------------------------
  // LOAD HYBRID JSON FILE
  // (plain fields + encrypted backup)
  // ------------------------------------------------------------
  async loadHybridJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return;

      const data = await res.json();

      // If it's an array, flatten it
      if (Array.isArray(data)) {
        data.forEach(item => this.processHybridObject(item));
      } else {
        this.processHybridObject(data);
      }

    } catch (err) {
      console.warn("Failed to load hybrid JSON:", path, err);
    }
  },

  // ------------------------------------------------------------
  // PROCESS HYBRID JSON OBJECT
  // ------------------------------------------------------------
  processHybridObject(obj) {
    // Ensure attachments exist
    if (!obj.files) obj.files = [];

    // If encrypted field exists, verify it decrypts
    if (obj.encrypted) {
      try {
        const decrypted = CryptoJS.AES.decrypt(
          obj.encrypted,
          this.encryptionKey
        ).toString(CryptoJS.enc.Utf8);

        if (decrypted) {
          const parsed = JSON.parse(decrypted);

          // Merge decrypted fields (if needed)
          obj._decrypted = parsed;
        } else {
          console.warn("Encrypted block exists but failed to decrypt.");
        }

      } catch (err) {
        console.warn("Error decrypting hybrid JSON:", err);
      }
    }

    this.palaceData.push(obj);
  },

  // ------------------------------------------------------------
  // LOAD LEGACY .mpmem FILE (encrypted only)
  // ------------------------------------------------------------
  async loadEncrypted(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return;

      const encryptedText = await res.text();

      const decrypted = CryptoJS.AES.decrypt(
        encryptedText,
        this.encryptionKey
      ).toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        console.warn("Failed to decrypt:", path);
        return;
      }

      const data = JSON.parse(decrypted);

      if (!data.files) data.files = [];

      this.palaceData.push(data);

    } catch (err) {
      console.warn("Failed to load encrypted file:", path, err);
    }
  }
};
