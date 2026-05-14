// mempalace.load.js
// ------------------------------------------------------------
// LOAD MEMORY FILES FROM MANIFEST (GitHub Pages compatible)
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
  // LOAD ALL FILES FROM mempalace.memory.json
  // ------------------------------------------------------------
  async loadAll() {
    try {
      const res = await fetch("MemPalace-Data/mempalace.memory.json");
      if (!res.ok) {
        console.warn("Manifest not found:", res.status);
        return;
      }

      const files = await res.json();
      console.log("Manifest files:", files);

      for (const file of files) {
        const fullPath = "MemPalace-Data/" + file;

        if (file.endsWith(".json")) {
          await this.loadHybridJSON(fullPath);
        }
      }

    } catch (err) {
      console.error("Failed to load manifest:", err);
    }
  },

  // ------------------------------------------------------------
  // LOAD HYBRID JSON FILE
  // ------------------------------------------------------------
  async loadHybridJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return;

      const data = await res.json();

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
    if (!obj.files) obj.files = [];

    if (obj.encrypted) {
      try {
        const decrypted = CryptoJS.AES.decrypt(
          obj.encrypted,
          this.encryptionKey
        ).toString(CryptoJS.enc.Utf8);

        if (decrypted) {
          obj._decrypted = JSON.parse(decrypted);
        } else {
          console.warn("Encrypted block exists but failed to decrypt.");
        }

      } catch (err) {
        console.warn("Error decrypting hybrid JSON:", err);
      }
    }

    this.palaceData.push(obj);
  }
};