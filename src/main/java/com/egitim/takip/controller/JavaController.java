package com.egitim.takip.controller;

import com.egitim.takip.DatabaseHelper;
import javafx.application.Platform;
import javafx.scene.web.WebEngine;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import java.awt.Color;

import java.io.*;
import java.net.URL;
import java.sql.*;

public class JavaController {

    private final WebEngine webEngine;
    private static String aktifRol = "EGITIM_ALAN";
    private static final String EXCEL_FILE_PATH = "Egitim_Kayit_Listesi.xlsx";
    private static final String YETKILI_SIFRESI = "ETP_ADMIN2026";

    public JavaController(WebEngine webEngine) {
        this.webEngine = webEngine;
    }

    public void navigateTo(String pageName) {
        URL url = getClass().getResource("/web/" + pageName);
        if (url != null) {
            webEngine.load(url.toExternalForm());
        }
    }

    public boolean login(String sicilNo, String sifre) {
        String sql = "SELECT rol FROM Kullanicilar WHERE sicil_no = ? AND sifre = ?";
        try (Connection conn = DatabaseHelper.connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, sicilNo);
            pstmt.setString(2, sifre);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    aktifRol = rs.getString("rol");
                    return true;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean register(String name, String surname, String sicilNo, String password) {
        String rol = YETKILI_SIFRESI.equals(password) ? "YETKILI" : "EGITIM_ALAN";
        String sql = "INSERT INTO Kullanicilar(sicil_no, ad, soyad, sifre, rol) VALUES(?,?,?,?,?)";

        try (Connection conn = DatabaseHelper.connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, sicilNo);
            pstmt.setString(2, name);
            pstmt.setString(3, surname);
            pstmt.setString(4, password);
            pstmt.setString(5, rol);
            pstmt.executeUpdate();

            dosyayaLogYaz("YENİ KULLANICI KAYDOLDU -> Sicil: " + sicilNo);
            return true;
        } catch (SQLException e) {
            return false;
        }
    }

    public String getAktifRol() {
        return aktifRol;
    }

