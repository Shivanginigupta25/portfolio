// ================= OWNER MODE (NO PASSWORD) =================
let isOwner = localStorage.getItem("owner") === "true";

// apply owner class
if (isOwner) {
    document.body.classList.add("owner");
}

// ================= INIT =================
window.onload = () => {
    updateOwnerUI();
    loadProjects();
    loadSkills();
    loadGithubProjects();
    loadWhatIDo();

    // hide logout button for viewers
    if (!isOwner) {
        document.querySelector(".logout-btn")?.remove();
    }
};

// ================= OWNER UI =================
function updateOwnerUI() {
    document.querySelectorAll(".owner-only").forEach(el => {
        el.style.display = isOwner ? "block" : "none";
    });
}

// ================= LOGOUT =================
function logoutOwner() {
    localStorage.removeItem("owner");
    location.reload();
}

// ================= WHAT I DO =================
function loadWhatIDo() {
    let data = JSON.parse(localStorage.getItem("whatido")) || [
        { title: "💻 Web Development", desc: "I build responsive websites." },
        { title: "🤖 Machine Learning", desc: "I explore ML models." },
        { title: "🎨 UI/UX Design", desc: "I design clean interfaces." }
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

function saveWhatIDo() {
    let data = [
        { title: wd1title.value, desc: wd1desc.value },
        { title: wd2title.value, desc: wd2desc.value },
        { title: wd3title.value, desc: wd3desc.value }
    ];

    localStorage.setItem("whatido", JSON.stringify(data));
    loadWhatIDo();
}

function deleteWhatIDo(index) {
    let data = JSON.parse(localStorage.getItem("whatido")) || [];
    data.splice(index, 1);
    localStorage.setItem("whatido", JSON.stringify(data));
    loadWhatIDo();
}

// ================= PROJECTS =================
function addProject() {
    let projects = JSON.parse(localStorage.getItem("projects")) || [];

    let title = document.getElementById("title").value;
    let desc = document.getElementById("desc").value;
    let fileInput = document.getElementById("imageInput");

    let file = fileInput.files[0];

    if (!title || !desc) {
        alert("Enter title & description");
        return;
    }

    // ✅ If image selected
    if (file) {
        let reader = new FileReader();

        reader.onload = function (e) {
            projects.push({
                title: title,
                desc: desc,
                image: e.target.result // base64 image
            });

            localStorage.setItem("projects", JSON.stringify(projects));
            loadProjects();
        };

        reader.readAsDataURL(file);
    } else {
        // no image
        projects.push({
            title: title,
            desc: desc
        });

        localStorage.setItem("projects", JSON.stringify(projects));
        loadProjects();
    }

    // clear inputs
    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    fileInput.value = "";
}

function loadProjects() {
    let projects = JSON.parse(localStorage.getItem("projects")) || [];
    let div = document.getElementById("projects");

    if (!div) return;

    div.innerHTML = "";

    projects.forEach((p, index) => {
        div.innerHTML += `
            <div class="project-card">

                ${p.image ? `<img src="${p.image}" class="project-media">` : ""}

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

// ================= GITHUB PROJECTS =================
function addGithubRepo() {
    let input = document.getElementById("repoName").value.trim();

    if (!input) {
        alert("Enter repo name");
        return;
    }

    // handle full link
    if (input.includes("github.com")) {
        let parts = input.split("/");
        input = parts[parts.length - 1];
    }

    let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];

    if (!githubSelected.includes(input)) {
        githubSelected.push(input);
        localStorage.setItem("githubRepos", JSON.stringify(githubSelected));
    }

    document.getElementById("repoName").value = "";
    loadGithubProjects();
}

function deleteGithubRepo(repoName) {
    let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];

    githubSelected = githubSelected.filter(r => r !== repoName);

    localStorage.setItem("githubRepos", JSON.stringify(githubSelected));

    loadGithubProjects();
}

function loadGithubProjects() {
    let username = "Shivanginigupta25";

    let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];

    fetch(`https://api.github.com/users/${username}/repos`)
    .then(res => res.json())
    .then(data => {

        let container = document.getElementById("projects");
        if (!container) return;

        // remove old github cards only
        document.querySelectorAll(".github-card").forEach(el => el.remove());

        data.forEach(repo => {
            if (githubSelected.length === 0 || githubSelected.includes(repo.name)) {
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

    })
    .catch(err => console.log("GitHub Error:", err));
}

// ================= SKILLS =================
function addSkill() {
    let skills = JSON.parse(localStorage.getItem("skills")) || [];
    let input = document.getElementById("skillInput");

    if (!input.value.trim()) return;

    skills.push(input.value);
    localStorage.setItem("skills", JSON.stringify(skills));

    input.value = "";

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

// ================= CONTACT =================
function sendMessage() {
    document.getElementById("status").innerText =
        "⚠️ Backend removed → message not sent";
}

// ================= THEME =================
function toggleTheme() {
    document.body.classList.toggle("light");

    let isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
}

// ================= LOAD THEME =================
let savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
}