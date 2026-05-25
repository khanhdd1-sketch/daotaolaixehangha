# Android Wrapper

Thu muc nay chua bo khung wrapper Android cho web app hien tai.

## Cach dung de tao app Android

1. Tao project Android Studio rong voi `Empty Views Activity`.
2. Dat package theo ten ban muon, sau do thay `MainActivity.kt` va `activity_main.xml` bang 2 file trong thu muc nay.
3. Dat URL `APP_URL` ve domain deploy cua web app, hoac `http://10.0.2.2:5000/exam.html` neu test local tren emulator.
4. Bat Internet permission trong `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

5. Neu muon upload anh tu app, bo sung camera/gallery permissions theo nhu cau.

## Ghi chu

- Web app da duoc bo sung `manifest.webmanifest` va `service-worker.js` de co the hoat dong gan giong mot app.
- Phan dang nhap, thi ly thuyet, mo phong va gui ket qua se chay tren WebView nay.
