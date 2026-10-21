// --- RAPOR/ANALİZ SAYFASI - İŞLEM KODLARI ---

document.addEventListener("DOMContentLoaded", function() {

    if (typeof ChartDataLabels !== 'undefined') {
        Chart.register(ChartDataLabels);
    }

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
                controller.navigateTo("secim.html");
            } else {
                window.location.href = "secim.html";
            }
        });
    }

    let allRecords = [];
    let staticChartInstances = {};
    let filteredChartInstances = {};

    const colBaslangic = 'rgba(23, 96, 142, 0.85)';
    const colOrta = 'rgba(237, 125, 49, 0.85)';
    const colIleri = 'rgba(56, 124, 68, 0.85)';

    const colorPalette = [
        'rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        'rgba(201, 203, 207, 0.8)', 'rgba(255, 99, 71, 0.8)'
    ];

    const targetShops = [
        { name: 'Dep1', id: 'chartDep1' }, { name: 'Dep2', id: 'chartDep2' },
        { name: 'Dep3', id: 'chartDep3' }, { name: 'Dep4', id: 'chartDep4' },
        { name: 'Dep5', id: 'chartDep5' }, { name: 'Dep6', id: 'chartDep6' },
        { name: 'Dep7', id: 'chartDep7' }, { name: 'Dep8', id: 'chartDep8' },
        { name: 'Dep9', id: 'chartDep9' }, { name: 'Dep10', id: 'chartDep10' },
        { name: 'Dep11', id: 'chartDep11' }, { name: 'Dep12', id: 'chartDep12' },
        { name: 'Dep13', id: 'chartDep13' }, { name: 'Dep14', id: 'chartDep14' }
    ];

    function loadData() {
        const controller = window.javaController || window.JavaController;
        if (controller && typeof controller.getTumKayitlar === "function") {
            try {
                const dataStr = controller.getTumKayitlar();
                allRecords = JSON.parse(dataStr);
                initFilters();
                drawStaticCharts(allRecords);
                applyFilters();
            } catch(e) {
                console.error("Veriler parse edilirken hata:", e);
            }
        } else {
            console.warn("JavaController bulunamadı.");
        }
    }

    function initFilters() {
        const years = new Set();
        const depts = new Set();
        const types = new Set();

        allRecords.forEach(r => {
            if (r.tarih) {
                const parts = r.tarih.replace(/\//g, '.').split('.');
                if (parts.length === 3) {
                    let y = parts[2].trim();
                    if (y.length === 2) y = "20" + y;
                    if (y) years.add(y);
                }
            }
            if (r.departman) depts.add(r.departman.trim());
            if (r.egitim_turu) types.add(r.egitim_turu.trim());
        });

        const populateSelect = (id, dataSet) => {
            const select = document.getElementById(id);
            select.innerHTML = '<option value="ALL">Tümü</option>';
            // Alfabetik yerine sayısal (natural) sıralama yapıyoruz:
            [...dataSet].sort((a, b) => a.localeCompare(b, undefined, {numeric: true})).forEach(item => {
                const opt = document.createElement("option");
                opt.value = item;
                opt.text = item;
                select.appendChild(opt);
            });
        };

        populateSelect("filterYear", years);
        populateSelect("filterDept", depts);
        populateSelect("filterType", types);
    }

    function applyFilters() {
        const y = document.getElementById("filterYear").value;
        const d = document.getElementById("filterDept").value;
        const t = document.getElementById("filterType").value;

        const filterContainer = document.getElementById("filteredResultsContainer");
        const shopContainer = document.getElementById("shopChartsContainer");

        if (y === "ALL" && d === "ALL" && t === "ALL") {
            if (filterContainer) filterContainer.style.display = "none";
            if (shopContainer) shopContainer.style.display = "block";
            return;
        }

        if (shopContainer) shopContainer.style.display = "none";

        const filteredData = allRecords.filter(r => {
            let match = true;
            if (y !== "ALL") {
                const year = r.tarih ? r.tarih.split('.')[2].trim() : "";
                if (year !== y) match = false;
            }
            if (d !== "ALL" && (r.departman || "").trim() !== d) match = false;
            if (t !== "ALL" && (r.egitim_turu || "").trim() !== t) match = false;
            return match;
        });

        drawFilteredCharts(filteredData, y, d, t);
    }

    // --- OLAY TABANLI DİNAMİK TETİKLEME (Change Event Dinleyicileri) ---
    document.getElementById("filterYear").addEventListener("change", applyFilters);
    document.getElementById("filterDept").addEventListener("change", applyFilters);
    document.getElementById("filterType").addEventListener("change", applyFilters);

    document.getElementById("btnResetFilter").addEventListener("click", () => {
        document.getElementById("filterYear").value = "ALL";
        document.getElementById("filterDept").value = "ALL";
        document.getElementById("filterType").value = "ALL";

        document.getElementById("filteredResultsContainer").style.display = "none";

        const shopContainer = document.getElementById("shopChartsContainer");
        if (shopContainer) shopContainer.style.display = "block";
    });

    function drawStaticCharts(data) {
        if (data.length === 0) return;

        const yearsInData = [...new Set(data.map(d => {
            if (!d.tarih) return "";
            const parts = d.tarih.replace(/\//g, '.').split('.');
            if (parts.length === 3) {
                let y = parts[2].trim();
                return y.length === 2 ? "20" + y : y;
            }
            return "";
        }).filter(y => y !== ""))].sort();

        const typesInData = [...new Set(data.map(d => (d.egitim_turu || "").trim()).filter(t => t))];

        const yearlyDatasets = typesInData.map((type, index) => {
            const counts = yearsInData.map(y => data.filter(d => {
                if (!d.tarih || (d.egitim_turu || "").trim() !== type) return false;
                const normalizedDate = d.tarih.replace(/\//g, '.');
                return normalizedDate.endsWith(y) || normalizedDate.endsWith(y.substring(2));
            }).length);
            return { label: type, data: counts, backgroundColor: colorPalette[index % colorPalette.length] };
        });

        staticChartInstances['yearly'] = new Chart(document.getElementById('chartYearly'), {
            type: 'bar',
            data: { labels: yearsInData, datasets: yearlyDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { bottom: 20, left: 15, right: 15 }
                },
                plugins: {
                    datalabels: {
                        anchor: 'center',
                        align: 'center',
                        color: '#fff',
                        font: { weight: 'bold' },
                        formatter: (v) => v > 0 ? v : ''
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 12 }, padding: 8 } },
                    y: { display: true, grid: { display: true }, ticks: { display: false } }
                }
            }
        });

        let anaB = 0, anaO = 0, anaI = 0;
        data.forEach(d => {
            // toUpperCase kullanmadan doğrudan seçili metni kontrol ediyoruz ve 'İleri' yerine 'Ileri' yazıyoruz:
            if (d.egitim_turu && d.egitim_turu === "Ana Eğitim" && d.seviyeler) {
                if (d.seviyeler.includes("Baslangic")) anaB++;
                if (d.seviyeler.includes("Orta")) anaO++;
                if (d.seviyeler.includes("Ileri")) anaI++;
            }
        });

        staticChartInstances['anaEgitimLevels'] = new Chart(document.getElementById('chartAnaEgitimLevels'), {
            type: 'pie',
            data: {
                labels: ['Baslangic', 'Orta', 'Ileri'],
                datasets: [{ data: [anaB, anaO, anaI], backgroundColor: [colBaslangic, colOrta, colIleri], borderColor: '#ffffff', borderWidth: 2 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' }, datalabels: { color: '#fff', font: { weight: 'bold', size: 14 }, formatter: (v) => v > 0 ? v : '' } }
            }
        });

        const shopB = targetShops.map(s => data.filter(d => (d.departman || "").trim() === s.name && (d.seviyeler || "").includes("Baslangic")).length);
        const shopO = targetShops.map(s => data.filter(d => (d.departman || "").trim() === s.name && (d.seviyeler || "").includes("Orta")).length);
        const shopI = targetShops.map(s => data.filter(d => (d.departman || "").trim() === s.name && (d.seviyeler || "").includes("Ileri")).length);

        staticChartInstances['depts'] = new Chart(document.getElementById('chartDepts'), {
            type: 'bar',
            data: {
                labels: targetShops.map(s => s.name.replace("Dep", "Departman-")),

                datasets: [
                    { label: 'Baslangic', data: shopB, backgroundColor: colBaslangic },
                    { label: 'Orta', data: shopO, backgroundColor: colOrta },
                    { label: 'Ileri', data: shopI, backgroundColor: colIleri }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { datalabels: { anchor: 'center', align: 'center', color: '#fff', font: { weight: 'bold' }, formatter: (v) => v > 0 ? v : '' } },
                scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, display: true, grid: { display: true }, ticks: { display: false } } }
            }
        });

        targetShops.forEach((shopObj, index) => {
            const ctx = document.getElementById(shopObj.id);
            if (!ctx) return;

            staticChartInstances[shopObj.id] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Baslangic', 'Orta', 'Ileri'],
                    datasets: [{
                        data: [shopB[index], shopO[index], shopI[index]],
                        backgroundColor: [colBaslangic, colOrta, colIleri]
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        datalabels: { anchor: 'center', align: 'center', color: '#fff', font: { weight: 'bold' }, formatter: (v) => v > 0 ? v : '' }
                    },
                    scales: {
                        x: { grid: { display: false } },
                        y: { display: true, grid: { display: true }, ticks: { display: false } }
                    }
                }
            });
        });
    }

    function drawFilteredCharts(data, year, dept, type) {
        Object.values(filteredChartInstances).forEach(chart => chart.destroy());
        filteredChartInstances = {};

        const container = document.getElementById("filteredResultsContainer");
        const title = document.getElementById("filteredTitle");

        if (data.length === 0) {
            title.textContent = "Filtre Sonuçları (Eşleşen Kayıt Bulunamadı)";
            container.style.display = "block";
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        container.style.display = "block";
        title.textContent = `Filtre Sonuçları:`;

        setTimeout(() => { container.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);

        const typeCounts = {};
        data.forEach(d => {
            const t = (d.egitim_turu || "Bilinmiyor").trim();
            typeCounts[t] = (typeCounts[t] || 0) + 1;
        });

        filteredChartInstances['filterType'] = new Chart(document.getElementById('chartFilterType'), {
            type: 'pie',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{ data: Object.values(typeCounts), backgroundColor: colorPalette, borderColor: '#ffffff', borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, datalabels: { color: '#fff', font: { weight: 'bold' }, formatter: (v) => v > 0 ? v : '' } } }
        });

        const titleCounts = {};
        data.forEach(d => {
            const u = (d.unvan || "Bilinmiyor").trim();
            titleCounts[u] = (titleCounts[u] || 0) + 1;
        });
        const sortedTitles = Object.keys(titleCounts).sort();
        const sortedTitleValues = sortedTitles.map(t => titleCounts[t]);

        filteredChartInstances['filterTitle'] = new Chart(document.getElementById('chartFilterTitle'), {
            type: 'bar',
            data: {
                labels: sortedTitles,
                datasets: [{
                    label: 'Kişi Sayısı',
                    data: sortedTitleValues,
                    backgroundColor: colorPalette
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, datalabels: { anchor: 'center', align: 'center', color: '#fff', font: { weight: 'bold' }, formatter: (v) => v > 0 ? v : '' } },
                scales: { x: { grid: { display: false } }, y: { display: true, grid: { display: true }, ticks: { display: false } } }
            }
        });

        let fB = 0, fI = 0, fJ = 0;
        data.forEach(d => {
            if (d.seviyeler) {
                if(d.seviyeler.includes("Baslangic")) fB++;
                if(d.seviyeler.includes("Orta")) fI++;
                if(d.seviyeler.includes("Ileri")) fJ++;
            }
        });

        filteredChartInstances['filterLevel'] = new Chart(document.getElementById('chartFilterLevel'), {
            type: 'bar',
            data: { labels: ['Baslangic', 'Orta', 'Ileri'], datasets: [{ data: [fB, fI, fJ], backgroundColor: [colBaslangic, colOrta, colIleri] }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, datalabels: { anchor: 'center', align: 'center', color: '#fff', font: { weight: 'bold' }, formatter: (v) => v > 0 ? v : '' } },
                scales: { x: { grid: { display: false } }, y: { display: true, grid: { display: true }, ticks: { display: false } } }
            }
        });
    }

    setTimeout(loadData, 200);
});