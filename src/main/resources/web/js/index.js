// --- YENİ KAYIT/GİRİŞ SAYFASI - İŞLEM KODLARI ---

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const changePasswordForm = document.getElementById("changePasswordForm");

    const showRegister = document.getElementById("showRegister");
    const showChangePassword = document.getElementById("showChangePassword");
    const showLoginFromRegister = document.getElementById("showLoginFromRegister");
    const showLoginFromPass = document.getElementById("showLoginFromPass");

    const loginToggleText = document.getElementById("loginToggleText");
    const registerToggleText = document.getElementById("registerToggleText");
    const changePassToggleText = document.getElementById("changePassToggleText");

    const errorMessage = document.getElementById("errorMessage");

    function clearForms() {
        if (errorMessage) {
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
            errorMessage.classList.remove("success");
        }
    }

    if (showRegister) {
        showRegister.addEventListener("click", function (e) {
            e.preventDefault();
            clearForms();
            loginForm.classList.add("hidden");
            loginToggleText.classList.add("hidden");
            changePasswordForm.classList.add("hidden");
            changePassToggleText.classList.add("hidden");

            registerForm.classList.remove("hidden");
            registerToggleText.classList.remove("hidden");
        });
    }

    if (showChangePassword) {
        showChangePassword.addEventListener("click", function (e) {
            e.preventDefault();
            clearForms();
            loginForm.classList.add("hidden");
            loginToggleText.classList.add("hidden");
            registerForm.classList.add("hidden");
            registerToggleText.classList.add("hidden");

            changePasswordForm.classList.remove("hidden");
            changePassToggleText.classList.remove("hidden");
        });
    }

    function showLoginForm(e) {
        if(e) e.preventDefault();
        clearForms();
        registerForm.classList.add("hidden");
        registerToggleText.classList.add("hidden");
        changePasswordForm.classList.add("hidden");
        changePassToggleText.classList.add("hidden");

        loginForm.classList.remove("hidden");
        loginToggleText.classList.remove("hidden");
    }

    if (showLoginFromRegister) showLoginFromRegister.addEventListener("click", showLoginForm);
    if (showLoginFromPass) showLoginFromPass.addEventListener("click", showLoginForm);

    // --- GİRİŞ YAP ---
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const sicNo = document.getElementById("sicNo").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!sicNo || !password) {
                showError("Lütfen tüm alanları doldurunuz!");
                return;
            }

            if (typeof window.JavaController !== "undefined" && typeof window.JavaController.login === "function") {
                const basarili = window.JavaController.login(sicNo, password);
                if (basarili) {
                    showSuccess("Giriş başarılı...");
                    setTimeout(function () {
                        window.JavaController.navigateTo("secim.html");
                    }, 1000);
                } else {
                    showError("Sicil No veya Şifre hatalı!");
                }
            } else {
                console.warn("Browser test modunda yönlendiriliyor...");
                showSuccess("Giriş başarılı...");
                setTimeout(function () {
                    window.location.href = "secim.html";
                }, 1000);
            }
        });
    }

    // --- KAYIT OL ---
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const ad = document.getElementById("newPerName").value.trim();
            const soyad = document.getElementById("newPerSurname").value.trim();
            const sicNo = document.getElementById("newPerNo").value.trim();
            const password = document.getElementById("newPerPassword").value.trim();
            const passwordConfirm = document.getElementById("newPerPasswordConfirm").value.trim();

            if (!ad || !soyad || !sicNo || !password || !passwordConfirm) {
                showError("Lütfen tüm alanları doldurunuz!");
                return;
            }

            if (password !== passwordConfirm) {
                showError("Şifreler birbiriyle uyuşmuyor!");
                return;
            }

            if (typeof window.JavaController !== "undefined" && typeof window.JavaController.register === "function") {
                const basarili = window.JavaController.register(ad, soyad, sicNo, password);
                if (basarili) {
                    showSuccess("İşlem başarılı...");
                    setTimeout(function () {
                        showLoginForm();
                    }, 1000);
                } else {
                    showError("Kayıt oluşturulamadı. Bu Sicil No zaten kayıtlı olabilir!");
                }
            } else {
                showSuccess("İşlem başarılı...");
                setTimeout(function () {
                    showLoginForm();
                }, 1000);
            }
        });
    }

    // --- ŞİFRE DEĞİŞTİR ---
    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const sicNo = document.getElementById("changeSicNo").value.trim();
            const oldPassword = document.getElementById("oldPassword").value.trim();
            const newPassword = document.getElementById("newPassword").value.trim();

            if (!sicNo || !oldPassword || !newPassword) {
                showError("Lütfen tüm alanları doldurunuz!");
                return;
            }

            if (oldPassword === newPassword) {
                showError("Yeni şifre mevcut şifre ile aynı olamaz!");
                return;
            }

            if (typeof window.JavaController !== "undefined" && typeof window.JavaController.changePassword === "function") {
                const basarili = window.JavaController.changePassword(sicNo, oldPassword, newPassword);
                if (basarili) {
                    showSuccess("İşlem başarılı...");
                    setTimeout(function () {
                        showLoginForm();
                    }, 1000);
                } else {
                    showError("Şifre değiştirilemedi! Sicil No veya mevcut şifre hatalı.");
                }
            } else {
                showSuccess("İşlem başarılı...");
                setTimeout(function () {
                    showLoginForm();
                }, 1000);
            }
        });
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove("success");
            errorMessage.style.display = "block";
        } else {
            alert(message);
        }
    }

    function showSuccess(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add("success");
            errorMessage.style.display = "block";
        } else {
            alert(message);
        }
    }
});