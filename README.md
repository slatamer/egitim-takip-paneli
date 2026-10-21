# Kurumsal Eğitim Takip Paneli (ETP)

Kurumsal firmalardaki personel eğitim süreçlerinin (planlama, katılım, seviye takibi) manuel işleyişini dijitalleştirmek, veri bütünlüğünü sağlamak ve bu verileri anlamlı grafiklere dönüştürmek amacıyla geliştirilmiş hibrit bir masaüstü uygulamasıdır.

>  **NOT:** Bu proje, kurumsal bir staj kapsamında geliştirilmiştir. KVKK ve gizlilik politikaları (NDA) gereği; depodaki tüm personel bilgileri, eğitim kayıtları, departman ve unvan isimlendirmeleri tamamen sentetik (mock) verilerle değiştirilerek anonimleştirilmiştir.

## 🛠 Geliştirme Altyapısı ve Teknolojiler

Proje, Java masaüstü yetenekleri ile modern web arayüz teknolojilerini birleştiren hibrit bir mimari üzerine inşa edilmiştir:

*   **Arka Plan (Backend):** Java, JavaFX (WebView Entegrasyonu)
*   **Ön Yüz (Frontend):** HTML5, CSS3, Vanilla JavaScript
*   **Veritabanı:** SQLite (Yerel dosya tabanlı güvenli depolama)
*   **Veri Entegrasyonu:** Apache POI (SQLite ve Excel arası çift yönlü senkronizasyon)
*   **Raporlama & Analiz:** Chart.js (Dinamik veri görselleştirme)

## 🚀 Kullanım ve İşleyiş

Uygulama, temel olarak eğitim verilerinin girilmesi, Excel ile entegre edilmesi ve filtrelenerek raporlanması prensibiyle çalışır:

**1.**  **Sisteme Giriş ve Yetkilendirme:** 
    Program ilk açıldığında kullanıcıdan giriş yapması istenir. Yönetici (Admin) özelliklerini (veri silme, eğitmen ekleme, Excel senkronizasyonu vb.) hızlıca test etmek için sisteme önceden tanımlı olan **Sicil No: `00001`** ve **Şifre: `ETP_ADMIN2026`** bilgileriyle doğrudan giriş yapabilirsiniz. Alternatif olarak, standart kullanıcı (Eğitimi Alan) yetkilerini test etmek için kayıt ekranından kendi belirleyeceğiniz rastgele bir şifreyle sisteme yeni bir kullanıcı kaydı da oluşturabilirsiniz.

**2.**  **Eğitim Bilgi Girişi:** 
    Panele personel sicil numarası, departmanı, aldığı eğitim türü ve seviyesi (Başlangıç, Orta, İleri) girilerek kayıt oluşturulur. "Ana Eğitim" gibi özel türlerde uygulamalı alan (Shop/Hat) bilgisi sistem tarafından zorunlu tutulur.

**3.**  **Çift Yönlü Excel Senkronizasyonu:** 
    Sistem arka planda `Egitim_Kayit_Listesi.xlsx` dosyası ile bağlantılı çalışır.
    *   **DB'den Excel'e:** Arayüzden girilen her yeni kayıt anında otomatik olarak Excel dosyasına işlenir.
    *   **Excel'den DB'ye:** "Veritabanını Senkronize Et" butonu ile Excel'e dışarıdan manuel girilmiş satırlar tek tıkla uygulamanın veritabanına çekilir.

**4.**  **Dinamik Raporlama:** 
    "Genel Rapor" sekmesinde yer alan interaktif gösterge paneli (dashboard) üzerinden veriler Yıl, Departman ve Eğitim Türü bazlı filtrelenebilir. Kurumsal genel durum ve departman seviye kırılımları grafikler üzerinden anlık olarak takip edilebilir.
