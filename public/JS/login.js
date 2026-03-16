const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const feedback = document.getElementById("feedback");
const backButton = document.querySelector(".back-button");

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
            await window.userStore.registerUser(payload);
            setFeedback("Cadastro realizado com sucesso. Redirecionando para o login...", "success");
            registerForm.reset();
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1400);
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
            const user = await window.userStore.loginUser(payload);
            window.userStore.persistSession(user);
            setFeedback(`Login realizado com sucesso. Bem-vindo, ${user.name}.`, "success");
            loginForm.reset();
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1200);
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
