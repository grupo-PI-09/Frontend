(function attachUserStore() {
    const API_USERS_URL = "http://localhost:8080/users";
    const STORAGE_KEY = "RR_MAXX_USERS";

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users.map(normalizeUser)));
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

    async function updateUserInApi(userId, updates) {
        const response = await fetch(`${API_USERS_URL}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(normalizeUser(updates)),
        });

        if (!response.ok) {
            throw new Error("Nao foi possivel atualizar o usuario.");
        }

        return normalizeUser(await response.json());
    }

    async function deleteUserInApi(userId) {
        const response = await fetch(`${API_USERS_URL}/${userId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Nao foi possivel excluir o usuario.");
        }
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

    async function getCurrentUser() {
        const currentEmail = sessionStorage.getItem("USER_EMAIL");
        const currentId = sessionStorage.getItem("USER_ID");

        if (!currentEmail && !currentId) {
            return null;
        }

        const users = await getUsers();
        return (
            users.find((user) => String(user.id) === String(currentId)) ||
            users.find((user) => user.email === String(currentEmail).toLowerCase()) ||
            null
        );
    }

    async function updateCurrentUser(payload) {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            throw new Error("Usuario nao encontrado. Faca login novamente.");
        }

        const nextUser = normalizeUser({
            ...currentUser,
            ...payload,
            id: currentUser.id,
        });

        const users = await getUsers();
        const emailTaken = users.some(
            (user) =>
                user.email === nextUser.email &&
                String(user.id) !== String(currentUser.id)
        );

        if (emailTaken) {
            throw new Error("Ja existe uma conta com este e-mail.");
        }

        try {
            const updatedUser = await updateUserInApi(currentUser.id, nextUser);
            const updatedUsers = users.map((user) =>
                String(user.id) === String(currentUser.id) ? updatedUser : user
            );
            writeUsersToStorage(updatedUsers);
            persistSession(updatedUser);
            return updatedUser;
        } catch (error) {
            const updatedUsers = users.map((user) =>
                String(user.id) === String(currentUser.id) ? nextUser : user
            );
            writeUsersToStorage(updatedUsers);
            persistSession(nextUser);
            return nextUser;
        }
    }

    async function deleteCurrentUser() {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            throw new Error("Usuario nao encontrado. Faca login novamente.");
        }

        const users = await getUsers();

        try {
            await deleteUserInApi(currentUser.id);
        } catch (error) {
            console.warn("API indisponivel. Excluindo usuario apenas no armazenamento local.", error);
        }

        const updatedUsers = users.filter(
            (user) => String(user.id) !== String(currentUser.id)
        );

        writeUsersToStorage(updatedUsers);
        clearSession();
    }

    function persistSession(user) {
        sessionStorage.setItem("USER_ID", String(user.id));
        sessionStorage.setItem("USER_EMAIL", user.email);
        sessionStorage.setItem("NOME_USUARIO", user.name);
    }

    function clearSession() {
        sessionStorage.removeItem("USER_ID");
        sessionStorage.removeItem("USER_EMAIL");
        sessionStorage.removeItem("NOME_USUARIO");
    }

    window.userStore = {
        clearSession,
        deleteCurrentUser,
        getCurrentUser,
        getUsers,
        loginUser,
        persistSession,
        registerUser,
        updateCurrentUser,
    };
})();
