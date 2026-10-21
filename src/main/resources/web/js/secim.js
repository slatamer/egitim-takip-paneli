// --- YAPILACAK İŞLEM İÇİN SEÇİM SAYFASI ---
document.addEventListener("DOMContentLoaded", function() {

    const btnGoToForm = document.getElementById("btnGoToForm");
    const btnGoToReport = document.getElementById("btnGoToReport");

    function getController() {
        return window.javaController || window.JavaController;
    }

    if (btnGoToForm) {
        btnGoToForm.addEventListener("click", function() {
            const controller = getController();
            if (controller && typeof controller.navigateTo === "function") {
                controller.navigateTo("training-entry.html");
            } else {
                window.location.href = "training-entry.html";
            }
        });
    }

    if (btnGoToReport) {
        btnGoToReport.addEventListener("click", function() {
            const controller = getController();
            if (controller && typeof controller.navigateTo === "function") {
                controller.navigateTo("employee-report.html");
            } else {
                window.location.href = "employee-report.html";
            }
        });
    }

});