package com.egitim.takip;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseHelper {

    private static final String DB_URL = "jdbc:sqlite:egitim_takip.db";

    public static Connection connect() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    public static void createTables() {
        // --- Excel Sütun Sıralaması İle Birebir Aynı SQLite Şeması: ---
        String sqlEgitimKayitlari = "CREATE TABLE IF NOT EXISTS EgitimKayitlari (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "sicil_no TEXT, " +
                "ad TEXT, " +
                "soyad TEXT, " +
                "departman TEXT, " +
                "unvan TEXT, " +
                "egitim_turu TEXT, " +
                "tarih TEXT, " +
                "seviyeler TEXT, " +
                "ileri_shop_hat TEXT, " +
                "egitmen TEXT, " +
                "yorum TEXT" +
                ");";

        String sqlKullanicilar = "CREATE TABLE IF NOT EXISTS Kullanicilar (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "sicil_no TEXT UNIQUE, " +
                "ad TEXT, " +
                "soyad TEXT, " +
                "sifre TEXT, " +
                "rol TEXT" +
                ");";

        try (Connection conn = connect();
             Statement stmt = conn.createStatement()) {

            stmt.execute(sqlEgitimKayitlari);
            stmt.execute(sqlKullanicilar);
            System.out.println("Veritabanı tabloları Excel şemasına uygun olarak oluşturuldu.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}