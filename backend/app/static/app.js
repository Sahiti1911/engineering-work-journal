const form = document.getElementById("entry-form");
const list = document.getElementById("entry-list");

async function loadEntries() {
  const res = await fetch("/api/entries");
  const entries = await res.json();
  list.innerHTML = "";
  for (const entry of entries) {
    const li = document.createElement("li");

    const header = document.createElement("strong");
    header.textContent = `${entry.work_date} — ${entry.title}`;
    li.appendChild(header);

    if (entry.tags) {
      const tags = document.createElement("span");
      tags.className = "tags";
      tags.textContent = ` [${entry.tags}]`;
      li.appendChild(tags);
    }

    const body = document.createElement("p");
    body.textContent = entry.body;
    li.appendChild(body);

    list.appendChild(li);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = {
    title: formData.get("title"),
    body: formData.get("body"),
    work_date: formData.get("work_date"),
    tags: formData.get("tags") || null,
  };

  await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  form.reset();
  await loadEntries();
});

loadEntries();
