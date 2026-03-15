const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const feedback = document.getElementById("feedback");
const backButton = document.querySelector(".back-button");

const API_USERS_URL = "http://localhost:8080/users";
const STORAGE_KEY = "RR_MAXX_USERS";

function setFeedback(message, type) {
    if (!feedback) {
        return;
    }

    feedback.textContent = message;
    feedback.className = "feedback";

    if (type) {
        feedback.classList.add(type);
    }
}

function normalizeUser(user) {
    return {
        id: user.id ?? Date.now(),
        name: String(user.name || "").trim(),
        email: String(user.email || "").trim().toLowerCase(),
        password: String(user.password || ""),
    };
}

function readUsersFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return [];
    }

    try {
        const users = JSON.parse(raw);
        return Array.isArray(users) ? users.map(normalizeUser) : [];
    } catch (error) {
        console.error("Erro ao ler usuarios salvos localmente:", error);
        return [];
    }
}

function writeUsersToStorage(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

async function fetchUsersFromApi() {
    const response = await fetch(API_USERS_URL);

    if (!response.ok) {
        throw new Error("Nao foi possivel carregar os usuarios.");
    }

    const users = await response.json();
    return Array.isArray(users) ? users.map(normalizeUser) : [];
}

async function createUserInApi(user) {
    const response = await fetch(API_USERS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        throw new Error("Nao foi possivel cadastrar o usuario.");
    }

    return normalizeUser(await response.json());
}

async function getUsers() {
    try {
        const users = await fetchUsersFromApi();
        writeUsersToStorage(users);
        return users;
    } catch (error) {
        console.warn("API indisponivel. Usando armazenamento local.", error);
        return readUsersFromStorage();
    }
}

async function registerUser(payload) {
    const user = normalizeUser(payload);
    const users = await getUsers();
    const userExists = users.some((item) => item.email === user.email);

    if (userExists) {
        throw new Error("Ja existe uma conta com este e-mail.");
    }

    try {
        const createdUser = await createUserInApi(user);
        writeUsersToStorage([...users, createdUser]);
        return createdUser;
    } catch (error) {
        const updatedUsers = [...users, user];
        writeUsersToStorage(updatedUsers);
        return user;
    }
}

async function loginUser(payload) {
    const credentials = normalizeUser(payload);
    const users = await getUsers();
    const user = users.find(
        (item) =>
            item.email === credentials.email &&
            item.password === credentials.password
    );

    if (!user) {
        throw new Error("E-mail ou senha incorretos.");
    }

    return user;
}

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.name || !payload.email || !payload.password) {
            setFeedback("Preencha todos os campos do cadastro.", "error");
            return;
        }

        try {
            await registerUser(payload);
            setFeedback("Cadastro realizado com sucesso.", "success");
            registerForm.reset();
        } catch (error) {
            setFeedback(error.message, "error");
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const payload = Object.fromEntries(formData.entries());

        if (!payload.email || !payload.password) {
            setFeedback("Informe e-mail e senha para entrar.", "error");
            return;
        }

        try {
            const user = await loginUser(payload);
            sessionStorage.setItem("NOME_USUARIO", user.name);
            setFeedback(`Login realizado com sucesso. Bem-vindo, ${user.name}.`, "success");
            loginForm.reset();
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        } catch (error) {
            setFeedback(error.message, "error");
        }
    });
}

if (backButton) {
    backButton.addEventListener("click", () => {
        const target = backButton.dataset.target;

        if (target && target !== "history") {
            window.location.href = target;
            return;
        }

        if (history.length > 1) {
            history.back();
        } else {
            window.location.href = "index.html";
        }
    });
}
