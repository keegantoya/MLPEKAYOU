import React from "react";

const promos = [
  "/promo-cards/mlpepr008.webp",
  "/promo-cards/mlpepr009.webp",
  "/promo-cards/mlpepr010.webp",
  "/promo-cards/mlpepr011.webp",
  "/promo-cards/mlpepr012.webp",
  "/promo-cards/mlpepr013.webp",
];

export default function ThrowawayPage() {
  return (
    <div className="giveaway-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
          background: #090a0b;
        }

        .giveaway-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background:
            radial-gradient(
              circle at 62% 45%,
              rgba(255, 193, 7, 0.08),
              transparent 38%
            ),
            radial-gradient(
              circle at 88% 10%,
              rgba(255, 45, 45, 0.045),
              transparent 25%
            ),
            #090a0b;
          font-family: "Oxanium", sans-serif;
          color: #f4f4f4;
        }

        .giveaway-card {
          position: relative;
          width: min(100%, 1550px);
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.025) 0%,
              transparent 35%
            ),
            linear-gradient(
              180deg,
              #17191b 0%,
              #101112 100%
            );
          border: 1px solid rgba(255, 193, 7, 0.55);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.025) inset,
            0 0 50px rgba(255,193,7,.08),
            0 25px 80px rgba(0,0,0,.65);
        }

        .giveaway-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background:
            linear-gradient(
              135deg,
              #ffc107 0 18px,
              transparent 18px
            ) top left,
            linear-gradient(
              225deg,
              #ffc107 0 18px,
              transparent 18px
            ) top right,
            linear-gradient(
              45deg,
              #ffc107 0 18px,
              transparent 18px
            ) bottom left,
            linear-gradient(
              315deg,
              #ffc107 0 18px,
              transparent 18px
            ) bottom right;
          background-size: 28px 28px;
          background-repeat: no-repeat;
          opacity: .95;
        }

        .scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 9;
          opacity: .11;
          background:
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 3px,
              rgba(255,255,255,.025) 4px
            );
        }

        .header {
          position: relative;
          z-index: 2;
          padding: 31px 52px 0;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffc107;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .24em;
          text-transform: uppercase;
        }

        .eyebrow::before {
          content: "";
          width: 32px;
          height: 2px;
          background: #ffc107;
          box-shadow: 0 0 10px rgba(255,193,7,.65);
        }

        .title {
          margin: 9px 0 0;
          font-size: clamp(32px, 4vw, 58px);
          line-height: .98;
          letter-spacing: -.035em;
          font-weight: 700;
          text-transform: uppercase;
          color: #f5f5f5;
        }

        .title span {
          color: #ffc107;
        }

        .no {
          position: absolute;
          top: 32px;
          right: 52px;
          color: rgba(255,255,255,.3);
          font-size: 10px;
          letter-spacing: .2em;
        }

        .divider {
          margin-top: 16px;
          height: 1px;
          background: linear-gradient(
            90deg,
            #ffc107 0%,
            rgba(255,193,7,.45) 45%,
            transparent 100%
          );
        }

        .content {
          position: relative;
          z-index: 2;
          padding: 18px 52px 38px;
          height: calc(100% - 128px);
          display: grid;
          grid-template-columns: 0.72fr 1.9fr;
          gap: 28px;
        }

        .left {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .stat {
          position: relative;
          padding: 13px 15px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.025);
        }

        .stat::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          background: #ffc107;
        }

        .stat-label {
          color: rgba(255,255,255,.42);
          font-size: 8px;
          font-weight: 600;
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        .stat-value {
          margin-top: 4px;
          color: #fff;
          font-size: clamp(16px, 1.55vw, 22px);
          line-height: 1;
          font-weight: 700;
          text-transform: uppercase;
        }

        .requirements {
          flex: 1;
          border-top: 1px solid rgba(255,193,7,.25);
          padding-top: 13px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 12px;
          color: #ffc107;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .2em;
          text-transform: uppercase;
        }

        .section-label::after {
          content: "";
          height: 1px;
          flex: 1;
          background: rgba(255,193,7,.22);
        }

        .requirement {
          display: flex;
          gap: 11px;
          margin-bottom: 17px;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255,255,255,.78);
        }

        .requirement-number {
          flex: 0 0 22px;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,193,7,.65);
          color: #ffc107;
          font-size: 9px;
          font-weight: 700;
        }

        .requirement strong {
          color: #fff;
          font-weight: 600;
        }

        .warning {
          margin-top: auto;
          padding: 11px 13px;
          border-left: 3px solid #e53935;
          background: rgba(229,57,53,.055);
          color: rgba(255,255,255,.5);
          font-size: 8px;
          line-height: 1.45;
          letter-spacing: .04em;
        }

        .warning strong {
          color: #e53935;
        }

        .prize-area {
          position: relative;
          min-width: 0;
          min-height: 0;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 0.375rem;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,.24),
              rgba(0,0,0,.10)
            );
          padding: 15px 20px 18px;
          display: flex;
          flex-direction: column;
        }

        .prize-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex: 0 0 auto;
        }

        .prize-heading .section-label {
          margin: 0;
          flex: 1;
        }

        .prize-code {
          color: rgba(255,255,255,.25);
          font-size: 8px;
          letter-spacing: .16em;
        }

        /*
          IMPORTANT:
          The promo images are PORTRAIT cards.

          The previous version made each grid cell a wide
          rectangle and then used object-fit: contain.
          That created the huge black bars visible beside
          every card.

          Each promo now has its own portrait aspect ratio.
        */
        .promo-grid {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          grid-template-rows: repeat(2, minmax(0, 1fr));
          column-gap: 22px;
          row-gap: 14px;
          align-items: center;
          justify-items: center;
        }

        .promo {
          position: relative;
          width: min(100%, 235px);
          height: 100%;
          min-height: 0;
          overflow: hidden;
          border-radius: 0.375rem;
          background: #0b0c0d;
          border: 1px solid rgba(255,193,7,.28);
          box-shadow:
            0 10px 24px rgba(0,0,0,.42),
            0 0 18px rgba(255,193,7,.035);
        }

        /*
          The actual promo artwork fills the card's
          portrait frame.

          1.05 = the standard 1.05x site card zoom.
          The overflow hidden on .promo removes the
          baked white edges around the artwork.
        */
        .promo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transform: scale(1.05);
          transform-origin: center;
        }

        .promo::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          border-radius: 0.375rem;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.08),
              transparent 28%,
              transparent 72%,
              rgba(255,193,7,.06)
            );
        }

        .promo-number {
          position: absolute;
          right: 7px;
          bottom: 6px;
          z-index: 4;
          color: rgba(255,255,255,.75);
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .1em;
          text-shadow: 0 1px 5px #000;
        }

        .footer {
          position: absolute;
          left: 52px;
          right: 52px;
          bottom: 16px;
          z-index: 11;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255,255,255,.2);
          font-size: 7px;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .footer span:last-child {
          color: rgba(255,193,7,.38);
        }

        @media (max-width: 1200px) {
          .giveaway-card {
            aspect-ratio: 15 / 9;
          }

          .content {
            grid-template-columns: 0.7fr 1.8fr;
            gap: 22px;
          }

          .promo-grid {
            column-gap: 14px;
            row-gap: 10px;
          }

          .promo {
            max-width: 205px;
          }
        }

        @media (max-width: 900px) {
          .giveaway-page {
            padding: 12px;
          }

          .giveaway-card {
            aspect-ratio: auto;
            min-height: 900px;
          }

          .header {
            padding: 28px 28px 0;
          }

          .no {
            top: 28px;
            right: 28px;
          }

          .title {
            padding-right: 70px;
            font-size: clamp(27px, 7vw, 42px);
          }

          .content {
            height: auto;
            padding: 18px 28px 48px;
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .prize-area {
            min-height: 650px;
          }

          .promo {
            max-width: 220px;
          }

          .footer {
            left: 28px;
            right: 28px;
          }
        }

        @media (max-width: 500px) {
          .giveaway-card {
            min-height: auto;
          }

          .header {
            padding: 24px 20px 0;
          }

          .no {
            top: 24px;
            right: 20px;
          }

          .content {
            padding: 16px 20px 42px;
          }

          .title {
            font-size: 25px;
          }

          .prize-area {
            min-height: 600px;
            padding: 14px;
          }

          .promo-grid {
            column-gap: 8px;
            row-gap: 8px;
          }

          .promo {
            max-width: 170px;
          }

          .footer {
            left: 20px;
            right: 20px;
          }
        }
      `}</style>

      <div className="giveaway-card">
        <div className="scanlines" />

        <header className="header">
          <div className="eyebrow">
            MLPEKAYOU // SPECIAL EVENT
          </div>

          <div className="no">
            EVENT 02 // SDCC
          </div>

          <h1 className="title">
            SDCC BOOM <span>PROMOS GIVEAWAY</span>
          </h1>

          <div className="divider" />
        </header>

        <main className="content">
          <section className="left">
            <div className="stats">
              <div className="stat">
                <div className="stat-label">
                  Winners
                </div>

                <div className="stat-value">
                  03
                </div>
              </div>

              <div className="stat">
                <div className="stat-label">
                  Prize Allocation
                </div>

                <div className="stat-value">
                  02 / Winner
                </div>
              </div>
            </div>

            <div className="requirements">
              <div className="section-label">
                Requirements
              </div>

              <div className="requirement">
                <div className="requirement-number">
                  01
                </div>

                <div>
                  A <strong>VALID US ADDRESS</strong>
                </div>
              </div>

              <div className="requirement">
                <div className="requirement-number">
                  02
                </div>

                <div>
                  <strong>50+ MESSAGES</strong> SENT IN THE
                  DISCORD SERVER FROM THE DAY YOU JOINED
                  TO PROVE ACTIVITY
                </div>
              </div>

              <div className="warning">
                <strong>ELIGIBILITY CHECK //</strong>{" "}
                Activity must be legitimate and verifiable
                within the Discord server.
              </div>
            </div>
          </section>

          <section className="prize-area">
            <div className="prize-heading">
              <div className="section-label">
                Available Promos
              </div>

              <div className="prize-code">
                BOOM // 008—013
              </div>
            </div>

            <div className="promo-grid">
              {promos.map((src, index) => (
                <div
                  className="promo"
                  key={src}
                >
                  <img
                    src={src}
                    alt={`SDCC Boom Promo ${index + 8}`}
                  />

                  <div className="promo-number">
                    SDCC-{String(index + 8).padStart(3, "0")}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <div className="footer">
          <span>
            MLPEKAYOU // SDCC BOOM PROMOS
          </span>

          <span>
            SECURE GIVEAWAY PROTOCOL
          </span>
        </div>
      </div>
    </div>
  );
}