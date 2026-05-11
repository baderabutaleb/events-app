(() => {
  const STORAGE_KEY = "event-tracker-v1";

  const state = {
    events: [],
    view: "upcoming",
    editingId: null,
  };

  const els = {
    sidebar: document.getElementById("sidebar"),
    sidebarBackdrop: document.getElementById("sidebar-backdrop"),
    sidebarToggle: document.getElementById("sidebar-toggle"),
    navItems: document.querySelectorAll(".nav-item"),
    viewTitle: document.getElementById("view-title"),
    list: document.getElementById("event-list"),
    empty: document.getElementById("empty-state"),
    addBtn: document.getElementById("add-btn"),
    modal: document.getElementById("modal-backdrop"),
    modalTitle: document.getElementById("modal-title"),
    modalClose: document.getElementById("modal-close"),
    modalCancel: document.getElementById("modal-cancel"),
    modalSubmit: document.getElementById("modal-submit"),
    modalDelete: document.getElementById("modal-delete"),
    form: document.getElementById("event-form"),
    category: document.getElementById("field-category"),
    customWrap: document.getElementById("field-custom-wrap"),
    custom: document.getElementById("field-custom"),
    datetime: document.getElementById("field-datetime"),
    description: document.getElementById("field-description"),
    notes: document.getElementById("field-notes"),
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.events)) state.events = parsed.events;
      }
    } catch {}
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: state.events }));
    } catch (e) {
      console.error("Failed to save:", e);
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function categoryClass(cat) {
    return ({ Uni: "uni", Health: "health", Life: "life", Other: "other" })[cat] || "other";
  }

  function dueState(iso) {
    const now = Date.now();
    const then = new Date(iso).getTime();
    if (isNaN(then)) return "";
    const diff = then - now;
    if (diff < 0) return "overdue";
    if (diff < 24 * 60 * 60 * 1000) return "due-soon";
    return "";
  }

  function render() {
    els.viewTitle.textContent = state.view === "upcoming" ? "Upcoming" : "Past Events";
    els.navItems.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === state.view);
    });

    const filtered = state.events.filter((e) =>
      state.view === "upcoming" ? !e.completed : e.completed
    );

    filtered.sort((a, b) => {
      if (state.view === "upcoming") {
        return new Date(a.datetime) - new Date(b.datetime);
      }
      return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    });

    els.list.innerHTML = "";
    if (filtered.length === 0) {
      els.empty.classList.remove("hidden");
      els.empty.querySelector("p").textContent =
        state.view === "upcoming" ? "No upcoming events." : "No past events.";
      els.empty.querySelector("span").textContent =
        state.view === "upcoming" ? "Tap + to create one." : "Completed events will appear here.";
      return;
    }
    els.empty.classList.add("hidden");

    for (const ev of filtered) {
      els.list.appendChild(renderEvent(ev));
    }
  }

  function renderEvent(ev) {
    const node = document.createElement("article");
    const due = state.view === "upcoming" ? dueState(ev.datetime) : "";
    node.className = "event" + (ev.completed ? " completed" : "") + (due ? " " + due : "");
    node.dataset.id = ev.id;

    const catClass = categoryClass(ev.category);
    const catLabel = ev.category === "Other" && ev.customType ? ev.customType : ev.category;
    const statusLabel = due === "overdue" ? "Overdue" : due === "due-soon" ? "Soon" : "";

    node.innerHTML = `
      <div class="event-stripe" style="background: var(--c-${catClass});"></div>
      <div class="event-body">
        <div class="event-row">
          <h3 class="event-title"></h3>
          <span class="tag ${catClass}"></span>
        </div>
        <div class="event-meta">
          <span class="event-datetime"></span>${statusLabel ? `<span class="event-status">${statusLabel}</span>` : ""}
        </div>
        ${ev.notes ? `<p class="event-notes"></p>` : ""}
      </div>
      <div class="event-actions">
        <button class="event-ics-btn" aria-label="Add to Calendar" title="Add to Calendar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>
        </button>
        <button class="checkbox ${ev.completed ? "checked" : ""}" aria-label="${ev.completed ? "Mark as upcoming" : "Mark as done"}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
        </button>
      </div>
    `;

    node.querySelector(".event-title").textContent = ev.description;
    node.querySelector(".tag").textContent = catLabel;
    node.querySelector(".event-datetime").textContent = formatDateTime(ev.datetime);
    if (ev.notes) node.querySelector(".event-notes").textContent = ev.notes;

    node.querySelector(".checkbox").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleComplete(ev.id, node);
    });
    node.querySelector(".event-ics-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      downloadICS(ev);
    });
    node.addEventListener("click", () => openEditModal(ev.id));

    return node;
  }

  function toggleComplete(id, node) {
    const ev = state.events.find((e) => e.id === id);
    if (!ev) return;

    node.classList.add("removing");
    setTimeout(() => {
      ev.completed = !ev.completed;
      ev.completedAt = ev.completed ? new Date().toISOString() : null;
      save();
      render();
    }, 220);
  }

  function openCreateModal() {
    state.editingId = null;
    els.modalTitle.textContent = "Create Event";
    els.modalSubmit.textContent = "Create";
    els.modalDelete.classList.add("hidden");
    els.form.reset();
    els.customWrap.classList.add("hidden");
    els.modal.classList.remove("hidden");
    setTimeout(() => els.category.focus(), 50);
  }

  function openEditModal(id) {
    const ev = state.events.find((e) => e.id === id);
    if (!ev) return;
    state.editingId = id;
    els.modalTitle.textContent = "Edit Event";
    els.modalSubmit.textContent = "Save";
    els.modalDelete.classList.remove("hidden");
    els.form.reset();

    els.category.value = ev.category;
    const isOther = ev.category === "Other";
    els.customWrap.classList.toggle("hidden", !isOther);
    if (isOther && ev.customType) els.custom.value = ev.customType;
    els.datetime.value = ev.datetime;
    els.description.value = ev.description;
    els.notes.value = ev.notes || "";

    els.modal.classList.remove("hidden");
  }

  function closeModal() {
    els.modal.classList.add("hidden");
    state.editingId = null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const category = els.category.value;
    const datetime = els.datetime.value;
    const description = els.description.value.trim();
    if (!category || !datetime || !description) return;

    const customType = category === "Other" ? els.custom.value.trim() || null : null;
    const notes = els.notes.value.trim();

    if (state.editingId) {
      const ev = state.events.find((e) => e.id === state.editingId);
      if (ev) {
        ev.category = category;
        ev.customType = customType;
        ev.datetime = datetime;
        ev.description = description;
        ev.notes = notes;
      }
    } else {
      state.events.push({
        id: uid(),
        category,
        customType,
        datetime,
        description,
        notes,
        completed: false,
        completedAt: null,
      });
    }
    save();
    closeModal();
    render();
  }

  function handleDelete() {
    if (!state.editingId) return;
    if (!confirm("Delete this event? This cannot be undone.")) return;
    state.events = state.events.filter((e) => e.id !== state.editingId);
    save();
    closeModal();
    render();
  }

  function icsDate(iso) {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  }

  function icsEscape(s) {
    return String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function downloadICS(ev) {
    const start = new Date(ev.datetime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // default 1h duration
    const catLabel = ev.category === "Other" && ev.customType ? ev.customType : ev.category;
    const summary = `${ev.description} (${catLabel})`;
    const now = new Date();

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Events//Personal//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + ev.id + "@events.local",
      "DTSTAMP:" + icsDate(now.toISOString()),
      "DTSTART:" + icsDate(start.toISOString()),
      "DTEND:" + icsDate(end.toISOString()),
      "SUMMARY:" + icsEscape(summary),
      "CATEGORIES:" + icsEscape(catLabel),
      "DESCRIPTION:" + icsEscape(ev.notes || ""),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + icsEscape(summary),
      "TRIGGER:-PT30M",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = ev.description.replace(/[^a-z0-9]+/gi, "_").slice(0, 40) || "event";
    a.download = safeName + ".ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 200);
  }

  function toggleSidebar(force) {
    const open = force !== undefined ? force : !els.sidebar.classList.contains("open");
    els.sidebar.classList.toggle("open", open);
    els.sidebarBackdrop.classList.toggle("visible", open);
  }

  function bindEvents() {
    els.addBtn.addEventListener("click", openCreateModal);
    els.modalClose.addEventListener("click", closeModal);
    els.modalCancel.addEventListener("click", closeModal);
    els.modalDelete.addEventListener("click", handleDelete);
    els.modal.addEventListener("click", (e) => {
      if (e.target === els.modal) closeModal();
    });
    els.form.addEventListener("submit", handleSubmit);

    els.category.addEventListener("change", () => {
      const isOther = els.category.value === "Other";
      els.customWrap.classList.toggle("hidden", !isOther);
      if (isOther) setTimeout(() => els.custom.focus(), 50);
    });

    els.sidebarToggle.addEventListener("click", () => toggleSidebar());
    els.sidebarBackdrop.addEventListener("click", () => toggleSidebar(false));

    els.navItems.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        render();
        toggleSidebar(false);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!els.modal.classList.contains("hidden")) closeModal();
        else if (els.sidebar.classList.contains("open")) toggleSidebar(false);
      }
    });

    // Refresh due-soon/overdue status every minute
    setInterval(() => {
      if (state.view === "upcoming" && els.modal.classList.contains("hidden")) render();
    }, 60 * 1000);
  }

  load();
  bindEvents();
  render();
})();
