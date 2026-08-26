import React from "react";

const prizes = [

  {

    src: "/tcgpromos/RR07.webp",

    title: "",

    subtitle: "A magical KAYOU promo",

    ribbon: "1st Prize",

    className: "rose",

  },

  {

    src: "/tcgpromos/RR09.webp",

    title: "",

    subtitle: "A magical KAYOU promo",

    ribbon: "2nd Prize",

    className: "lilac",

  },

];

export default function ThrowawayPage() {
  return (
    <div className="stream-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Oxanium:wght@500;600;700;800&family=Roboto+Condensed:wght@700;800;900&display=swap");

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #111111;
        }

        /*
          STONESTRADINGCO
          1080 x 1920 vertical streaming overlay.

          The camera spaces are intentionally EMPTY.
          OBS camera/video sources cover those areas.

          FACE CAM = upper section
          HAND CAM = dominant lower section
          Branding/details live OUTSIDE the camera areas.
        */

        .stream-page {
          position: relative;
          width: 1080px;
          height: 1920px;
          min-width: 1080px;
          min-height: 1920px;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 0%, rgba(255,204,0,.10), transparent 30%),
            linear-gradient(145deg, #1b1b1b 0%, #151515 48%, #111111 100%);
          color: #ffffff;
          font-family: "Oxanium", sans-serif;
        }

        .outer-frame {
          position: absolute;
          inset: 22px;
          border: 2px solid #333333;
          border-radius: 30px;
          pointer-events: none;
        }

        .outer-frame::before {
          content: "";
          position: absolute;
          inset: 7px;
          border: 1px solid rgba(255,204,0,.20);
          border-radius: 23px;
        }

        /*
          ==========================================
          FACE CAM — LARGE, CLEAN, EMPTY
          ==========================================
        */

        .facecam-area {
          position: absolute;
          top: 45px;
          left: 45px;
          right: 45px;
          height: 390px;
          border: 5px solid #ffcc00;
          border-radius: 26px;
          background: #202020;
          box-shadow:
            0 0 0 4px #101010,
            0 20px 45px rgba(0,0,0,.38);
          overflow: hidden;
        }

        .facecam-label {
          position: absolute;
          z-index: 2;
          top: 22px;
          left: 24px;
          padding: 10px 16px;
          border-radius: 8px;
          background: #ffcc00;
          color: #111111;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: .12em;
          line-height: 1;
        }

        /*
          ==========================================
          TRANSITION / BRANDING STRIP
          ==========================================
        */

        .middle-bar {
          position: absolute;
          z-index: 10;
          top: 460px;
          left: 45px;
          right: 45px;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 25px;
          border-top: 2px solid #333333;
          border-bottom: 2px solid #333333;
          background: #181818;
        }

        .middle-brand {
          color: #ffffff;
          font-family: "Roboto Condensed", sans-serif;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        .middle-brand span {
          color: #ffcc00;
        }

        .middle-status {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffcc00;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .status-dot {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #ffcc00;
          box-shadow: 0 0 14px rgba(255,204,0,.60);
        }

        /*
          ==========================================
          MASSIVE HAND CAM
          ==========================================

          This is intentionally almost the entire remaining page.
          NO title, no status panel, no decorative text, no fake
          camera content inside this area.
        */

        .handcam-area {
          position: absolute;
          top: 575px;
          left: 42px;
          right: 42px;
          bottom: 112px;
          border: 5px solid #ffcc00;
          border-radius: 28px;
          background: #191919;
          box-shadow:
            0 25px 65px rgba(0,0,0,.52),
            0 0 0 4px #101010,
            inset 0 0 0 1px rgba(255,204,0,.12);
          overflow: hidden;
        }

        /*
          Only a very thin edge treatment inside the handcam.
          The actual camera source gets the overwhelming majority
          of this area.
        */

        .handcam-accent-top {
          position: absolute;
          z-index: 2;
          left: 22px;
          top: 22px;
          width: 90px;
          height: 5px;
          border-radius: 4px;
          background: #ffcc00;
          opacity: .85;
        }

        .handcam-accent-bottom {
          position: absolute;
          z-index: 2;
          right: 22px;
          bottom: 22px;
          width: 90px;
          height: 5px;
          border-radius: 4px;
          background: #ffcc00;
          opacity: .85;
        }

        /*
          ==========================================
          BOTTOM BRAND BAR
          ==========================================
        */

        .bottom-bar {
          position: absolute;
          z-index: 12;
          left: 42px;
          right: 42px;
          bottom: 35px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top: 2px solid #333333;
        }

        .bottom-brand {
          color: #ffffff;
          font-family: "Roboto Condensed", sans-serif;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: .10em;
          text-transform: uppercase;
        }

        .bottom-brand span {
          color: #ffcc00;
        }

        /*
          Simple side accents stay outside the camera content.
        */

        .side-accent {
          position: absolute;
          width: 7px;
          border-radius: 8px;
          background: #ffcc00;
          opacity: .75;
        }

        .side-accent.left {
          left: 24px;
          top: 690px;
          height: 110px;
        }

        .side-accent.right {
          right: 24px;
          bottom: 260px;
          height: 90px;
        }
      `}</style>

      <div className="outer-frame" />

      <div className="side-accent left" />
      <div className="side-accent right" />

      <section className="facecam-area">
        <div className="facecam-label">FACECAM</div>
      </section>

      <div className="middle-bar">
        <div className="middle-brand">
          STONES<span>TRADINGCO</span>
        </div>

        <div className="middle-status">
          <span className="status-dot" />
          LIVE
        </div>
      </div>

      <section className="handcam-area">
        <div className="handcam-accent-top" />
        <div className="handcam-accent-bottom" />
      </section>

      <footer className="bottom-bar">
        <div className="bottom-brand">
          STONES<span>TRADINGCO</span>
          &nbsp; • &nbsp; LIVE CARD STREAM
        </div>
      </footer>
    </div>
  );
}
