// --- DÜZENLEME SAYFASI EXCEL EŞİTLEME BUTONU (DB -> EXCEL) MANTIĞI ---

document.addEventListener("DOMContentLoaded", function() {

    const liveClockEl = document.getElementById("liveClock");
    function updateClock() {
        if (!liveClockEl) return;
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        liveClockEl.textContent = `${day}.${month}.${year} - ${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    const btnBack = document.getElementById("btnBack");
    if (btnBack) {
        btnBack.addEventListener("click", function() {
            const controller = window.javaController || window.JavaController;
            if (controller && typeof controller.navigateTo === "function") {
                controller.navigateTo("record.html");
            } else {
                window.location.href = "record.html";
            }
        });
    }

    const btnSyncExcelEdit = document.getElementById("btnSyncExcel");
    if (btnSyncExcelEdit) {
        btnSyncExcelEdit.addEventListener("click", function() {
            const controller = window.javaController || window.JavaController;
            if (controller && typeof controller.manuelExcelSenkronizasyonu === "function") {
                btnSyncExcelEdit.textContent = "Eşitleniyor...";
                btnSyncExcelEdit.disabled = true;

                setTimeout(() => {
                    const result = controller.manuelExcelSenkronizasyonu();
                    if (result) {
                        alert("Excel dosyası, veritabanındaki güncel verilerle başarıyla eşitlendi!");
                    } else {
                        alert("Eşitleme başarısız! Lütfen Excel dosyasının kapalı olduğundan emin olun ve tekrar deneyin.");
                    }
                    btnSyncExcelEdit.textContent = "Excel'i Senkronize Et";
                    btnSyncExcelEdit.disabled = false;
                }, 150);
            } else {
                alert("JavaController bağlantısı kurulamadı.");
            }
        });
    }

});