
const form = document.getElementById("project-form");
const nameInput = document.getElementById("name");
const statusSelect = document.getElementById("status");
const projectList = document.getElementById("project-list");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");

const projects = [];

function renderProjects() {
  projectList.replaceChildren();

  projects.forEach((project) => {
    const item = document.createElement("li");

    const name = document.createElement("h3");
    name.textContent = project.name;

    const status = document.createElement("p");
    status.textContent = `Status: ${project.status}`;

    item.append(name, status);
    projectList.appendChild(item);
  });

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusSelect.value;

  if (name === "") {
    if (message) {
      message.textContent = "Please enter a project name.";
    }
    nameInput.focus();
    return;
  }

  const project = {
    id: crypto.randomUUID(),
    name: name,
    status: status
  };

  projects.push(project);

  renderProjects();
  form.reset();

  if (message) {
    message.textContent = `${name} added successfully.`;
  }
});

renderProjects();