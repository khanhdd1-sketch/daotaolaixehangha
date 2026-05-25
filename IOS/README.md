# iOS Wrapper

Thu muc nay chua bo khung wrapper iOS cho web app hien tai.

## Cach dung de tao app iPhone/iPad

1. Tao project iOS trong Xcode voi `App`.
2. Dung `UIViewControllerRepresentable` hoac dat file `DriveSchoolWebViewController.swift` nay vao project UIKit.
3. Thay `appURL` bang domain deploy cua web app, hoac domain local/public de test.
4. Neu can upload anh, cau hinh them quyen photo library/camera trong `Info.plist`.

## Ghi chu

- Web app da co `manifest.webmanifest` va `service-worker.js`, nen khi chay Safari tren iPhone ban cung co the `Add to Home Screen`.
- Wrapper nay phu hop de dong goi nhanh cho hoc vien va admin su dung tren iOS.
