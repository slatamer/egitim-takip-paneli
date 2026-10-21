// --- KAYITLI VERİLERİN GÖRÜNTÜLENMESİ VE DEĞİŞİKLİĞİ İÇİN KULLANILAN SAYFA - İŞLEM KODLARI ---

document.addEventListener("DOMContentLoaded", function() {

    window.alert = function(message) {
        const overlay = document.createElement("div"); overlay.className = "custom-modal";
        const content = document.createElement("div"); content.className = "modal-content";
        const title = document.createElement("h4"); title.textContent = "Sistem Mesajı";
        const text = document.createElement("p"); text.style.fontSize = "14px"; text.style.color = "#4a5568"; text.style.lineHeight = "1.6";
        text.innerHTML = String(message).replace(/\n/g, "<br>");
        const btnContainer = document.createElement("div"); btnContainer.className = "modal-buttons";
        const btnOk = document.createElement("button"); btnOk.className = "btn-modal-save"; btnOk.textContent = "Tamam";
        btnOk.onclick = () => document.body.removeChild(overlay);
        btnContainer.appendChild(btnOk); content.append(title, text, btnContainer); overlay.appendChild(content); document.body.appendChild(overlay);
    };

    window.showConfirm = function(message, onConfirm) {
        const overlay = document.createElement("div"); overlay.className = "custom-modal";
        const content = document.createElement("div"); content.className = "modal-content";
        const title = document.createElement("h4"); title.textContent = "Onay Gerekiyor";
        const text = document.createElement("p"); text.style.fontSize = "14px"; text.style.color = "#4a5568"; text.style.lineHeight = "1.6";
        text.innerHTML = String(message).replace(/\n/g, "<br>");
        const btnContainer = document.createElement("div"); btnContainer.className = "modal-buttons";
        const btnYes = document.createElement("button"); btnYes.className = "btn-modal-save"; btnYes.textContent = "Evet";
        const btnNo = document.createElement("button"); btnNo.className = "btn-modal-cancel"; btnNo.textContent = "İptal";
        btnYes.onclick = () => { document.body.removeChild(overlay); if (onConfirm) onConfirm(); };
        btnNo.onclick = () => document.body.removeChild(overlay);
        btnContainer.append(btnYes, btnNo); content.append(title, text, btnContainer); overlay.appendChild(content); document.body.appendChild(overlay);
    };

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
    updateClock(); setInterval(updateClock, 1000);


    function loadRecords() {
        const tbody = document.getElementById("resultsBody");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #718096;">Veriler yükleniyor...</td></tr>`;

        const controller = window.javaController || window.JavaController;
        if (controller && typeof controller.getTumKayitlar === "function") {
            try {
                const dataStr = controller.getTumKayitlar();
                const records = JSON.parse(dataStr);
                tbody.innerHTML = "";

                if (records.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #718096;">Henüz bir eğitim kaydı bulunmuyor.</td></tr>`;
                    return;
                }

                records.forEach(rec => {
                    const tr = document.createElement("tr");
                    let egitimMetni = rec.egitim_turu;
                    if (rec.seviyeler && rec.seviyeler.trim() !== "") egitimMetni += ` (${rec.seviyeler})`;
                    let shopHatMetni = rec.shop_hat ? rec.shop_hat : "-";

                    tr.innerHTML = `
                        <td class="select-column d-none">
                            <input type="checkbox" class="record-checkbox" value="${rec.id}">
                        </td>
                        <td>${rec.sicil_no}</td>
                        <td>${rec.ad_soyad}</td>
                        <td>${rec.departman}</td>
                        <td>${egitimMetni}</td>
                        <td>${shopHatMetni}</td> 
                        <td>${rec.tarih}</td>
                    `;
                    tbody.appendChild(tr);
                });

            } catch (e) {
                console.error("Veriler parse edilirken hata oluştu:", e);
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Veriler okunurken bir sistem hatası oluştu!</td></tr>`;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #718096;">JavaController bağlantısı kurulamadı. (Uygulama JavaFX üzerinden çalıştırılmalı)</td></tr>`;
        }
    }
    setTimeout(loadRecords, 200);

    const btnEdit = document.getElementById("btnEdit");
    const btnDelete = document.getElementById("btnDelete");
    const btnImportExcel = document.getElementById("btnImportExcel");

    function toggleSelectionMode(isActive) {
        const currentSelectColumns = document.querySelectorAll(".select-column");
        currentSelectColumns.forEach(col => {
            if (isActive) {
                col.classList.remove("d-none");
            } else {
                col.classList.add("d-none");
                document.querySelectorAll(".record-checkbox").forEach(cb => cb.checked = false);
            }
        });
    }

    function getSelectedRecords() {
        const selected = [];
        document.querySelectorAll(".record-checkbox:checked").forEach(cb => {
            selected.push(cb.value);
        });
        return selected;
    }


    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            const arananKelime = this.value.toLowerCase().trim();
            const tbody = document.getElementById("resultsBody");

            if (!tbody) return;

            const satirlar = tbody.querySelectorAll("tr");

            satirlar.forEach(satir => {
                if (satir.cells.length === 1 && satir.cells[0].colSpan === 7) return;

                const satirMetni = satir.textContent.toLowerCase();

                if (satirMetni.includes(arananKelime)) {
                    satir.style.display = "";
                } else {
                    satir.style.display = "none";
                }
            });
        });
    }


    if (btnImportExcel) {
        btnImportExcel.addEventListener("click", function() {
            const controller = window.javaController || window.JavaController;
            if (controller && typeof controller.exceldenDByeSenkronizeEt === "function") {
                btnImportExcel.textContent = "Yükleniyor...";
                btnImportExcel.disabled = true;

                setTimeout(() => {
                    const basarili = controller.exceldenDByeSenkronizeEt();
                    if (basarili) {
                        alert("Excel dosyasındaki yeni veriler veritabanına başarıyla yüklendi!");
                        loadRecords(); // Tabloyu anında güncelle
                    } else {
                        alert("Veri aktarımı başarısız! Lütfen Excel dosyasının varlığından ve kapalı olduğundan emin olun.");
                    }
                    btnImportExcel.textContent = " Excel'den Yükle ";
                    btnImportExcel.disabled = false;
                }, 150);
            } else {
                alert("JavaController bağlantısı kurulamadı!");
            }
        });
    }


    if (btnEdit) {
        btnEdit.addEventListener("click", function() {
            const baslikSutunu = document.querySelector(".select-column");
            const isHidden = baslikSutunu ? baslikSutunu.classList.contains("d-none") : true;

            if (isHidden) {
                toggleSelectionMode(true);
                alert("Lütfen düzenlemek istediğiniz kaydı tablodan seçip tekrar 'Düzenle' butonuna basınız.");
            } else {
                const secilenler = getSelectedRecords();

                if (secilenler.length === 0) {
                    alert("Lütfen düzenlemek için bir kayıt seçin!");
                    return;
                }
                if (secilenler.length > 1) {
                    alert("Aynı anda sadece BİR kayıt düzenlenebilir!");
                    return;
                }

                localStorage.setItem("editRecordId", secilenler[0]);
                const controller = window.javaController || window.JavaController;
                if (controller && typeof controller.navigateTo === "function") {
                    controller.navigateTo("edit.html");
                } else {
                    window.location.href = "edit.html";
                }
                toggleSelectionMode(false);
            }
        });
    }


    if (btnDelete) {
        btnDelete.addEventListener("click", function() {
            const baslikSutunu = document.querySelector(".select-column");
            const isHidden = baslikSutunu ? baslikSutunu.classList.contains("d-none") : true;

            if (isHidden) {
                toggleSelectionMode(true);
                alert("Lütfen silmek istediğiniz kayıtları tablodan seçip tekrar 'Sil' butonuna basınız.");
            } else {
                const secilenler = getSelectedRecords();

                if (secilenler.length === 0) {
                    alert("Lütfen silmek için en az bir kayıt seçin!");
                    return;
                }

                showConfirm(secilenler.length + " adet kaydı kalıcı olarak silmek istediğinize emin misiniz?", function() {
                    const controller = window.javaController || window.JavaController;

                    if (controller && typeof controller.kayitlariSil === "function") {
                        const idListesiStr = secilenler.join(",");
                        const basarili = controller.kayitlariSil(idListesiStr);

                        if(basarili) {
                            alert("Kayıt(lar) başarıyla silindi!");
                            loadRecords();
                        } else {
                            alert("Silme işlemi sırasında bir hata oluştu!");
                        }
                    } else {
                        alert("Tarayıcı modu: Silindi varsayıldı.");
                    }
                    toggleSelectionMode(false);
                });
            }
        });
    }

    const btnReport = document.getElementById("btnReport");
    if(btnReport){
        btnReport.addEventListener("click",function(){
            const controller = window.javaController || window.JavaController;
            if (controller && typeof controller.navigateTo === "function") {
                controller.navigateTo("employee-report.html");
            } else {
                window.location.href = "employee-report.html";
            }
        });
    }

    const btnBack = document.getElementById("btnBack");
    if (btnBack) {
        btnBack.addEventListener("click", function() {
            const controller = window.javaController || window.JavaController;
            if (controller && typeof controller.navigateTo === "function") {
                controller.navigateTo("training-entry.html");
            } else {
                window.location.href = "training-entry.html";
            }
        });
    }
});