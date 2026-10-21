//--- EĞİTİM/YENİ KAYIT BİLGİ GİRİŞ SAYFASI - İŞLEM KODLARI ---

document.addEventListener("DOMContentLoaded", function() {

    window.alert = function(message) {
        const overlay = document.createElement("div");
        overlay.className = "custom-modal";

        const content = document.createElement("div");
        content.className = "modal-content";

        const title = document.createElement("h4");
        title.textContent = "Sistem Mesajı";

        const text = document.createElement("p");
        text.style.fontSize = "14px";
        text.style.color = "#4a5568";
        text.style.lineHeight = "1.6";
        text.innerHTML = String(message).replace(/\n/g, "<br>");

        const btnContainer = document.createElement("div");
        btnContainer.className = "modal-buttons";

        const btnOk = document.createElement("button");
        btnOk.className = "btn-modal-save";
        btnOk.textContent = "Tamam";
        btnOk.onclick = () => document.body.removeChild(overlay);

        btnContainer.appendChild(btnOk);
        content.append(title, text, btnContainer);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    };

    window.showConfirm = function(message, onConfirm) {
        const overlay = document.createElement("div");
        overlay.className = "custom-modal";

        const content = document.createElement("div");
        content.className = "modal-content";

        const title = document.createElement("h4");
        title.textContent = "Onay Gerekiyor";

        const text = document.createElement("p");
        text.style.fontSize = "14px";
        text.style.color = "#4a5568";
        text.style.lineHeight = "1.6";
        text.innerHTML = String(message).replace(/\n/g, "<br>");

        const btnContainer = document.createElement("div");
        btnContainer.className = "modal-buttons";

        const btnYes = document.createElement("button");
        btnYes.className = "btn-modal-save";
        btnYes.textContent = "Evet";

        const btnNo = document.createElement("button");
        btnNo.className = "btn-modal-cancel";
        btnNo.textContent = "İptal";

        btnYes.onclick = () => {
            document.body.removeChild(overlay);
            if (onConfirm) onConfirm();
        };

        btnNo.onclick = () => document.body.removeChild(overlay);

        btnContainer.append(btnYes, btnNo);
        content.append(title, text, btnContainer);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    };

    // --- 1. DOM ELEMANI TANIMLAMALARI ---
    const liveClockEl = document.getElementById("liveClock");
    const btnRegistrationList = document.getElementById("btnRegistrationList");
    const btnReport = document.getElementById("btnReport");

    const egitmenSelect = document.getElementById("egitmen");
    const btnAdd = document.getElementById("addEgitmenBtn");
    const btnDelete = document.getElementById("removeEgitmenBtn");
    const modalAddInstructor = document.getElementById("modalAddInstructor");
    const newInstructorNameInput = document.getElementById("newInstructorName");
    const btnSaveInstructor = document.getElementById("btnSaveInstructor");
    const btnCloseAddModal = document.getElementById("btnCloseAddModal");

    const egitimTuruSelect = document.getElementById("egitimTuru");
    const btnAddTrainingType = document.getElementById("addEgitimTuruBtn");
    const btnDeleteTrainingType = document.getElementById("removeEgitimTuruBtn");
    const modalAddTrainingType = document.getElementById("modalAddTrainingType");
    const newTrainingTypeNameInput = document.getElementById("newTrainingTypeName");
    const btnSaveTrainingType = document.getElementById("btnSaveTrainingType");
    const btnCloseAddTrainingModal = document.getElementById("btnCloseAddTrainingModal");

    const personelForm = document.getElementById("personelForm");
    const personelSicNoInput = document.getElementById("personelSicilNo");
    const personelAdInput = document.getElementById("personelAd");
    const personelSoyadInput = document.getElementById("personelSoyad");
    const departmanSelect = document.getElementById("personelDepartman");
    const unvanSelect = document.getElementById("personelUnvan");
    const egitimTarInput = document.getElementById("egitimTar");
    const egitimCommentInput = document.getElementById("egitimComment");

    const seviyeKonteyner = document.getElementById("seviyeKonteyner");
    const levelBaslangic = document.getElementById("levelBaslangic");
    const levelOrta = document.getElementById("levelOrta");
    const levelIleri = document.getElementById("levelIleri");
    const levelIleriIn = document.getElementById("levelIleriIn");
    const ileriInputKonteyner = document.getElementById("ileriInputKonteyner");

    const btnSave = document.getElementById("btnSave");
    const btnCancel = document.getElementById("btnCancel");

    const defaultTrainingTypes = ["Eğitim-B", "Eğitim-A", "Ana Eğitim"];


    // --- 2. JAVAFX WEBVIEW UYUMLU DAHİLİ TAKVİM MEKANİZMASI ---
    const customCalendarPicker = document.getElementById("customCalendarPicker");
    const calMonthYearTitle = document.getElementById("calMonthYearTitle");
    const calDaysGrid = document.getElementById("calDaysGrid");
    const calPrevBtn = document.getElementById("calPrevBtn");
    const calNextBtn = document.getElementById("calNextBtn");

    let currentDate = new Date();
    let selectedDateStr = "";

    const monthsTr = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    function renderCalendar() {
        if (!calDaysGrid || !calMonthYearTitle) return;

        calDaysGrid.innerHTML = "";
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        calMonthYearTitle.textContent = `${monthsTr[month]} ${year}`;

        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
        // -- Takvimin Pazartesi'den başlaması ve ayın 1'inin doğru güne denk gelmesi için

        const lastDate = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "cal-day-cell empty";
            calDaysGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayCell = document.createElement("div");
            dayCell.className = "cal-day-cell";
            dayCell.textContent = day;

            const formattedDay = String(day).padStart(2, '0');
            const formattedMonth = String(month + 1).padStart(2, '0');
            const dateVal = `${formattedDay}.${formattedMonth}.${year}`;

            if (dateVal === selectedDateStr) {
                dayCell.classList.add("selected");
            }

            dayCell.addEventListener("click", function(e) {
                e.stopPropagation();
                selectedDateStr = dateVal;
                egitimTarInput.value = dateVal;
                customCalendarPicker.style.display = "none";
            });

            calDaysGrid.appendChild(dayCell);
        }
    }

    if (egitimTarInput && customCalendarPicker) {
        egitimTarInput.addEventListener("click", function(e) {
            e.stopPropagation();
            renderCalendar();
            customCalendarPicker.style.display = customCalendarPicker.style.display === "none" ? "block" : "none";
        });

        if (calPrevBtn) {
            calPrevBtn.addEventListener("click", function(e) {
                e.stopPropagation();
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });
        }

        if (calNextBtn) {
            calNextBtn.addEventListener("click", function(e) {
                e.stopPropagation();
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });
        }

        document.addEventListener("click", function(e) {
            if (!customCalendarPicker.contains(e.target) && e.target !== egitimTarInput) {
                customCalendarPicker.style.display = "none";
            }
        });
    }

    // --- 3. ROL KONTROLÜ VE YETKİLENDİRME ---
    function checkUserRolePermissions() {
        let aktifRol = "EGITIM_ALAN";
        const controller = window.javaController || window.JavaController;

        if (controller && typeof controller.getAktifRol === "function") {
            try {
                aktifRol = controller.getAktifRol();
            } catch (e) {
                console.error("Rol okunurken hata oluştu:", e);
            }
        }

        const adminElements = document.querySelectorAll(".role-admin-only");
        const isAuthorized = aktifRol && (aktifRol.toUpperCase() === "YETKILI" || aktifRol.toUpperCase() === "YETKİLİ");

        adminElements.forEach(el => {
            el.style.display = isAuthorized ? "flex" : "none";
        });
    }

    checkUserRolePermissions();
    setTimeout(checkUserRolePermissions, 100);
    setTimeout(checkUserRolePermissions, 300);

    // --- 4. CANLI SAAT GÜNCELLEME ---
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

    // --- 5. YARDIMCI VE YÖNLENDİRME FONKSİYONLARI ---
    function addOptionToSelect(selectElement, textValue) {
        if (!selectElement) return;
        const option = document.createElement("option");
        option.value = textValue;
        option.textContent = textValue;
        selectElement.appendChild(option);
    }

    function navigateToPage(targetPage) {
        const controller = window.javaController || window.JavaController;
        if (controller && typeof controller.navigateTo === "function") {
            controller.navigateTo(targetPage);
        } else if (controller && typeof controller.sayfaDegistir === "function") {
            controller.sayfaDegistir(targetPage);
        } else {
            window.location.href = targetPage;
        }
    }

    if (btnRegistrationList) {
        btnRegistrationList.addEventListener("click", () => navigateToPage("record.html"));
    }
    if (btnReport) {
        btnReport.addEventListener("click", () => navigateToPage("employee-report.html"));
    }

    // --- 6. ANA EĞİTİM VE SEVİYE ALANI GÖSTERİM DİNAMİĞİ ---
    function toggleSeviyeKonteyner() {
        if (!egitimTuruSelect || !seviyeKonteyner) return;

        const selectedVal = egitimTuruSelect.value ? egitimTuruSelect.value.trim() : "";
        // toUpperCase() kullanmıyoruz, doğrudan seçili metni kontrol ediyoruz:
        if (selectedVal === "Ana Eğitim") {
            seviyeKonteyner.style.display = "flex";
        } else {
            seviyeKonteyner.style.display = "none";
            if (levelBaslangic) levelBaslangic.checked = false;
            if (levelOrta) levelOrta.checked = false;
            if (levelIleri) levelIleri.checked = false;

            if (ileriInputKonteyner) ileriInputKonteyner.style.display = "none";
            if (levelIleriIn) levelIleriIn.value = "";
        }
    }

    if (levelIleri) {
        levelIleri.addEventListener("change", function() {
            if (ileriInputKonteyner) {
                if (this.checked) {
                    ileriInputKonteyner.style.display = "inline-block";
                    levelIleriIn.focus();
                } else {
                    ileriInputKonteyner.style.display = "none";
                    levelIleriIn.value = "";
                }
            }
        });
    }

    if (egitimTuruSelect) {
        egitimTuruSelect.addEventListener("change", toggleSeviyeKonteyner);
    }

    // --- 7. EĞİTMEN YÖNETİMİ İŞLEMLERİ ---
    function loadInstructors() {
        if (!egitmenSelect) return;

        egitmenSelect.innerHTML = '<option value="" disabled selected>Eğitmen Seçiniz...</option>';

        let instructors = JSON.parse(localStorage.getItem("instructors")) || [];
        instructors.forEach(name => addOptionToSelect(egitmenSelect, name));
    }

    function saveInstructorToStorage(name) {
        let instructors = JSON.parse(localStorage.getItem("instructors")) || [];
        if (!instructors.includes(name)) {
            instructors.push(name);
            localStorage.setItem("instructors", JSON.stringify(instructors));
        }
    }

    function removeInstructorFromStorage(name) {
        let instructors = JSON.parse(localStorage.getItem("instructors")) || [];
        instructors = instructors.filter(inst => inst !== name);
        localStorage.setItem("instructors", JSON.stringify(instructors));
    }

    function handleAddInstructor() {
        const newInstructor = newInstructorNameInput.value.trim();
        if (newInstructor === "") {
            alert("Lütfen eğitmen adı giriniz!");
            return;
        }

        const exists = Array.from(egitmenSelect.options).some(
            opt => opt.value.toLowerCase() === newInstructor.toLowerCase()
        );

        if (exists) {
            alert("Bu eğitmen zaten listede mevcut!");
            return;
        }

        addOptionToSelect(egitmenSelect, newInstructor);
        saveInstructorToStorage(newInstructor);
        egitmenSelect.value = newInstructor;
        modalAddInstructor.style.display = "none";
    }

    if (egitmenSelect) loadInstructors();

    if (btnAdd) {
        btnAdd.addEventListener("click", function() {
            if (modalAddInstructor) {
                newInstructorNameInput.value = "";
                modalAddInstructor.style.display = "flex";
                newInstructorNameInput.focus();
            }
        });
    }

    if (btnCloseAddModal) {
        btnCloseAddModal.addEventListener("click", () => modalAddInstructor.style.display = "none");
    }

    if (btnSaveInstructor) btnSaveInstructor.addEventListener("click", handleAddInstructor);

    if (newInstructorNameInput) {
        newInstructorNameInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddInstructor();
            }
        });
    }

    if (btnDelete) {
        btnDelete.addEventListener("click", function() {
            const selectedIndex = egitmenSelect.selectedIndex;
            const selectedOption = egitmenSelect.options[selectedIndex];

            if (!selectedOption || !selectedOption.value) {
                alert("Lütfen silmek istediğiniz eğitmeni seçiniz!");
                return;
            }

            const selectedValue = selectedOption.value;

            showConfirm(`"${selectedValue}" isimli eğitmeni silmek istediğinize emin misiniz?`, function() {
                removeInstructorFromStorage(selectedValue);
                loadInstructors();
            });
        });
    }

    // --- 8. EĞİTİM TÜRÜ YÖNETİMİ İŞLEMLERİ ---
    function loadTrainingTypes() {
        if (!egitimTuruSelect) return;

        egitimTuruSelect.innerHTML = '<option value="" disabled selected>Eğitim Seçiniz...</option>';

        let trainingTypes = JSON.parse(localStorage.getItem("trainingTypes"));
        if (!trainingTypes) {
            trainingTypes = defaultTrainingTypes;
            localStorage.setItem("trainingTypes", JSON.stringify(trainingTypes));
        }

        trainingTypes.forEach(name => addOptionToSelect(egitimTuruSelect, name));
    }

    function saveTrainingTypeToStorage(name) {
        let trainingTypes = JSON.parse(localStorage.getItem("trainingTypes")) || defaultTrainingTypes;
        if (!trainingTypes.includes(name)) {
            trainingTypes.push(name);
            localStorage.setItem("trainingTypes", JSON.stringify(trainingTypes));
        }
    }

    function removeTrainingTypeFromStorage(name) {
        let trainingTypes = JSON.parse(localStorage.getItem("trainingTypes")) || defaultTrainingTypes;
        trainingTypes = trainingTypes.filter(type => type !== name);
        localStorage.setItem("trainingTypes", JSON.stringify(trainingTypes));
    }

    function handleAddTrainingType() {
        const newType = newTrainingTypeNameInput.value.trim();
        if (newType === "") {
            alert("Lütfen eğitim türü adı giriniz!");
            return;
        }

        const exists = Array.from(egitimTuruSelect.options).some(
            opt => opt.value.toLowerCase() === newType.toLowerCase()
        );

        if (exists) {
            alert("Bu eğitim türü zaten listede mevcut!");
            return;
        }

        addOptionToSelect(egitimTuruSelect, newType);
        saveTrainingTypeToStorage(newType);
        egitimTuruSelect.value = newType;
        toggleSeviyeKonteyner();
        modalAddTrainingType.style.display = "none";
    }

    if (egitimTuruSelect) loadTrainingTypes();

    if (btnAddTrainingType) {
        btnAddTrainingType.addEventListener("click", function() {
            if (modalAddTrainingType) {
                newTrainingTypeNameInput.value = "";
                modalAddTrainingType.style.display = "flex";
                newTrainingTypeNameInput.focus();
            }
        });
    }

    if (btnCloseAddTrainingModal) {
        btnCloseAddTrainingModal.addEventListener("click", () => modalAddTrainingType.style.display = "none");
    }

    if (btnSaveTrainingType) btnSaveTrainingType.addEventListener("click", handleAddTrainingType);

    if (newTrainingTypeNameInput) {
        newTrainingTypeNameInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddTrainingType();
            }
        });
    }

    if (btnDeleteTrainingType) {
        btnDeleteTrainingType.addEventListener("click", function() {
            const selectedIndex = egitimTuruSelect.selectedIndex;
            const selectedOption = egitimTuruSelect.options[selectedIndex];

            if (!selectedOption || !selectedOption.value) {
                alert("Lütfen silmek istediğiniz eğitim türünü seçiniz!");
                return;
            }

            const selectedValue = selectedOption.value;

            showConfirm(`"${selectedValue}" isimli eğitim türünü silmek istediğinize emin misiniz?`, function() {
                removeTrainingTypeFromStorage(selectedValue);
                loadTrainingTypes();
                toggleSeviyeKonteyner();
            });
        });
    }

    // --- 9. INPUT KISITLAMALARI VE FORM TEMİZLEME ---
    if (personelSicNoInput) {
        personelSicNoInput.setAttribute("maxlength", "20");

        personelSicNoInput.addEventListener("input", function(e) {
            let val = e.target.value;
            if (val.length === 0) return;

            const ilkKarakterRakamMi = /^\d/.test(val);
            if (ilkKarakterRakamMi) {
                val = val.replace(/\D/g, "").substring(0, 5);
            } else {
                val = val.substring(0, 20);
            }
            e.target.value = val;
        });
    }

    function clearForm() {
        if (personelForm) personelForm.reset();

        if (egitmenSelect) egitmenSelect.selectedIndex = 0;
        if (egitimTuruSelect) egitimTuruSelect.selectedIndex = 0;

        if (egitimTarInput) egitimTarInput.value = "";
        selectedDateStr = "";

        if (levelBaslangic) levelBaslangic.checked = false;
        if (levelOrta) levelOrta.checked = false;
        if (levelIleri) levelIleri.checked = false;

        if (levelIleriIn) levelIleriIn.value = "";
        if (ileriInputKonteyner) ileriInputKonteyner.style.display = "none";

        if (egitimCommentInput) egitimCommentInput.value = "";

        toggleSeviyeKonteyner();
    }

    toggleSeviyeKonteyner();

    // --- 10. BOŞ BIRAKILAMAZ ALAN KONTROLLERİ VE KAYDETME ---
    if (btnSave) {
        btnSave.addEventListener("click", function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            try {
                const getVal = (id) => {
                    const el = document.getElementById(id);
                    return el && el.value ? el.value.trim() : "";
                };

                const egitmen = getVal("egitmen");
                const sicilNo = getVal("personelSicilNo");
                const ad = getVal("personelAd");
                const soyad = getVal("personelSoyad");
                const departman = getVal("personelDepartman");
                const unvan = getVal("personelUnvan");
                const egitimTuru = getVal("egitimTuru");
                const tarih = getVal("egitimTar");
                const yorum = getVal("egitimComment");
                const ileriShopHat = getVal("levelIleriIn");

                let bosAlanlar = [];

                if (!egitmen || egitmen === "Eğitmen Seçiniz...") bosAlanlar.push("Eğitimi Veren Yetkili");
                if (!sicilNo) bosAlanlar.push("Sicil No");
                if (!ad) bosAlanlar.push("Adı");
                if (!soyad) bosAlanlar.push("Soyadı");
                if (!tarih) bosAlanlar.push("Eğitim Tarihi");
                if (!egitimTuru || egitimTuru === "Eğitim Seçiniz...") bosAlanlar.push("Eğitim Türü");

                if (bosAlanlar.length > 0) {
                    alert("Lütfen aşağıdaki zorunlu alanları doldurunuz:\n\n• " + bosAlanlar.join("\n• "));
                    return;
                }

                const isBaslangic = document.getElementById("levelBaslangic") ? document.getElementById("levelBaslangic").checked : false;
                const isOrta = document.getElementById("levelOrta") ? document.getElementById("levelOrta").checked : false;
                const isIleri = document.getElementById("levelIleri") ? document.getElementById("levelIleri").checked : false;

                if (egitimTuru === "Ana Eğitim" && !isBaslangic && !isOrta && !isIleri) {
                    alert("Ana eğitim için lütfen en az bir eğitim seviyesi (Başlangıç, Orta, İleri) seçiniz!");
                    return;
                }

                if (isIleri && !ileriShopHat) {
                    alert("Lütfen İleri seviye eğitimi için 'Shop / Hat' bilgisini giriniz!");
                    return;
                }

                const controller = window.javaController || window.JavaController;

                if (controller) {
                    const basarili = controller.egitimKaydet(
                        egitmen, sicilNo, ad, soyad, departman, unvan, egitimTuru,
                        isBaslangic, isOrta, isIleri, ileriShopHat, tarih, yorum
                    );

                    if (basarili) {
                        alert("Kayıt başarılı!");
                        clearForm();
                    } else {
                        alert("Kayıt sırasında bir hata oluştu! Lütfen Excel dosyasının açık olup olmadığını kontrol ediniz.");
                    }
                } else {
                    alert("Kayıt başarılı (Test / Tarayıcı Modu)");
                    clearForm();
                }

            } catch (err) {
                console.error("Kaydetme sırasında JavaScript hatası:", err);
                alert("Kaydetme işlemi sırasında bir sistem hatası oluştu: " + err.message);
            }
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener("click", clearForm);
    }

    const btnBack = document.getElementById("btnBack");
    if (btnBack) {
        btnBack.addEventListener("click", function() {
            const controller = window.javaController || window.JavaController;
            if (controller && typeof controller.navigateTo === "function") {
                controller.navigateTo("secim.html");
            } else {
                window.location.href = "secim.html";
            }
        });
    }

    // --- EXCEL EŞİTLEME BUTONU (DB -> EXCEL) MANTIĞI ---
    const EXCEL_ESITLEME_AKTIF = true;
    const btnSyncExcel = document.getElementById("btnSyncExcel");

    if (btnSyncExcel) {
        if (!EXCEL_ESITLEME_AKTIF) {
            btnSyncExcel.style.display = "none";
        } else {
            btnSyncExcel.addEventListener("click", function() {
                const controller = window.javaController || window.JavaController;
                if (controller && typeof controller.manuelExcelSenkronizasyonu === "function") {

                    btnSyncExcel.textContent = "Eşitleniyor...";
                    btnSyncExcel.disabled = true;

                    setTimeout(() => {
                        const result = controller.manuelExcelSenkronizasyonu();
                        if (result) {
                            alert("Excel dosyası, veritabanındaki güncel verilerle başarıyla eşitlendi!");
                        } else {
                            alert("Eşitleme başarısız! Lütfen Excel dosyasının kapalı olduğundan emin olun ve tekrar deneyin.");
                        }

                        btnSyncExcel.textContent = "Excel'i Şimdi Eşitle";
                        btnSyncExcel.disabled = false;
                    }, 150);
                } else {
                    console.warn("JavaController bağlantısı kurulamadı.");
                }
            });
        }
    }
});