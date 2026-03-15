const formularioLogin = document.getElementById("login-form");
const formularioCadastro = document.getElementById("register-form");
const feedback = document.getElementById("feedback");
const botaoVoltar = document.querySelector(".back-button");

function buscarUsuarios() {
  return fetch("../users.json").then((response) => response.json()).then((dados) => {
    return dados.users || dados;
  });
}

function cadastrarUsuario() {
  const usuario = {
    id: Date.now(),
    name: document.getElementById("register-name").value,
    email: document.getElementById("register-email").value,
    password: document.getElementById("register-password").value,
  };

  if (!usuario.name || !usuario.email || !usuario.password) {
    feedback.textContent = "Preencha todos os campos do cadastro.";
    feedback.className = "feedback error";
    return;
  }

  buscarUsuarios()
    .then((usuarios) => {
      const usuarioExiste = usuarios.find(
        (item) => item.email === usuario.email
      );

      if (usuarioExiste) {
        throw new Error("Ja existe uma conta com este e-mail.");
      }

      return fetch("/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao cadastrar usuario.");
      }

      return response.json();
    })
    .then(() => {
      feedback.textContent = "Cadastro realizado com sucesso.";
      feedback.className = "feedback success";
      formularioCadastro.reset();
    })
    .catch((erro) => {
      console.error("Erro ao cadastrar usuario:", erro);
      feedback.textContent = erro.message || "Erro ao cadastrar usuario.";
      feedback.className = "feedback error";
    });
}

function logarUsuario() {
  const usuario = {
    email: document.getElementById("login-email").value,
    password: document.getElementById("login-password").value,
  };

  if (!usuario.email || !usuario.password) {
    feedback.textContent = "Informe e-mail e senha para entrar.";
    feedback.className = "feedback error";
    return;
  }

  buscarUsuarios()
    .then((usuarios) => {
      const usuarioEncontrado = usuarios.find(
        (item) =>
          item.email === usuario.email && item.password === usuario.password
      );

      if (!usuarioEncontrado) {
        throw new Error("E-mail ou senha incorretos.");
      }

      feedback.textContent =
        "Login realizado com sucesso. Bem-vindo, " +
        usuarioEncontrado.name +
        ".";
      feedback.className = "feedback success";
      formularioLogin.reset();
      sessionStorage.setItem("NOME_USUARIO", usuarioEncontrado.name);
      setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
    })
    .catch((erro) => {
      console.error("Erro ao fazer login:", erro);
      feedback.textContent = erro.message || "Erro ao fazer login.";
      feedback.className = "feedback error";
    });
}

function voltarPagina() {
  const destino = botaoVoltar.dataset.target;

  if (destino && destino !== "history") {
    window.location.href = destino;
    return;
  }

  window.history.back();
}

if (formularioCadastro) {
  formularioCadastro.addEventListener("submit", function (event) {
    event.preventDefault();
    cadastrarUsuario();
  });
}

if (formularioLogin) {
  formularioLogin.addEventListener("submit", function (event) {
    event.preventDefault();
    logarUsuario();
  });
}

if (botaoVoltar) {
  botaoVoltar.addEventListener("click", voltarPagina);
}
