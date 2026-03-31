// ================= FIREBASE (FIXED ONLY) =================
const firebaseConfig = {
  apiKey: "AIzaSyB1eTVmfPTCpKGC2M65-SIpFGfSndCaL3s",
  authDomain: "portfolio-2525.firebaseapp.com",
  projectId: "portfolio-2525",
  storageBucket: "portfolio-2525.firebasestorage.app",
  messagingSenderId: "1062586430122",
  appId: "1:1062586430122:web:c8d624b0658a3c501f96d3",
  measurementId: "G-E8F9LXERPN"
};

// ✅ Prevent duplicate initialization
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Firestore
const db = firebase.firestore();

// 🔥 ENABLE OFFLINE
db.enablePersistence()
.catch((err) => {
    console.log("Persistence error:", err.code);
});


// ================= OWNER MODE (SECURE) =================

// 🔐 MD5 HASH of your password: SHIVnan@2525.54321
const SECRET = md5("SHIVnan@2525.54321");

// Check owner
let isOwner = localStorage.getItem("owner") === "true";

if (isOwner) {
    document.body.classList.add("owner");
}

// 🔐 LOGIN FUNCTION
function loginOwner() {
    let pass = prompt("Enter admin password:");

    if (!pass) return;

    let hashed = md5(pass);

    if (hashed === SECRET) {
        localStorage.setItem("owner", "true");
        alert("Login successful ✅");
        location.reload();
    } else {
        alert("Wrong password ❌");
    }
}

// 🔐 LOGOUT
function logoutOwner() {
    localStorage.removeItem("owner");
    location.reload();
}

// ================= INIT =================
window.onload = () => {
    updateOwnerUI();
    loadProjects();
    loadSkills();
    loadGithubProjects();
    loadWhatIDo();

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


// ================= WHAT I DO =================
function loadWhatIDo() {
    let div = document.getElementById("whatido-content");
    if (!div) return;

    div.innerHTML = "";

    db.collection("whatido").doc("main").get().then(doc => {
        let data = doc.exists ? doc.data().data : [];

        data.forEach((d) => {
            div.innerHTML += `
                <div class="card">
                    <h3>${d.title}</h3>
                    <p>${d.desc}</p>
                </div>
            `;
        });
    });
}

function saveWhatIDo() {
    let data = [
        { title: wd1title.value, desc: wd1desc.value },
        { title: wd2title.value, desc: wd2desc.value },
        { title: wd3title.value, desc: wd3desc.value }
    ];

    db.collection("whatido").doc("main").set({ data: data })
    .then(() => loadWhatIDo());
}


// ================= PROJECTS =================
function addProject() {
    let title = document.getElementById("title").value;
    let desc = document.getElementById("desc").value;
    let file = document.getElementById("imageInput").files[0];

    if (!title || !desc) {
        alert("Enter title & description");
        return;
    }

    if (file) {
        let reader = new FileReader();

        reader.onload = function(e) {
            db.collection("projects").add({
                title: title,
                desc: desc,
                image: e.target.result
            }).then(() => loadProjects());
        };

        reader.readAsDataURL(file);
    } else {
        db.collection("projects").add({
            title: title,
            desc: desc
        }).then(() => loadProjects());
    }

    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("imageInput").value = "";
}

function loadProjects() {
    let div = document.getElementById("projects");
    if (!div) return;

    div.innerHTML = "";

    db.collection("projects").get().then(snapshot => {
        snapshot.forEach(doc => {
            let p = doc.data();

            div.innerHTML += `
                <div class="project-card">
                    ${p.image ? `<img src="${p.image}" class="project-media">` : ""}
                    <h3>${p.title}</h3>
                    <p>${p.desc}</p>

                    ${isOwner ? `<button onclick="deleteProject('${doc.id}')">❌ Delete</button>` : ""}
                </div>
            `;
        });
    });

    loadGithubProjects();
}

function deleteProject(id) {
    db.collection("projects").doc(id).delete().then(() => {
        loadProjects();
    });
}


// ================= GITHUB PROJECTS =================
function addGithubRepo() {
    let input = document.getElementById("repoName").value.trim();

    if (!input) {
        alert("Enter repo name");
        return;
    }

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

                        ${isOwner ? `<button onclick="deleteGithubRepo('${repo.name}')">❌</button>` : ""}
                    </div>
                `;
            }
        });
    });
}


// ================= SKILLS =================
function addSkill() {
    let input = document.getElementById("skillInput");

    if (!input.value.trim()) return;

    db.collection("skills").add({
        name: input.value
    }).then(() => {
        input.value = "";
        loadSkills();
    });
}

function loadSkills() {
    let el = document.getElementById("skills");
    if (!el) return;

    el.innerHTML = "";

    db.collection("skills").get().then(snapshot => {
        snapshot.forEach(doc => {
            let s = doc.data();

            el.innerHTML += `
                <li>
                    ${s.name}
                    ${isOwner ? `<button onclick="deleteSkill('${doc.id}')">❌</button>` : ""}
                </li>
            `;
        });
    });
}

function deleteSkill(id) {
    db.collection("skills").doc(id).delete().then(() => {
        loadSkills();
    });
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