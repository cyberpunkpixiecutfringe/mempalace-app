// cluster.page.js
// ------------------------------------------------------------
// PAGE NAVIGATION FOR MEMORY ITEMS ( < 1 2 3 > )
// ------------------------------------------------------------
const PageNav = {
  currentPage: 1,
  totalPages: 1,
  container: null,

  init(app) {
    this.app = app;

    // Calculate total pages (10 items per page)
    this.totalPages = Math.ceil(app.palaceData.length / 10);
    if (this.totalPages < 1) this.totalPages = 1;

    // DOM container
    this.container = document.getElementById("page-nav");

    // Render navigation UI
    this.render();

    // Load first page
    MemPalaceMemory.loadPage(this.currentPage);
  },

  // ------------------------------------------------------------
  // RENDER PAGE BUTTONS
  // ------------------------------------------------------------
  render() {
    if (!this.container) return;

    this.container.innerHTML = "";

    // Previous button
    const prev = document.createElement("span");
    prev.textContent = "<";
    prev.className = "page-btn";
    prev.onclick = () => this.goTo(this.currentPage - 1);
    this.container.appendChild(prev);

    // Page numbers
    for (let i = 1; i <= this.totalPages; i++) {
      const btn = document.createElement("span");
      btn.textContent = i;
      btn.className = "page-num" + (i === this.currentPage ? " active" : "");
      btn.onclick = () => this.goTo(i);
      this.container.appendChild(btn);
    }

    // Next button
    const next = document.createElement("span");
    next.textContent = ">";
    next.className = "page-btn";
    next.onclick = () => this.goTo(this.currentPage + 1);
    this.container.appendChild(next);
  },

  // ------------------------------------------------------------
  // CHANGE PAGE
  // ------------------------------------------------------------
  goTo(page) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    // Load memory items for this page
    MemPalaceMemory.loadPage(page);

    // Re-render navigation UI
    this.render();
  },

  update(app, dt) {
    // No animation needed for page nav
  }
};
