// Nouveau fichier pour gérer l'affichage de l'utilisateur connecté et la déconnexion
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
        user = null;
    }
    const navUl = document.querySelector("nav ul");
    if (!navUl) return;

    // Supprimer d'éventuels anciens éléments
    navUl.querySelector(".nav-user-info")?.remove();
    navUl.querySelector(".nav-logout")?.remove();

    // Sélecteurs pour login / register (différents chemins selon la page)
    const loginLi = navUl.querySelector('li a[href="/login.html"], li a[href="login.html"]')?.parentElement;
    const registerLi = navUl.querySelector('li a[href="/register.html"], li a[href="register.html"]')?.parentElement;

    if (token && user?.username) {
        // cacher login / register
        loginLi?.remove();
        registerLi?.remove();

        // lien vers la page Mes Favoris
        const favLi = document.createElement("li");
        favLi.className = "nav-fav";
        favLi.innerHTML = `<a href="/favorites.html"><i class="fas fa-heart"></i> Favoris</a>`;
        navUl.appendChild(favLi);

        // afficher le nom d'utilisateur
        const userLi = document.createElement("li");
        userLi.className = "nav-user-info";
        userLi.innerHTML = `<span><i class="fas fa-user-circle"></i> ${user.username}</span>`;
        navUl.appendChild(userLi);

        // bouton déconnexion
        const logoutLi = document.createElement("li");
        logoutLi.className = "nav-logout";
        logoutLi.innerHTML = `<button id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Se déconnecter</button>`;
        navUl.appendChild(logoutLi);
        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login.html";
        });
    }
}); 