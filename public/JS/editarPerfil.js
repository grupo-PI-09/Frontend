const profileForm = document.getElementById("profile-form");
const profileFeedback = document.getElementById("profile-feedback");
const deleteButton = document.getElementById("delete-account-button");

function setProfileFeedback(message, type) {
    if (!profileFeedback) {
        return;
    }

    profileFeedback.textContent = message;
    profileFeedback.className = "profile-feedback";

    if (type) {
        profileFeedback.classList.add(type);
    }
}

function fillProfileForm(user) {
    document.getElementById("profile-name").value = user.name;
    document.getElementById("profile-email").value = user.email;
    document.getElementById("profile-password").value = user.password;
}

async function loadCurrentProfile() {
    const currentUser = await window.userStore.getCurrentUser();

    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    fillProfileForm(currentUser);
}

if (profileForm) {
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            name: document.getElementById("profile-name").value,
            email: document.getElementById("profile-email").value,
            password: document.getElementById("profile-password").value,
        };

        if (!payload.name || !payload.email || !payload.password) {
            setProfileFeedback("Preencha todos os campos para atualizar o perfil.", "error");
            return;
        }

        try {
            await window.userStore.updateCurrentUser(payload);
            setProfileFeedback("Perfil atualizado com sucesso.", "success");
        } catch (error) {
            setProfileFeedback(error.message, "error");
        }
    });
}

if (deleteButton) {
    deleteButton.addEventListener("click", async () => {
        const confirmed = window.confirm("Deseja realmente excluir a sua conta?");

        if (!confirmed) {
            return;
        }

        try {
            await window.userStore.deleteCurrentUser();
            window.alert("Conta excluida com sucesso.");
            window.location.href = "index.html";
        } catch (error) {
            setProfileFeedback(error.message, "error");
        }
    });
}

loadCurrentProfile().catch((error) => {
    console.error("Erro ao carregar perfil:", error);
    setProfileFeedback("Nao foi possivel carregar os dados do perfil.", "error");
});
