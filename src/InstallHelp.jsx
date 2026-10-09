import { useId, useRef } from "react";

function InstallIllustration() {
  return <figure className="install-illustration">
    <img src="/assets/help/quickorbit-install.jpg" alt="Drag the QuickOrbit app icon into the Applications folder" loading="lazy" />
    <figcaption>Drag QuickOrbit into Applications to install it.</figcaption>
  </figure>;
}

function SecurityIllustration() {
  return <figure className="install-illustration install-illustration--security">
    <img src="/assets/help/macos-open-anyway.png" alt="macOS Privacy & Security settings showing where Open Anyway appears" loading="lazy" />
    <figcaption>If macOS blocks the first launch, check Privacy &amp; Security.</figcaption>
  </figure>;
}

export function InstallPreview() {
  return <div className="install-preview">
    <div className="install-video install-video--placeholder" role="img" aria-label="Guided introduction coming soon">
      <span className="install-video__play" aria-hidden="true">▶</span>
      <strong>Guided introduction</strong>
      <small>Coming soon</small>
    </div>
    <InstallIllustration />
  </div>;
}

export function InstallHelp({ detailed = false }) {
  if (!detailed) return <div className="install-help install-help--compact">
    <InstallIllustration />
    <SecurityIllustration />
    <p>Unpack if needed. Drag to Applications. Open.</p>
  </div>;

  return <div className="install-help">
    <h3>Make yourself at home.</h3>
    <p>Open your downloaded file. If it’s a ZIP, double-click it to unpack the app. Drag QuickOrbit into your Applications folder, then open it from there.</p>
    <h3>If macOS asks.</h3>
    <p>If macOS cannot verify the developer when you first open QuickOrbit, follow these steps only if you trust your download.</p>
    <ol>
      <li><strong>Try opening QuickOrbit once.</strong> Dismiss the warning, then open System Settings.</li>
      <li><strong>Choose Privacy &amp; Security.</strong> Scroll to Security and look for the message naming QuickOrbit.</li>
      <li><strong>Choose Open Anyway.</strong> Review the confirmation and authenticate if prompted.</li>
    </ol>
    <InstallPreview />
    <figure><img src="/assets/help/macos-open-anyway.png" alt="Example macOS settings with Privacy & Security and Open Anyway highlighted" loading="lazy" /><figcaption>Example showing a different app. On your Mac, check that the message names QuickOrbit. Labels may vary with your macOS language and version.</figcaption></figure>
    <p className="install-help__note">If macOS says the app contains malware or will damage your computer, stop and contact support. Keep your Mac’s security protections enabled.</p>
    <a className="text-link" href="https://support.apple.com/102445" target="_blank" rel="noopener noreferrer">Read Apple’s opening guide ↗</a>
  </div>;
}

export function DownloadButton({ className }) {
  const dialog = useRef(null);
  const titleId = useId();
  return <><button className={className} onClick={() => dialog.current.showModal()}>Get QuickOrbit</button>
    <dialog className="install-dialog" aria-labelledby={titleId} ref={dialog} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="install-dialog__header"><span className="eyebrow">Your first launch</span><button autoFocus aria-label="Close installation guide" onClick={() => dialog.current.close()}>Close ×</button></div>
      <h2 id={titleId}>Ready for your Mac.</h2><p>The official download is not available yet. Here’s how to install QuickOrbit once you have downloaded it.</p>
      <InstallHelp />
      <div className="install-download-placeholder">
        <button className="outline-button" disabled>Download · Coming soon</button>
        <p>The app download will be available here.</p>
      </div>
      <form method="dialog"><button className="outline-button">Got it</button></form>
    </dialog></>;
}
