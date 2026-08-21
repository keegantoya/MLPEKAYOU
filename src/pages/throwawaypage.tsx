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
    <div className="giveaway-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Fredoka:wght@400;500;600;700&family=Oxanium:wght@500;600;700&display=swap");

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          background: #fbeaf5;
        }

        .giveaway-page {
          min-height: 100vh;
          width: 100%;
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            radial-gradient(circle at 7% 10%, rgba(255,183,215,.82), transparent 24%),
            radial-gradient(circle at 93% 9%, rgba(204,188,255,.80), transparent 25%),
            radial-gradient(circle at 6% 94%, rgba(255,221,184,.76), transparent 25%),
            radial-gradient(circle at 95% 92%, rgba(201,226,255,.70), transparent 26%),
            linear-gradient(135deg, #fff1f8 0%, #f9efff 48%, #eef5ff 100%);
          font-family: "Fredoka", sans-serif;
        }

        .page {
          position: relative;
          width: min(1540px, 100%);
          min-height: 850px;
          overflow: hidden;
          border: 3px solid rgba(255,255,255,.98);
          border-radius: 42px;
          background:
            radial-gradient(circle at 72% 50%, rgba(255,255,255,.92), transparent 32%),
            radial-gradient(circle at 14% 78%, rgba(255,187,219,.30), transparent 30%),
            radial-gradient(circle at 88% 76%, rgba(205,191,255,.30), transparent 30%),
            rgba(255,255,255,.58);
          box-shadow:
            0 35px 100px rgba(115,75,133,.19),
            inset 0 0 0 1px rgba(255,255,255,.85);
        }

        .page::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 11% 19%, white 0 2px, transparent 3px),
            radial-gradient(circle at 23% 8%, white 0 2px, transparent 3px),
            radial-gradient(circle at 43% 15%, white 0 2px, transparent 3px),
            radial-gradient(circle at 63% 8%, white 0 2px, transparent 3px),
            radial-gradient(circle at 83% 18%, white 0 2px, transparent 3px),
            radial-gradient(circle at 94% 42%, white 0 2px, transparent 3px),
            radial-gradient(circle at 10% 82%, white 0 2px, transparent 3px),
            radial-gradient(circle at 90% 84%, white 0 2px, transparent 3px);
          opacity: .65;
        }

        .cloud {
          position: absolute;
          z-index: 1;
          pointer-events: none;
          border-radius: 999px;
          background: rgba(255,255,255,.62);
          filter: blur(.4px);
        }

        .cloud.left {
          width: 310px;
          height: 88px;
          left: -90px;
          top: 110px;
          box-shadow:
            70px -28px 0 8px rgba(255,255,255,.62),
            145px 0 0 17px rgba(255,255,255,.62),
            220px -23px 0 5px rgba(255,255,255,.62);
        }

        .cloud.right {
          width: 300px;
          height: 88px;
          right: -90px;
          bottom: 55px;
          box-shadow:
            -70px -27px 0 8px rgba(255,255,255,.62),
            -145px 0 0 17px rgba(255,255,255,.62),
            -220px -22px 0 5px rgba(255,255,255,.62);
        }

        .rainbow {
          position: absolute;
          left: -120px;
          bottom: -145px;
          width: 470px;
          height: 255px;
          border: 20px solid rgba(255,183,215,.36);
          border-bottom: 0;
          border-radius: 470px 470px 0 0;
          transform: rotate(-8deg);
          box-shadow:
            0 -24px 0 rgba(255,220,181,.34),
            0 -48px 0 rgba(210,195,255,.34),
            0 -72px 0 rgba(182,220,255,.30);
        }

        .sparkle {
          position: absolute;
          z-index: 2;
          color: white;
          text-shadow: 0 0 16px rgba(255,255,255,.98);
          pointer-events: none;
        }

        .sparkle.one { left: 7%; top: 25%; font-size: 31px; }
        .sparkle.two { left: 29%; top: 7%; font-size: 20px; }
        .sparkle.three { right: 5%; top: 22%; font-size: 36px; }
        .sparkle.four { right: 35%; bottom: 9%; font-size: 22px; }
        .sparkle.five { left: 52%; bottom: 8%; font-size: 18px; }

        .header {
          position: relative;
          z-index: 4;
          padding: 34px 55px 0;
          text-align: center;
        }

        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 21px;
          border: 2px solid rgba(255,255,255,.98);
          border-radius: 999px;
          background: rgba(255,255,255,.76);
          color: #a06fae;
          box-shadow: 0 7px 20px rgba(110,73,128,.08);
          font: 700 10px "Oxanium", sans-serif;
          letter-spacing: .19em;
          text-transform: uppercase;
        }

        .kicker::before,
        .kicker::after {
          content: "♥";
          color: #ed83ae;
          font-size: 9px;
        }

        .title {
          margin: 12px 0 0;
          color: #e86da4;
          font-family: "DM Serif Display", serif;
          font-size: clamp(58px, 6vw, 94px);
          line-height: .88;
          letter-spacing: -.035em;
          text-shadow:
            0 4px 0 white,
            0 7px 0 rgba(187,123,174,.18);
        }

        .title span {
          color: #9676d1;
        }

        .subtitle {
          margin-top: 10px;
          color: #84608d;
          font: 700 12px "Oxanium", sans-serif;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .content {
          position: relative;
          z-index: 4;
          min-height: 620px;
          padding: 35px 55px 60px;
          display: grid;
          grid-template-columns: 32% 68%;
          gap: 34px;
          align-items: center;
        }

        .left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 15px;
        }

        .left-title {
          margin: 0;
          color: #6a4574;
          font-family: "DM Serif Display", serif;
          font-size: clamp(38px, 3.5vw, 56px);
          line-height: .94;
          letter-spacing: -.025em;
        }

        .left-title em {
          color: #e878aa;
          font-style: normal;
        }

        .left-copy {
          margin: 16px 0 25px;
          max-width: 440px;
          color: #83678d;
          font-size: 17px;
          line-height: 1.5;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail {
          min-height: 105px;
          padding: 18px 19px;
          border: 2px solid rgba(255,255,255,.97);
          border-radius: 22px;
          background: rgba(255,255,255,.73);
          box-shadow: 0 12px 28px rgba(108,73,126,.10);
        }

        .detail.host {
          grid-column: 1 / -1;
        }

        .detail-label {
          color: #a076b2;
          font: 700 9px "Oxanium", sans-serif;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .detail-value {
          margin-top: 7px;
          color: #704a7b;
          font-size: 27px;
          line-height: 1;
          font-weight: 700;
        }

        .detail-value.pink {
          color: #e96fa5;
        }

        .detail-value.purple {
          color: #8d69c2;
          font-size: 20px;
        }

        .prizes {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 28px;
        }

        .prize {
          position: relative;
          width: 350px;
          min-height: 570px;
          padding: 25px 20px 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 3px solid rgba(255,255,255,.98);
          border-radius: 34px;
          box-shadow:
            0 22px 46px rgba(107,72,124,.14),
            inset 0 0 0 1px rgba(224,181,225,.18);
        }

        .prize.rose {
          background: linear-gradient(180deg, rgba(255,232,246,.94), rgba(255,255,255,.69));
        }

        .prize.lilac {
          background: linear-gradient(180deg, rgba(239,233,255,.95), rgba(255,255,255,.69));
        }

        .ribbon {
          position: absolute;
          top: -18px;
          left: 50%;
          z-index: 6;
          transform: translateX(-50%);
          padding: 10px 22px;
          white-space: nowrap;
          border: 2px solid white;
          border-radius: 999px;
          color: white;
          font: 700 11px "Oxanium", sans-serif;
          letter-spacing: .09em;
          box-shadow: 0 8px 17px rgba(106,70,122,.16);
        }

        .rose .ribbon {
          background: linear-gradient(135deg,#f38fba,#db6fa5);
        }

        .lilac .ribbon {
          background: linear-gradient(135deg,#ad91e0,#8d70c7);
        }

        .prize-heading {
          margin-top: 4px;
          color: #795581;
          font: 700 11px "Oxanium", sans-serif;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .prize.rose .prize-heading {
          color: #d879a4;
        }

        .prize.lilac .prize-heading {
          color: #8f73c7;
        }

        /*
          LARGE, NORMAL TRADING-CARD FRAME.
          The frame is intentionally bigger than before.
          The source is rendered at 1.15x so the baked black border
          is reduced without destroying the actual card artwork.
        */
        .promo-frame {
          position: relative;
          width: 275px;
          height: 400px;
          margin-top: 13px;
          overflow: hidden;
          border: 4px solid white;
          border-radius: 9px !important;
          overflow: clip;
          clip-path: inset(0 0 0 0 round 9px);
          isolation: isolate;
          background: white;
          box-shadow:
            0 18px 32px rgba(71,47,83,.22),
            0 0 22px rgba(255,184,216,.18);
        }

        .promo-frame img {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 100%;
          height: 100%;
          max-width: none;
          display: block;
          object-fit: cover;
          object-position: center;
          border-radius: 9px !important;
          clip-path: inset(0 round 9px);
          transform: translate(-50%, -50%);
          transform-origin: center;
        }

        /* RR07: essentially full artwork — only a tiny crop. */
        .promo-frame.promo-one img {
          transform: translate(-50%, -50%) scale(1.015);
        }

        /* RR09: needs a stronger crop to remove its baked-in black bars. */
        .promo-frame.promo-two img {
          transform: translate(-50%, -50%) scale(1.06);
        }

        .promo-note {
          margin-top: 13px;
          color: #8b6b95;
          font: 700 9px "Oxanium", sans-serif;
          letter-spacing: .17em;
          text-transform: uppercase;
        }

        .footer {
          position: absolute;
          z-index: 6;
          left: 55px;
          right: 55px;
          bottom: 15px;
          display: flex;
          justify-content: space-between;
          color: rgba(106,72,120,.50);
          font: 700 7px "Oxanium", sans-serif;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .footer strong {
          color: #d476a5;
        }

        @media (max-width: 1150px) {
          .page {
            min-height: 1050px;
          }

          .content {
            grid-template-columns: 1fr;
            min-height: 900px;
          }

          .left {
            align-items: center;
            text-align: center;
            padding-right: 0;
          }

          .left-copy {
            margin-left: auto;
            margin-right: auto;
          }

          .details {
            width: min(620px, 100%);
          }

          .prizes {
            width: 100%;
          }
        }

        @media (max-width: 700px) {
          .giveaway-page {
            padding: 8px;
          }

          .page {
            min-height: auto;
            border-radius: 25px;
          }

          .header {
            padding: 25px 14px 0;
          }

          .title {
            font-size: 46px;
          }

          .subtitle {
            font-size: 8px;
            letter-spacing: .08em;
          }

          .content {
            padding: 28px 14px 48px;
            min-height: auto;
            gap: 30px;
          }

          .left {
            text-align: center;
          }

          .left-title {
            font-size: 36px;
          }

          .left-copy {
            font-size: 14px;
          }

          .details {
            grid-template-columns: 1fr;
          }

          .detail.host {
            grid-column: auto;
          }

          .prizes {
            gap: 9px;
          }

          .prize {
            width: calc(50% - 4px);
            min-height: 405px;
            padding: 19px 7px 14px;
            border-radius: 20px;
          }

          .ribbon {
            top: -13px;
            padding: 7px 10px;
            font-size: 7px;
          }

          .prize-heading {
            font-size: 6px;
          }

          .promo-frame {
            width: 155px;
            height: 225px;
            border-width: 3px;
            border-radius: 9px !important;
            overflow: clip;
            clip-path: inset(0 0 0 0 round 9px);
          }

          .promo-note {
            font-size: 5px;
          }

          .footer {
            left: 14px;
            right: 14px;
            font-size: 5px;
          }

          .footer span:first-child {
            display: none;
          }
        }
      `}</style>

      <div className="page">
        <div className="cloud left" />
        <div className="cloud right" />
        <div className="rainbow" />

        <div className="sparkle one">✦</div>
        <div className="sparkle two">✧</div>
        <div className="sparkle three">✦</div>
        <div className="sparkle four">✧</div>
        <div className="sparkle five">✦</div>

        <header className="header">
          <div className="kicker">US EXCLUSIVE GIVEAWAY</div>

          <h1 className="title">
            A LITTLE BIT OF <span>MAGIC</span>
          </h1>

          <div className="subtitle">
            Two special KAYOU promos • Two lucky winners • Ends in 24 hours
          </div>
        </header>

        <main className="content">
          <section className="left">
            <h2 className="left-title">
              Something <em>special</em>
              <br />
              is waiting for you!!
            </h2>

            <p className="left-copy">
              Two Anime Expo KAYOU promo cards are ready to find new homes.
              Winners will get these promos fully tracked and protected in a box.
            </p>

            <div className="details">
              <div className="detail">
                <div className="detail-label">Exclusive To</div>
                <div className="detail-value pink">UNITED STATES PARTICIPANTS</div>
              </div>

              <div className="detail">
                <div className="detail-label">Ends In</div>
                <div className="detail-value pink">48 HOURS</div>
              </div>

              <div className="detail host">
                <div className="detail-label">Hosted By</div>
                <div className="detail-value purple">
                  KAYOUUS × MLPEKAYOU
                </div>
              </div>
            </div>
          </section>

          <section className="prizes">
            {prizes.map((prize) => (
              <article className={`prize ${prize.className}`} key={prize.src}>
                <div className="ribbon">{prize.ribbon}</div>

                <div className="prize-heading">{prize.title}</div>

                <div className={`promo-frame ${prize.className === "rose" ? "promo-one" : "promo-two"}`}>
                  <img
                    src={prize.src}
                    alt={`${prize.title} KAYOU promo`}
                  />
                </div>

                <div className="promo-note">ANIME EXPO PROMO</div>
              </article>
            ))}
          </section>
        </main>

        <footer className="footer">
          <span>MY LITTLE PONY • KAYOU • SPECIAL PROMO GIVEAWAY</span>
          <strong>KAYOUUS × MLPEKAYOU</strong>
        </footer>
      </div>
    </div>
  );
}