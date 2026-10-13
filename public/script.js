
const form = document.getElementById("project-form");
const nameInput = document.getElementById("name");
const statusSelect = document.getElementById("status");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const message = document.getElementById("message");
const emptyState = document.getElementById("empty-state");
const projectList = document.getElementById("project-list");

const STORAGE_KEY = "workshop-projects-v1";
const VALID_STATUSES = ["Planned", "In Progress", "Completed"];

let projects = [];
let editingId = null;
let storageReady = false;

function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

function loadProjects() {
  let savedText;

  try {
    savedText = localStorage.getItem(STORAGE_KEY);
  } catch {
    showMessage("Could not read saved projects from this browser.");
    return false;
  }

  if (savedText === null) {
    projects = [];
    storageReady = true;
    return true;
  }

  let savedProjects;

  try {
    savedProjects = JSON.parse(savedText);
  } catch {
    showMessage(
      "Saved project data is invalid. It was not overwritten. Please ask for help to recover it."
    );
    return false;
  }

  if (
    !Array.isArray(savedProjects) ||
    !savedProjects.every(
      (project) =>
        project &&
        typeof project.id === "string" &&
        project.id.length > 0 &&
        typeof project.name === "string" &&
        project.name.trim().length > 0 &&
        project.name.length <= 80 &&
        VALID_STATUSES.includes(project.status)
    ) ||
    new Set(savedProjects.map((project) => project.id)).size !==
      savedProjects.length
  ) {
    showMessage(
      "Saved project data has an invalid format. It was not overwritten."
    );
    return false;
  }

  projects = savedProjects;
  storageReady = true;
  return true;
}

function saveProjects() {
  if (!storageReady) {
    showMessage(
      "Projects were not changed because saved data could not be loaded safely."
    );
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    showMessage(
      "Could not save projects in this browser. Please try again."
    );
    return false;
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = "Add Project";
  cancelButton.hidden = true;
}

function renderProjects() {
  projectList.replaceChildren();

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }

  projects.forEach((project) => {
    const item = document.createElement("li");
    item.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = project.name;

    const meta = document.createElement("div");
    meta.className = "project-meta";

    const status = document.createElement("span");
    status.className = "project-status";
    status.dataset.status = project.status;
    status.textContent = project.status;

    meta.appendChild(status);

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "project-edit";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", `Edit ${project.name}`);
    editButton.addEventListener("click", () => editProject(project.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "project-delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${project.name}`);
    deleteButton.addEventListener("click", () => deleteProject(project.id));

    actions.append(editButton, deleteButton);
    item.append(title, meta, actions);
    projectList.appendChild(item);
  });
}

function editProject(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;

  editingId = project.id;
  nameInput.value = project.name;
  statusSelect.value = project.status;

  saveButton.textContent = "Save Changes";
  cancelButton.hidden = false;

  showMessage(`Editing ${project.name}.`);
  nameInput.focus();
}

function deleteProject(id) {
  const index = projects.findIndex((item) => item.id === id);
  if (index === -1) return;

  const project = projects[index];

  if (!window.confirm(`Delete "${project.name}"?`)) {
    return;
  }

  projects.splice(index, 1);

  if (!saveProjects()) {
    projects.splice(index, 0, project);
    renderProjects();
    return;
  }

  if (editingId === id) {
    resetForm();
  }

  renderProjects();
  showMessage(`${project.name} deleted.`);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!storageReady) {
    showMessage(
      "Projects cannot be changed until saved data can be loaded safely."
    );
    return;
  }

  const name = nameInput.value.trim();
  const status = statusSelect.value;

  if (!name) {
    showMessage("Please enter a project name.");
    nameInput.focus();
    return;
  }

  if (name.length > 80) {
    showMessage("Project names must be 80 characters or fewer.");
    nameInput.focus();
    return;
  }

  if (!VALID_STATUSES.includes(status)) {
    showMessage("Please select a valid project status.");
    return;
  }

  if (editingId !== null) {
    const project = projects.find((item) => item.id === editingId);

    if (!project) {
      resetForm();
      showMessage("Project not found. Please try again.");
      return;
    }

    const previous = { ...project };

    project.name = name;
    project.status = status;

    if (!saveProjects()) {
      Object.assign(project, previous);
      return;
    }

    resetForm();
    renderProjects();
    showMessage(`${name} updated successfully.`);
    return;
  }

  const project = {
    id: crypto.randomUUID(),
    name,
    status
  };

  projects.push(project);

  if (!saveProjects()) {
    projects.pop();
    return;
  }

  resetForm();
  renderProjects();
  showMessage(`${name} added successfully.`);
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Editing cancelled.");
  nameInput.focus();
});

if (loadProjects()) {
  renderProjects();
} else {
  renderProjects();
}