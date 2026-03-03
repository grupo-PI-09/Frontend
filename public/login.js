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

async function sendRequest(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.ok) {
        throw new Error(data.message || "Nao foi possivel concluir a operacao.");
    }

    return data;
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
            const result = await sendRequest("/Usuarios", payload);
            setFeedback(result.message, "success");
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
            const result = await sendRequest("/Login", payload);
            setFeedback(`${result.message} Bem-vindo, ${result.user.name}.`, "success");
            loginForm.reset();
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
        }
    });
}
