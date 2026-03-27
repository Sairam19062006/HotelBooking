import { initBaseUI, showToast } from "./common.js";

const USERS_KEY = "hb-users";
const SESSION_KEY = "hb-auth-user";

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const setSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    signedInAt: new Date().toISOString()
  }));
};

const bindRegister = () => {
  const form = document.querySelector("[data-register-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "").trim();

    if (!name || !email || password.length < 8) {
      showToast("Please complete all required fields", "error");
      return;
    }

    const users = getUsers();
    const existing = users.find((item) => item.email === email);
    if (existing) {
      showToast("Account already exists. Please sign in.", "error");
      setTimeout(() => {
        window.location.href = "signin.html";
      }, 800);
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    saveUsers(users);
    setSession(user);
    showToast("Account created successfully");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  });
};

const bindSignIn = () => {
  const form = document.querySelector("[data-signin-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "").trim();

    const users = getUsers();
    const found = users.find((item) => item.email === email && item.password === password);

    if (!found) {
      showToast("Invalid email or password", "error");
      return;
    }

    setSession(found);
    showToast("Signed in successfully");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  });
};

const init = () => {
  initBaseUI();
  bindRegister();
  bindSignIn();
};

init();
