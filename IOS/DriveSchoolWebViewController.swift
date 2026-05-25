import UIKit
import WebKit

final class DriveSchoolWebViewController: UIViewController, WKNavigationDelegate {
    private let appURL = URL(string: "https://your-domain.example/exam.html")!
    private lazy var webView: WKWebView = {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = self
        view.allowsBackForwardNavigationGestures = true
        return view
    }()

    override func loadView() {
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Driving School"
        webView.load(URLRequest(url: appURL))
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        webView.stopLoading()
    }
}
