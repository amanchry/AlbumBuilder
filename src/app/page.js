import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home">
      <div className="homeBg" />
      <div className="homeOverlay" />

      <div className="homeContent">
        <h1 className="homeTitle">Create beautiful photo albums — free</h1>

        <p className="homeSubtitle">
          Upload your photos, generate a clean layout automatically, and download a print-ready PDF.
          <br />
          <strong>100% client-side. No login required.</strong>
        </p>

        <div className="homeActions">
          <Link href="/builder" className="button primary homeButton">
            Start building →
          </Link>
        </div>

        {/* <div className="homeFooter">
          <span>Privacy-first • No server storage</span>
        </div> */}
      </div>
    </main>
  );
}
