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

// ================= GLOBAL =================
let isOwner = localStorage.getItem("owner") === "true";

// ================= LOGIN =================
function login() {
    let pass = prompt("Enter password");

    fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ password: pass })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            isOwner = true;
            document.body.classList.add("owner");
            localStorage.setItem("owner", "true");
            updateOwnerUI();
        }
    });
}
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

    data.forEach(d => {
        div.innerHTML += `
            <div class="card">
                <h3>${d.title}</h3>
                <p>${d.desc}</p>
            </div>
        `;
    });
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
function addProject() {
    let form = new FormData();
    form.append("title", title.value);
    form.append("desc", desc.value);
    if (file.files[0]) form.append("file", file.files[0]);

    fetch("/add-project", { method: "POST", body: form })
    .then(loadProjects);
}

function loadProjects() {
    fetch("/projects")
    .then(res => res.json())
    .then(data => {
        let div = document.getElementById("projects");
        if (!div) return;

        div.innerHTML = "";

        data.forEach(p => {
            div.innerHTML += `
                <div class="project-card">
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>
                </div>
            `;
        });

        loadGithubProjects(); // merge github
    });
}

// ================= SKILLS =================
function addSkill() {
    fetch("/add-skill", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ skill: skillInput.value })
    }).then(loadSkills);
}

function loadSkills() {
    fetch("/skills")
    .then(res => res.json())
    .then(data => {
        let el = document.getElementById("skills");
        if (!el) return;

        el.innerHTML = "";
        data.forEach(s => el.innerHTML += `<li>${s}</li>`);
    });
}

// ================= GITHUB (ADDED ONLY) =================
let githubSelected = JSON.parse(localStorage.getItem("githubRepos")) || [];

function addGithubRepo() {
    let repo = document.getElementById("repoName").value.trim();

    if (!repo) return alert("Enter repo name");

    if (!githubSelected.includes(repo)) {
        githubSelected.push(repo);
        localStorage.setItem("githubRepos", JSON.stringify(githubSelected));
    }

    document.getElementById("repoName").value = "";
    loadGithubProjects();
}

function loadGithubProjects() {
    let username = "Shivanginigupta25";

    fetch(`https://api.github.com/users/${username}/repos`)
    .then(res => res.json())
    .then(data => {
        let container = document.getElementById("projects");
        if (!container) return;

        let filtered = data.filter(repo =>
            githubSelected.includes(repo.name)
        );

        filtered.forEach(repo => {

            if (document.getElementById("git-" + repo.name)) return;

            container.innerHTML += `
                <div class="project-card" id="git-${repo.name}">
                    <h3>${repo.name}</h3>
                    <p>${repo.description || "No description"}</p>
                    <p style="color:#38bdf8;">🌐 GitHub Project</p>

                    <a href="${repo.html_url}" target="_blank">
                        <button>View Code 🔗</button>
                    </a>
                </div>
            `;
        });
    });
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
/* 🔥 SMOOTH FADE + SLIDE */
document.querySelectorAll(".fade").forEach(el => {
    el.style.opacity = 0;
    el.style.transform = "translateY(40px)";
});

window.addEventListener("scroll", () => {
    document.querySelectorAll(".fade").forEach(el => {
        let pos = el.getBoundingClientRect().top;

        if (pos < window.innerHeight - 100) {
            el.style.opacity = 1;
            el.style.transform = "translateY(0)";
            el.style.transition = "0.6s ease";
        }
    });
});
document.addEventListener("mousemove", e => {
    document.body.style.setProperty("--x", e.clientX + "px");
    document.body.style.setProperty("--y", e.clientY + "px");

    let glow = document.querySelector("body::after");
});
