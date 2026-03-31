let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];
// ================= LOAD THEME =================
let savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
}
// ================= INIT =================
window.onload = () => {
    document.querySelectorAll(".fade").forEach(el => el.classList.add("show"));
    updateOwnerUI();
    loadProjects();
    loadSkills();
    loadGithubProjects(); // ✅ added
    loadWhatIDo();
};
let isOwner = localStorage.getItem("owner") === "true";

if (isOwner) {
    document.body.classList.add("owner");
}
// ================= GLOBAL =================


// ================= WHAT I DO =================

// LOAD
function loadWhatIDo() {
    let data = JSON.parse(localStorage.getItem("whatido")) || [
        { title: "💻 Web Development", desc: "I build responsive and modern websites using HTML, CSS, JS." },
        { title: "🤖 Machine Learning", desc: "I explore ML models and data-driven solutions." },
        { title: "🎨 UI/UX Design", desc: "I design clean and user-friendly interfaces." }
    ];

    let div = document.getElementById("whatido-content");
    if (!div) return;

    div.innerHTML = "";
     data.forEach((d, index) => {
    div.innerHTML += `
        <div class="card">
            <h3>${d.title}</h3>
            <p>${d.desc}</p>

            ${isOwner ? `<button onclick="deleteWhatIDo(${index})">❌ Delete</button>` : ""}
        </div>
    `;
});
}
function deleteWhatIDo(index) {
    let data = JSON.parse(localStorage.getItem("whatido")) || [];
    data.splice(index, 1);
    localStorage.setItem("whatido", JSON.stringify(data));
    loadWhatIDo();
}

// SAVE (OWNER)
function saveWhatIDo() {
    let data = [
        {
            title: document.getElementById("wd1title").value,
            desc: document.getElementById("wd1desc").value
        },
        {
            title: document.getElementById("wd2title").value,
            desc: document.getElementById("wd2desc").value
        },
        {
            title: document.getElementById("wd3title").value,
            desc: document.getElementById("wd3desc").value
        }
    ];

    localStorage.setItem("whatido", JSON.stringify(data));
    loadWhatIDo();
}

// ================= OWNER UI =================
function updateOwnerUI() {
    document.querySelectorAll(".owner-only").forEach(el => {
        el.style.display = isOwner ? "block" : "none";
    });
}

// ================= PROJECTS =================

function addGithubRepo() {
    let input = document.getElementById("repoName").value.trim();

    if (!input) {
        alert("Enter repo name");
        return;
    }

    // 🔥 handle full GitHub link also
    if (input.includes("github.com")) {
        let parts = input.split("/");
        input = parts[parts.length - 1];
    }

    // 🔥 reload latest data
    let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];

    if (!githubSelected.includes(input)) {
        githubSelected.push(input);
        localStorage.setItem("githubRepos", JSON.stringify(githubSelected));
    }

    console.log("Saved repos:", githubSelected);

    document.getElementById("repoName").value = "";

    loadGithubProjects();
}


function addProject() {
    let projects = JSON.parse(localStorage.getItem("projects")) || [];

    projects.push({
        title: title.value,
        desc: desc.value
    });

    localStorage.setItem("projects", JSON.stringify(projects));
    loadProjects();
}

function loadProjects() {
    let projects = JSON.parse(localStorage.getItem("projects")) || [];
    let div = document.getElementById("projects");

    if (!div) return;

    div.innerHTML = "";

    projects.forEach((p, index) => {
        div.innerHTML += `
            <div class="project-card">
                <h3>${p.title}</h3>
                <p>${p.desc}</p>

                ${isOwner ? `<button onclick="deleteProject(${index})">❌ Delete</button>` : ""}
            </div>
        `;
    });

    loadGithubProjects();
}

function deleteProject(index) {
    let projects = JSON.parse(localStorage.getItem("projects")) || [];
    projects.splice(index, 1);
    localStorage.setItem("projects", JSON.stringify(projects));
    loadProjects();
}
function deleteGithubRepo(repoName) {
    let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];

    // remove selected repo
    githubSelected = githubSelected.filter(r => r !== repoName);

    localStorage.setItem("githubRepos", JSON.stringify(githubSelected));

    loadGithubProjects();
}

// ================= SKILLS =================
function addSkill() {
    let skills = JSON.parse(localStorage.getItem("skills")) || [];
    skills.push(skillInput.value);

    localStorage.setItem("skills", JSON.stringify(skills));
    loadSkills();
}

function loadSkills() {
    let skills = JSON.parse(localStorage.getItem("skills")) || [];
    let el = document.getElementById("skills");

    if (!el) return;

    el.innerHTML = "";

    skills.forEach((s, index) => {
        el.innerHTML += `
            <li>
                ${s}
                ${isOwner ? `<button onclick="deleteSkill(${index})">❌</button>` : ""}
            </li>
        `;
    });
}

function deleteSkill(index) {
    let skills = JSON.parse(localStorage.getItem("skills")) || [];
    skills.splice(index, 1);

    localStorage.setItem("skills", JSON.stringify(skills));
    loadSkills();
}
// ================= GITHUB (ADDED ONLY) =================
function loadGithubProjects() {
    let username = "Shivanginigupta25";

    let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];

    fetch(`https://api.github.com/users/${username}/repos`)
    .then(res => res.json())
    .then(data => {

        console.log("GitHub repos:", data);

        let container = document.getElementById("projects");
        if (!container) return;

        // 🔥 remove only old github cards (not normal projects)
        document.querySelectorAll(".github-card").forEach(el => el.remove());

        let found = false;

        data.forEach(repo => {
            if (githubSelected.includes(repo.name)) {
                found = true;

                container.innerHTML += `
    <div class="project-card github-card">
        <h3>${repo.name}</h3>
        <p>${repo.description || "No description"}</p>

        <a href="${repo.html_url}" target="_blank">
            <button>View Code 🔗</button>
        </a>

        ${isOwner ? `<button onclick="deleteGithubRepo('${repo.name}')">❌ Delete</button>` : ""}
    </div>
`;
            }
        });

        if (!found) {
            console.log("❌ No matching repo found");
        }
    })
    .catch(err => console.log("Error:", err));
}
// ================= CONTACT =================
function sendMessage() {

    fetch("/contact", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: name.value,
            email: email.value,
            message: message.value
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("status").innerText =
            data.success ? "✅ Message sent" : "❌ Failed";
    });
}

// ================= THEME =================
function toggleTheme() {
    document.body.classList.toggle("light");

    // save theme
    let isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    document.getElementById("themeBtn").innerText = isLight ? "🌙" : "☀️";
}
document.addEventListener("mousemove", e => {
    document.body.style.setProperty("--x", e.clientX + "px");
    document.body.style.setProperty("--y", e.clientY + "px");

});

