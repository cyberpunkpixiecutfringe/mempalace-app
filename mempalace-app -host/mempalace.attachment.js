// memPalace.attachment.js
// ------------------------------------------------------------
// ATTACHMENTS MODULE — IMAGES + TEXT + AUDIO + VIDEO + THUMBNAILS + CAROUSEL
// ------------------------------------------------------------
const MemPalaceAttachment = {
  viewer: null,
  viewerImg: null,
  viewerAudio: null,
  viewerVideo: null,
  btnLeft: null,
  btnRight: null,
  btnClose: null,

  currentFiles: [],
  currentIndex: 0,
  currentType: "image",

  init(app) {
    this.app = app;
    this.createViewerUI();
  },

  // ------------------------------------------------------------
  // FULLSCREEN VIEWER UI
  // ------------------------------------------------------------
  createViewerUI() {
    if (document.getElementById("attachment-viewer")) {
      this.viewer = document.getElementById("attachment-viewer");
      return;
    }

    const viewer = document.createElement("div");
    viewer.id = "attachment-viewer";
    viewer.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.88);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      pointer-events: auto;
    `;

    viewer.innerHTML = `
      <div id="attachment-left" style="
        position:absolute; left:20px; top:50%;
        transform:translateY(-50%);
        font-size:48px; color:#fff; cursor:pointer; z-index:20;">&#10094;</div>

      <div id="attachment-right" style="
        position:absolute; right:20px; top:50%;
        transform:translateY(-50%);
        font-size:48px; color:#fff; cursor:pointer; z-index:20;">&#10095;</div>

      <div id="attachment-close" style="
        position:absolute; top:20px; right:20px;
        font-size:40px; color:#fff; cursor:pointer; z-index:20;">✕</div>

      <img id="attachment-image" style="
        max-width:80vw; max-height:80vh;
        display:none; border:2px solid #00eaff;
        box-shadow:0 0 25px #00eaff; z-index:10;">

      <audio id="attachment-audio" controls style="
        display:none; width:60%; z-index:10;"></audio>

      <video id="attachment-video" controls style="
        display:none; max-width:80vw; max-height:80vh;
        border:2px solid #00eaff; box-shadow:0 0 25px #00eaff; z-index:10;"></video>
    `;

    document.body.appendChild(viewer);

    this.viewer = viewer;
    this.viewerImg = viewer.querySelector("#attachment-image");
    this.viewerAudio = viewer.querySelector("#attachment-audio");
    this.viewerVideo = viewer.querySelector("#attachment-video");

    this.btnLeft = viewer.querySelector("#attachment-left");
    this.btnRight = viewer.querySelector("#attachment-right");
    this.btnClose = viewer.querySelector("#attachment-close");

    // Prevent scene click from closing overlay
    viewer.addEventListener("click", e => {
      e.stopPropagation();
      if (e.target === viewer) {
        this.hideViewer();
        if (UI && UI.overlay) UI.overlay.classList.remove("hidden");
      }
    });

    [this.viewerImg, this.viewerAudio, this.viewerVideo, this.btnLeft, this.btnRight, this.btnClose]
      .forEach(el => el.addEventListener("click", e => e.stopPropagation()));

    this.btnLeft.addEventListener("click", () => this.showPrev());
    this.btnRight.addEventListener("click", () => this.showNext());
    this.btnClose.addEventListener("click", () => {
      this.hideViewer();
      if (UI && UI.overlay) UI.overlay.classList.remove("hidden");
    });
  },

  // ------------------------------------------------------------
  // RENDER THUMBNAILS
  // ------------------------------------------------------------
  renderThumbnails(container, files = [], onDeleteCallback = null) {
    container.innerHTML = "";

    if (!files || !files.length) return;

    files.forEach((file, index) => {
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `position: relative; display: inline-block; z-index: 1;`;

      const thumb = document.createElement("img");
      thumb.style.cssText = `
        width: 60px; height: 60px;
        object-fit: cover;
        border: 1px solid #00eaff;
        margin-right: 8px;
        cursor: pointer;
        box-shadow:0 0 10px rgba(0,234,255,0.4);
        pointer-events: auto;
        z-index: 1;
      `;

      // IMAGE THUMBNAIL
      if (file.type && file.type.startsWith("image/")) {
        thumb.src = file.data;
      } else {
        // GENERIC ICON
        const canvas = document.createElement("canvas");
        canvas.width = 60;
        canvas.height = 60;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#00eaff";
        ctx.fillRect(0, 0, 60, 60);

        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (file.type.startsWith("text/")) ctx.fillText("TXT", 30, 32);
        else if (file.type.startsWith("audio/")) ctx.fillText("AUD", 30, 32);
        else if (file.type.startsWith("video/")) ctx.fillText("VID", 30, 32);
        else ctx.fillText("FILE", 30, 32);

        thumb.src = canvas.toDataURL("image/png");
      }

      // CLICK → OPEN VIEWER
      thumb.addEventListener("click", () => {
        if (UI && UI.overlay) UI.overlay.classList.add("hidden");
        this.openViewer(files, index);
      });

      // DELETE BUTTON
      const del = document.createElement("div");
      del.innerHTML = "✕";
      del.style.cssText = `
        position:absolute; top:-6px; right:-6px;
        width:18px; height:18px;
        background:#ff0044; color:white;
        font-size:12px; border-radius:50%;
        display:flex; justify-content:center; align-items:center;
        cursor:pointer; box-shadow:0 0 6px #ff0044;
        pointer-events:auto; z-index:10;
      `;

      del.addEventListener("click", e => {
        e.stopPropagation();

        // ⭐ REMOVE TEXT FROM DRAWER IF TEXT FILE IS DELETED
        if (file.type.startsWith("text/")) {
          const drawer = document.getElementById("field-drawer");
          const text = atob(file.data.split(",")[1] || "");
          drawer.value = drawer.value.replace(text, "").trim();
        }

        if (onDeleteCallback) onDeleteCallback(index);
      });

      wrapper.appendChild(thumb);
      wrapper.appendChild(del);
      container.appendChild(wrapper);
    });
  },

  // ------------------------------------------------------------
  // VIEWER CONTROL
  // ------------------------------------------------------------
  openViewer(files, startIndex = 0) {
    this.currentFiles = files;
    this.currentIndex = startIndex;

    const file = files[startIndex];
    if (!file) return;

    if (file.type.startsWith("image/")) this.currentType = "image";
    else if (file.type.startsWith("audio/")) this.currentType = "audio";
    else if (file.type.startsWith("video/")) this.currentType = "video";
    else this.currentType = "file";

    this.updateViewer();
    this.viewer.style.display = "flex";
  },

  hideViewer() {
    this.viewer.style.display = "none";
    this.viewerAudio.pause();
    this.viewerVideo.pause();
  },

  showPrev() {
    const sameType = this.currentFiles
      .map((f, i) => ({ f, i }))
      .filter(x => x.f.type.startsWith(this.currentType));

    const pos = sameType.findIndex(x => x.i === this.currentIndex);
    if (pos <= 0) return;

    this.currentIndex = sameType[pos - 1].i;
    this.updateViewer();
  },

  showNext() {
    const sameType = this.currentFiles
      .map((f, i) => ({ f, i }))
      .filter(x => x.f.type.startsWith(this.currentType));

    const pos = sameType.findIndex(x => x.i === this.currentIndex);
    if (pos >= sameType.length - 1) return;

    this.currentIndex = sameType[pos + 1].i;
    this.updateViewer();
  },

  // ------------------------------------------------------------
  // UPDATE VIEWER CONTENT
  // ------------------------------------------------------------
  updateViewer() {
    const file = this.currentFiles[this.currentIndex];
    if (!file) return;

    this.viewerImg.style.display = "none";
    this.viewerAudio.style.display = "none";
    this.viewerVideo.style.display = "none";

    if (file.type.startsWith("image/")) {
      this.viewerImg.src = file.data;
      this.viewerImg.style.display = "block";
      return;
    }

    if (file.type.startsWith("audio/")) {
      const blob = this.dataURLToBlob(file.data);
      this.viewerAudio.src = URL.createObjectURL(blob);
      this.viewerAudio.style.display = "block";
      this.viewerAudio.play();
      return;
    }

    if (file.type.startsWith("video/")) {
      const blob = this.dataURLToBlob(file.data);
      this.viewerVideo.src = URL.createObjectURL(blob);
      this.viewerVideo.style.display = "block";
      this.viewerVideo.play();
      return;
    }
  },

  // ------------------------------------------------------------
  // DATA URL → BLOB
  // ------------------------------------------------------------
  dataURLToBlob(dataURL) {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8], { type: mime });
  }
};
