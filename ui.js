// ui.js
// ------------------------------------------------------------
// OVERLAY UI FOR CREATING / EDITING MEMORY ITEMS + ATTACHMENTS
// ------------------------------------------------------------
const UI = {
  overlay: null,
  fieldWing: null,
  fieldRoom: null,
  fieldCloset: null,
  fieldDrawer: null,
  fieldFiles: null,
  attachmentsStrip: null,
  saveOverlay: null,
  closeOverlay: null,

  activeFiles: [],
  encryptionKey: "MemPalace-Galaxy-Secret-Key",

  init(app) {
    this.app = app;

    // DOM elements
    this.overlay          = document.getElementById("overlay");
    this.fieldWing        = document.getElementById("field-wing");
    this.fieldRoom        = document.getElementById("field-room");
    this.fieldCloset      = document.getElementById("field-closet");
    this.fieldDrawer      = document.getElementById("field-drawer");
    this.fieldFiles       = document.getElementById("field-files");
    this.attachmentsStrip = document.getElementById("attachments-strip");
    this.saveOverlay      = document.getElementById("save-overlay");
    this.closeOverlay     = document.getElementById("close-overlay");

    // OPEN CREATOR
    document.getElementById("open-creator").addEventListener("click", () => {
      this.clearFields();
      this.activeFiles = [];
      this.renderThumbnails();
      this.overlay.classList.remove("hidden");
    });

    // FILE INPUT
    this.fieldFiles.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files);
      await this.processSelectedFiles(files);
      this.renderThumbnails();
    });

    // CLOSE OVERLAY
    this.closeOverlay.addEventListener("click", () => {
      this.overlay.classList.add("hidden");
    });

    // SAVE MEMORY
    this.saveOverlay.addEventListener("click", () => {
      this.saveEncryptedMemory();
      this.overlay.classList.add("hidden");
    });
  },

  // ------------------------------------------------------------
  // PROCESS SELECTED FILES
  // ------------------------------------------------------------
  async processSelectedFiles(files) {
    for (const file of files) {
      const base64 = await this.fileToBase64(file);

      const entry = {
        name: file.name,
        type: file.type,
        data: base64
      };

      this.activeFiles.push(entry);

      // Auto-load text into drawer
      if (file.type.startsWith("text")) {
        const text = await file.text();
        if (this.fieldDrawer.value.trim().length > 0) {
          this.fieldDrawer.value += "\n\n" + text;
        } else {
          this.fieldDrawer.value = text;
        }
      }
    }
  },

  // ------------------------------------------------------------
  // FILE → BASE64 (FULL DATA URL)
  // ------------------------------------------------------------
  fileToBase64(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  // ------------------------------------------------------------
  // RENDER THUMBNAILS
  // ------------------------------------------------------------
  renderThumbnails() {
    MemPalaceAttachment.renderThumbnails(
      this.attachmentsStrip,
      this.activeFiles,
      (indexToDelete) => {
        this.activeFiles.splice(indexToDelete, 1);
        this.renderThumbnails();
      }
    );
  },

  // ------------------------------------------------------------
  // OPEN OVERLAY WITH EXISTING MEMORY
  // ------------------------------------------------------------
  open(content) {
    this.fieldWing.value    = content.wingName      || "";
    this.fieldRoom.value    = content.roomDate      || "";
    this.fieldCloset.value  = content.closetTopic   || "";
    this.fieldDrawer.value  = content.drawerContent || "";

    this.activeFiles = content.files ? [...content.files] : [];
    this.renderThumbnails();

    this.overlay.classList.remove("hidden");
  },

  // ------------------------------------------------------------
  // CLEAR INPUT FIELDS
  // ------------------------------------------------------------
  clearFields() {
    this.fieldWing.value   = "";
    this.fieldRoom.value   = "";
    this.fieldCloset.value = "";
    this.fieldDrawer.value = "";
    this.fieldFiles.value  = "";
  },

  // ------------------------------------------------------------
  // SAVE MEMORY (HYBRID JSON)
  // ------------------------------------------------------------
  saveEncryptedMemory() {
    try {
      if (!CryptoJS) throw new Error("CryptoJS missing");

      const content = {
        id: Date.now(),
        wingName: this.fieldWing.value.trim(),
        roomDate: this.fieldRoom.value.trim(),
        closetTopic: this.fieldCloset.value.trim(),
        drawerContent: this.fieldDrawer.value.trim(),
        files: this.activeFiles
      };

      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(content),
        this.encryptionKey
      ).toString();

      const hybrid = {
        ...content,
        encrypted
      };

      const blob = new Blob([JSON.stringify(hybrid, null, 2)], {
        type: "application/json"
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memory-${content.id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("SAVE FAILED", err);
      alert("SAVE FAILED\n" + err.message);
    }
  }
};