    public boolean changePassword(String sicilNo, String oldPassword, String newPassword) {
        String checkSql = "SELECT * FROM Kullanicilar WHERE sicil_no = ? AND sifre = ?";
        String updateSql = "UPDATE Kullanicilar SET sifre = ?, rol = ? WHERE sicil_no = ?";

        try (Connection conn = DatabaseHelper.connect();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            checkStmt.setString(1, sicilNo);
            checkStmt.setString(2, oldPassword);

            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                        String yeniRol = YETKILI_SIFRESI.equals(newPassword) ? "YETKILI" : "EGITIM_ALAN";
                        updateStmt.setString(1, newPassword);
                        updateStmt.setString(2, yeniRol);
                        updateStmt.setString(3, sicilNo);
                        updateStmt.executeUpdate();

                        aktifRol = yeniRol;
                        dosyayaLogYaz("ŞİFRE VE ROL GÜNCELLENDİ -> Sicil: " + sicilNo + " | Yeni Rol: " + yeniRol);
                        return true;
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // --- MANUEL EXCEL EŞİTLEME METODU (DB -> EXCEL) ---
    public boolean manuelExcelSenkronizasyonu() {
        boolean basarili = exceliDBdenYenidenOlustur();
        if (basarili) {
            dosyayaLogYaz("MANUEL EXCEL EŞİTLEMESİ BAŞARILI.");
            return true;
        } else {
            dosyayaLogYaz("MANUEL EXCEL EŞİTLEMESİ BAŞARISIZ (Dosya açık).");
            return false;
        }
    }


    // --- EXCEL'E MANUEL GİRİLEN VERİLERİ DB'YE AKTARMA (EXCEL -> DB) ---
    public boolean exceldenDByeSenkronizeEt() {
        File file = new File(EXCEL_FILE_PATH);
        if (!file.exists()) return false;

        String insertSql = "INSERT INTO EgitimKayitlari(sicil_no, ad, soyad, departman, unvan, egitim_turu, tarih, seviyeler, ileri_shop_hat, egitmen, yorum) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
        String checkSql = "SELECT COUNT(*) FROM EgitimKayitlari WHERE sicil_no=? AND egitim_turu=? AND tarih=? AND seviyeler=?";
        String truncateSql = "DELETE FROM EgitimKayitlari"; // Excel ile birebir senkronizasyon için önce tabloyu temizliyoruz

        try (FileInputStream fis = new FileInputStream(file);
             Workbook workbook = new XSSFWorkbook(fis);
             Connection conn = DatabaseHelper.connect()) {

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            java.text.SimpleDateFormat sdfStandard = new java.text.SimpleDateFormat("dd.MM.yyyy");

            // Tabloyu temizleyip Excel'deki güncel verileri sıfırdan basıyoruz
            try (Statement stmt = conn.createStatement()) {
                stmt.execute(truncateSql);
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String sicilNo = formatter.formatCellValue(row.getCell(1)).trim();
                String adSoyad = formatter.formatCellValue(row.getCell(2)).trim();
                String shop = formatter.formatCellValue(row.getCell(3)).trim();
                String unvan = formatter.formatCellValue(row.getCell(4)).trim();
                String egitimTuru = formatter.formatCellValue(row.getCell(5)).trim();

                Cell tarihHucresi = row.getCell(6);
                String tarih = "";
                if (tarihHucresi != null) {
                    if (tarihHucresi.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(tarihHucresi)) {
                        tarih = sdfStandard.format(tarihHucresi.getDateCellValue());
                    } else {
                        tarih = formatter.formatCellValue(tarihHucresi).trim();
                        if (tarih.contains("/")) {
                            try {
                                java.text.SimpleDateFormat inputSdf = new java.text.SimpleDateFormat("M/d/yy");
                                java.util.Date parsedDate = inputSdf.parse(tarih);
                                tarih = sdfStandard.format(parsedDate);
                            } catch (Exception ex) {}
                        }
                    }
                }

                boolean isBaslangic = "X".equalsIgnoreCase(formatter.formatCellValue(row.getCell(7)).trim());
                boolean isOrta = "X".equalsIgnoreCase(formatter.formatCellValue(row.getCell(8)).trim());
                boolean isIleri = "X".equalsIgnoreCase(formatter.formatCellValue(row.getCell(9)).trim());
                String ileriShopHat = formatter.formatCellValue(row.getCell(10)).trim();
                String egitmen = formatter.formatCellValue(row.getCell(11)).trim();
                String yorum = formatter.formatCellValue(row.getCell(12)).trim();

                if (sicilNo.isEmpty() || egitimTuru.isEmpty()) continue;

                String ad = adSoyad;
                String soyad = "";
                if (adSoyad.contains(" ")) {
                    int lastSpace = adSoyad.lastIndexOf(" ");
                    ad = adSoyad.substring(0, lastSpace);
                    soyad = adSoyad.substring(lastSpace + 1);
                }

                java.util.List<String> sevList = new java.util.ArrayList<>();
                if (isBaslangic) sevList.add("Baslangic");
                if (isOrta) sevList.add("Orta");
                if (isIleri) sevList.add("Ileri");
                String seviyeler = String.join(", ", sevList);

                // --- Yeni kaydı veritabanına ekle ---
                try (PreparedStatement pstmt = conn.prepareStatement(insertSql)) {
                    pstmt.setString(1, sicilNo);
                    pstmt.setString(2, ad);
                    pstmt.setString(3, soyad);
                    pstmt.setString(4, shop);
                    pstmt.setString(5, unvan);
                    pstmt.setString(6, egitimTuru);
                    pstmt.setString(7, tarih);
                    pstmt.setString(8, seviyeler);
                    pstmt.setString(9, ileriShopHat);
                    pstmt.setString(10, egitmen);
                    pstmt.setString(11, yorum);
                    pstmt.executeUpdate();
                }
            }

            dosyayaLogYaz("EXCEL'DEN DB'YE VERİ SENKRONİZASYONU TAMAMLANDI.");
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean egitimKaydet(String egitmen, String sicilNo, String ad, String soyad,
                                String departman, String unvan, String egitimTuru,
                                boolean isBaslangic, boolean isOrta, boolean isIleri, String ileriShopHat, String tarih, String yorum) {

        java.util.List<String> secilenSeviyeler = new java.util.ArrayList<>();
        if (isBaslangic) secilenSeviyeler.add("Baslangic");
        if (isOrta) secilenSeviyeler.add("Orta");
        if (isIleri) secilenSeviyeler.add("Ileri");

        if (secilenSeviyeler.isEmpty()) secilenSeviyeler.add("");

        String sql = "INSERT INTO EgitimKayitlari(sicil_no, ad, soyad, departman, unvan, egitim_turu, tarih, seviyeler, ileri_shop_hat, egitmen, yorum) VALUES(?,?,?,?,?,?,?,?,?,?,?)";

        try (Connection conn = DatabaseHelper.connect()) {
            for (String seviye : secilenSeviyeler) {
                String gecerliShopHat = "Ileri".equals(seviye) && ileriShopHat != null ? ileriShopHat.trim() : "";

                try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                    pstmt.setString(1, sicilNo);
                    pstmt.setString(2, ad);
                    pstmt.setString(3, soyad);
                    pstmt.setString(4, departman);
                    pstmt.setString(5, unvan);
                    pstmt.setString(6, egitimTuru);
                    pstmt.setString(7, tarih);
                    pstmt.setString(8, seviye);
                    pstmt.setString(9, gecerliShopHat);
                    pstmt.setString(10, egitmen);
                    pstmt.setString(11, yorum != null ? yorum.trim() : "");
                    pstmt.executeUpdate();
                }
            }

            // --- DB'ye kayıt eklendikten hemen sonra Egitim_Kayit_Listesi.xlsx dosyasına güncel verileri aktar ---
            exceliDBdenYenidenOlustur();

            dosyayaLogYaz("EĞİTİM KAYDI EKLENDİ VE EXCELE YANSITILDI -> Sicil: " + sicilNo);
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public String getTumKayitlar() {
        StringBuilder json = new StringBuilder("[");
        String sql = "SELECT * FROM EgitimKayitlari ORDER BY id DESC";

        try (Connection conn = DatabaseHelper.connect();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            boolean first = true;
            while (rs.next()) {
                if (!first) json.append(",");
                json.append("{");
                json.append("\"id\":").append(rs.getInt("id")).append(",");
                json.append("\"no\":").append(rs.getInt("id")).append(",");
                json.append("\"sicil_no\":\"").append(escapeJson(rs.getString("sicil_no"))).append("\",");
                json.append("\"ad_soyad\":\"").append(escapeJson(rs.getString("ad") + " " + rs.getString("soyad"))).append("\",");
                json.append("\"departman\":\"").append(escapeJson(rs.getString("departman"))).append("\",");
                json.append("\"unvan\":\"").append(escapeJson(rs.getString("unvan"))).append("\",");
                json.append("\"egitim_turu\":\"").append(escapeJson(rs.getString("egitim_turu"))).append("\",");
                json.append("\"seviyeler\":\"").append(escapeJson(rs.getString("seviyeler"))).append("\",");
                json.append("\"shop_hat\":\"").append(escapeJson(rs.getString("ileri_shop_hat"))).append("\",");
                json.append("\"tarih\":\"").append(escapeJson(rs.getString("tarih"))).append("\"");
                json.append("}");
                first = false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        json.append("]");
        return json.toString();
    }

    public boolean kayitlariSil(String idListesiStr) {
        if (idListesiStr == null || idListesiStr.trim().isEmpty()) return false;
        String[] idDizisi = idListesiStr.split(",");
        StringBuilder soruIsaretleri = new StringBuilder();
        for (int i = 0; i < idDizisi.length; i++) {
            soruIsaretleri.append("?");
            if (i < idDizisi.length - 1) soruIsaretleri.append(",");
        }

        String sql = "DELETE FROM EgitimKayitlari WHERE id IN (" + soruIsaretleri + ")";
        try (Connection conn = DatabaseHelper.connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            for (int i = 0; i < idDizisi.length; i++) {
                pstmt.setInt(i + 1, Integer.parseInt(idDizisi[i].trim()));
            }
            pstmt.executeUpdate();

            // --- Silme işleminden sonra Excel dosyasını güncelle ---
            exceliDBdenYenidenOlustur();

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public String getKayitById(int id) {
        String sql = "SELECT * FROM EgitimKayitlari WHERE id = ?";
        StringBuilder json = new StringBuilder("{");
        try (Connection conn = DatabaseHelper.connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                json.append("\"id\":").append(rs.getInt("id")).append(",");
                json.append("\"no\":").append(rs.getInt("id")).append(",");
                json.append("\"sicil_no\":\"").append(escapeJson(rs.getString("sicil_no"))).append("\",");
                json.append("\"ad\":\"").append(escapeJson(rs.getString("ad"))).append("\",");
                json.append("\"soyad\":\"").append(escapeJson(rs.getString("soyad"))).append("\",");
                json.append("\"departman\":\"").append(escapeJson(rs.getString("departman"))).append("\",");
                json.append("\"unvan\":\"").append(escapeJson(rs.getString("unvan"))).append("\",");
                json.append("\"egitim_turu\":\"").append(escapeJson(rs.getString("egitim_turu"))).append("\",");
                json.append("\"tarih\":\"").append(escapeJson(rs.getString("tarih"))).append("\",");
                json.append("\"seviyeler\":\"").append(escapeJson(rs.getString("seviyeler"))).append("\",");
                json.append("\"shop_hat\":\"").append(escapeJson(rs.getString("ileri_shop_hat"))).append("\",");
                json.append("\"egitmen\":\"").append(escapeJson(rs.getString("egitmen"))).append("\",");
                json.append("\"yorum\":\"").append(escapeJson(rs.getString("yorum"))).append("\"");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        json.append("}");
        return json.toString();
    }

    public boolean egitimGuncelle(int id, String egitmen, String sicilNo, String ad, String soyad,
                                  String departman, String unvan, String egitimTuru,
                                  boolean isBaslangic, boolean isOrta, boolean isIleri,
                                  String ileriShopHat, String tarih, String yorum) {

        java.util.List<String> secilenSeviyeler = new java.util.ArrayList<>();
        if (isBaslangic) secilenSeviyeler.add("Baslangic");
        if (isOrta) secilenSeviyeler.add("Orta");
        if (isIleri) secilenSeviyeler.add("Ileri");
        String seviyeler = secilenSeviyeler.isEmpty() ? "" : String.join(", ", secilenSeviyeler);

        String sql = "UPDATE EgitimKayitlari SET sicil_no=?, ad=?, soyad=?, departman=?, unvan=?, egitim_turu=?, tarih=?, seviyeler=?, ileri_shop_hat=?, egitmen=?, yorum=? WHERE id=?";

        try (Connection conn = DatabaseHelper.connect();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, sicilNo);
            pstmt.setString(2, ad);
            pstmt.setString(3, soyad);
            pstmt.setString(4, departman);
            pstmt.setString(5, unvan);
            pstmt.setString(6, egitimTuru);
            pstmt.setString(7, tarih);
            pstmt.setString(8, seviyeler);
            pstmt.setString(9, ileriShopHat != null ? ileriShopHat.trim() : "");
            pstmt.setString(10, egitmen);
            pstmt.setString(11, yorum != null ? yorum.trim() : "");
            pstmt.setInt(12, id);
            pstmt.executeUpdate();

            // --- Güncellemeden sonra Excel dosyasını yenile ---
            exceliDBdenYenidenOlustur();

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private synchronized boolean exceliDBdenYenidenOlustur() {
        File file = new File(EXCEL_FILE_PATH);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Eğitim Kayıtları");

            Color[] headerColors = new Color[]{
                    new Color(199,202,213), new Color(189,215,238), new Color(255,230,153), new Color(189,215,238),
                    new Color(189,215,238), new Color(252,228,214), new Color(226,239,218), new Color(252,228,214),
                    new Color(252,228,214), new Color(252,228,214), new Color(189,215,238), new Color(248,203,173), new Color(226,239,218)
            };

            Row headerRow = sheet.createRow(0);
            String[] headers = {"No", "SicilNo", "Adı Soyadı", "Shop", "Unvan", "EğitimTürü", "Tarih", "Başlangıç", "Orta", "İleri", "İleri - Shop/Hat", "Eğitmen", "Not/Yorum"};

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                XSSFCellStyle style = (XSSFCellStyle) workbook.createCellStyle();
                style.setAlignment(HorizontalAlignment.CENTER);
                style.setVerticalAlignment(VerticalAlignment.CENTER);
                style.setFillForegroundColor(new XSSFColor(headerColors[i], null));
                style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                XSSFFont font = (XSSFFont) workbook.createFont(); font.setFontName("Calibri"); font.setFontHeightInPoints((short) 11);
                style.setFont(font); cell.setCellStyle(style);
            }

            CellStyle center = workbook.createCellStyle(); center.setAlignment(HorizontalAlignment.CENTER); center.setVerticalAlignment(VerticalAlignment.CENTER);
            CellStyle left = workbook.createCellStyle(); left.setAlignment(HorizontalAlignment.LEFT); left.setVerticalAlignment(VerticalAlignment.CENTER);

            // --- Veritabanındaki tablonuzda birincil anahtar sütunu 'id' olduğundan ORDER BY id ASC kullanıyoruz---
            String sql = "SELECT * FROM EgitimKayitlari ORDER BY id ASC";
            try (Connection conn = DatabaseHelper.connect(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
                int rowNum = 1;
                while(rs.next()) {
                    Row row = sheet.createRow(rowNum);
                    String sev = rs.getString("seviyeler");
                    boolean b = sev != null && sev.contains("Baslangic");
                    boolean i = sev != null && sev.contains("Orta");
                    boolean j = sev != null && sev.contains("Ileri");

                    Cell c0 = row.createCell(0); c0.setCellValue(rowNum); c0.setCellStyle(center);
                    Cell c1 = row.createCell(1); c1.setCellValue(rs.getString("sicil_no")); c1.setCellStyle(center);
                    Cell c2 = row.createCell(2); c2.setCellValue(rs.getString("ad") + " " + rs.getString("soyad")); c2.setCellStyle(left);
                    Cell c3 = row.createCell(3); c3.setCellValue(rs.getString("departman")); c3.setCellStyle(center);
                    Cell c4 = row.createCell(4); c4.setCellValue(rs.getString("unvan")); c4.setCellStyle(center);
                    Cell c5 = row.createCell(5); c5.setCellValue(rs.getString("egitim_turu")); c5.setCellStyle(left);
                    Cell c6 = row.createCell(6); c6.setCellValue(rs.getString("tarih")); c6.setCellStyle(center);
                    Cell c7 = row.createCell(7); c7.setCellValue(b ? "X" : ""); c7.setCellStyle(center);
                    Cell c8 = row.createCell(8); c8.setCellValue(i ? "X" : ""); c8.setCellStyle(center);
                    Cell c9 = row.createCell(9); c9.setCellValue(j ? "X" : ""); c9.setCellStyle(center);
                    Cell c10 = row.createCell(10); c10.setCellValue(j ? rs.getString("ileri_shop_hat") : ""); c10.setCellStyle(center);
                    Cell c11 = row.createCell(11); c11.setCellValue(rs.getString("egitmen")); c11.setCellStyle(center);
                    Cell c12 = row.createCell(12); c12.setCellValue(rs.getString("yorum") != null ? rs.getString("yorum") : ""); c12.setCellStyle(left);
                    rowNum++;
                }
            }

            int[] widths = {5, 10, 25, 10, 10, 25, 15, 10, 10, 10, 20, 20, 30};
            for (int i = 0; i < widths.length; i++) sheet.setColumnWidth(i, widths[i] * 256);

            try (FileOutputStream fos = new FileOutputStream(file)) {
                workbook.write(fos);
                return true;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String escapeJson(String data) {
        if (data == null) return "";
        return data.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    public void dosyayaLogYaz(String mesaj) {
        try (FileWriter fw = new FileWriter("egitim_islemleri.txt", true);
             PrintWriter pw = new PrintWriter(fw)) {
            pw.println("[" + new java.util.Date() + "] " + mesaj);
        } catch (IOException e) {}
    }
}