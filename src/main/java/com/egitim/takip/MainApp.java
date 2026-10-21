package com.egitim.takip;

import com.egitim.takip.controller.JavaController;
import javafx.application.Application;
import javafx.concurrent.Worker;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

public class MainApp extends Application {

    @Override
    public void start(Stage stage) {
        // --- Veritabanını başlat ---
        DatabaseHelper.createTables();

        WebView webView = new WebView();
        WebEngine webEngine = webView.getEngine();

        // --- Tek bir JavaController nesnesi oluştur (Durum/Rol kaybını önlemek için) ---
        JavaController javaController = new JavaController(webEngine);

        // --- JavaScript Alert ve Confirm Pencerelerini JavaFX'e Bağlama ---
        webEngine.setOnAlert(event -> {
            Alert alert = new Alert(Alert.AlertType.INFORMATION);
            alert.setTitle("Sistem Mesajı");
            alert.setHeaderText(null);
            alert.setContentText(event.getData());
            alert.showAndWait();
        });

        webEngine.setConfirmHandler(message -> {
            Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
            alert.setTitle("Onay Gerekiyor");
            alert.setHeaderText(null);
            alert.setContentText(message);
            alert.showAndWait();
            // Kullanıcı OK tuşuna basarsa true, aksi halde false döner
            return alert.getResult() == ButtonType.OK;
        });
        // ---------------------------------------------------------------------------------

        // --- Her sayfa yüklendiğinde JS köprüsüne aynı controller nesnesini bağla ---
        webEngine.getLoadWorker().stateProperty().addListener((observable, oldValue, newValue) -> {
            if (newValue == Worker.State.SUCCEEDED) {
                JSObject window = (JSObject) webEngine.executeScript("window");

                //  !! Her sayfada "new JavaController()" yapmak yerine aynı nesne bağlanıyor:
                window.setMember("JavaController", javaController);
                window.setMember("javaController", javaController);
            }
        });

        // --- Uygulamayı ilk sayfa olan index.html ile başlat ---
        javaController.navigateTo("index.html");

        Scene scene = new Scene(webView, 1000, 700);
        stage.setTitle("Eğitim Takip Paneli");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}