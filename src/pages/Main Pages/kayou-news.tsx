import React, { useState } from "react";


type Product = {
  date: string;
  title: string;
  notes: string;
};

type Activation = {
  date: string;
  location: string;
  activity: string;
  notes: string;
};

type Tab = "products" | "sdcc";

export default function KayouNews() {
  const [activeTab, setActiveTab] = useState<Tab>("sdcc");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const upcomingProducts: Product[] = [
    {
      date: "August 2026",
      title: "My Little Pony TCG: Discord!",
      notes: "",
    },
    {
      date: "October 2026",
      title: "Moon Edition: Four",
      notes: "Date subject to change.",
    },
    {
      date: "November 2026",
      title: "Fun Moments Edition: Three",
      notes: "Date subject to change.",
    },
  ];

  const sdccActivations: Activation[] = [
    {
      date: "DAILY",
      location: "PETCO PARK, LEXUS PREMIER LOT",
      activity: "No SDCC activations announced.",
      notes: "—",
    },
  ];

  const sectionStyle: React.CSSProperties = {
    background: "#202020",
    border: "1px solid rgba(255,210,60,.15)",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 12px 32px rgba(0,0,0,.4)",
  };

  const headingStyle: React.CSSProperties = {
    padding: "20px 28px",
    fontSize: 30,
    fontWeight: 800,
    color: "#FFD23C",
    borderBottom: "1px solid rgba(255,210,60,.15)",
    background: "#262626",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thStyle: React.CSSProperties = {
    padding: "16px 24px",
    textAlign: "left",
    background: "#2A2A2A",
    color: "#FFD23C",
    fontWeight: 700,
  };

  const tdStyle: React.CSSProperties = {
    padding: "18px 24px",
    borderBottom: "1px solid rgba(255,255,255,.05)",
    color: "#F5F5F5",
  };

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return (
<section style={sectionStyle}>
  <div style={headingStyle}>Upcoming Products & Release Dates</div>

  {window.innerWidth <= 768 ? (
    <div style={{ padding: 20 }}>
      {upcomingProducts.map((product, index) => (
        <div
          key={index}
          style={{
            background: "#262626",
            border: "1px solid rgba(255,210,60,.15)",
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#FFD23C",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Release Date
          </div>

          <div
            style={{
              color: "#FFF",
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            {product.date}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#FFD23C",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Product
          </div>

          <div
            style={{
              color: "#FFF",
              fontSize: 18,
              marginBottom: 18,
            }}
          >
            {product.title}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#FFD23C",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Notes
          </div>

          <div
            style={{
              color: "#E0E0E0",
              fontSize: 16,
            }}
          >
            {product.notes || "—"}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Release Date</th>
          <th style={thStyle}>Product</th>
          <th style={thStyle}>Notes</th>
        </tr>
      </thead>

      <tbody>
        {upcomingProducts.map((product, index) => (
          <tr key={index}>
            <td style={tdStyle}>{product.date}</td>
            <td style={tdStyle}>{product.title}</td>
            <td style={tdStyle}>{product.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</section>
        );

case "sdcc":
  return (
    <section style={sectionStyle}>
      <div
  style={{
    ...headingStyle,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  }}
>
  <div
    style={{
      fontSize: 15,
      color: "#FFFFFF",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 2,
    }}
  >
    SDCC 2026 • Event 1
  </div>

  <div
    style={{
      fontSize: 34,
      fontWeight: 900,
      color: "#FFD23C",
    }}
  >
    Fan Destination @ Petco Park
  </div>
</div>

      <div
        style={{
          padding: 30,
        }}
      >
<div
  style={{
    marginBottom: 28,
  }}
>
  <div
    style={{
      fontSize: 30,
      fontWeight: 800,
      color: "#FFD23C",
    }}
  >
    Fan Destination
  </div>

  <div
    style={{
      marginTop: 8,
      fontSize: 20,
      color: "#F5F5F5",
    }}
  >
    Interactive Zone @ Petco Park
  </div>

  <div
    style={{
      color: "#BDBDBD",
      marginTop: 4,
      fontSize: 17,
    }}
  >
    Lexus Premier Lot
  </div>
</div>

{window.innerWidth <= 768 && (
  <div
    style={{
      marginBottom: 14,
      textAlign: "center",
      color: "#FFD23C",
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}
  >
    ← SCROLL RIGHT TO SEE MORE INFO →
  </div>
)}

<div
  style={{
    overflowX: window.innerWidth <= 768 ? "auto" : "visible",
    WebkitOverflowScrolling: "touch",
    marginLeft: window.innerWidth <= 768 ? -30 : 0,
    marginRight: window.innerWidth <= 768 ? -30 : 0,
  }}
>
  <table
    style={{
      ...tableStyle,
      minWidth: window.innerWidth <= 768 ? 850 : "100%",
    }}
  >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 220 }}>Schedule</th>
              <th style={thStyle}>Activity</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={tdStyle}>Daily • 10:00–11:30 AM</td>
              <td style={tdStyle}>MLP TCG Demo Play</td>
              <td style={tdStyle}>
                Learn to play the My Little Pony TCG and receive a limited-edition
                My Little Pony promotional card. <strong>Limited capacity.</strong>
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>Daily • 10:00 AM</td>
              <td style={tdStyle}>Fandom Celebration Giveaway</td>
              <td style={tdStyle}>
                Randomized giveaway featuring cards from multiple Kayou
                properties.
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>Friday • July 24 • 4:00 PM</td>
              <td style={tdStyle}>
                BOOM! Studios Exclusive Giveaway
              </td>
              <td style={tdStyle}>
                First <strong>200 fans</strong> receive one of six randomized
                SDCC-exclusive My Little Pony × BOOM! Studios cards. Collect all
                six to complete the panoramic artwork illustrated by Andy Price.
              </td>
            </tr>

            <tr>
              <td style={tdStyle}>Sunday • July 26 • 12:00–2:00 PM</td>
              <td style={tdStyle}>Andrea Libman Card Signing</td>
              <td style={tdStyle}>
                First <strong>100 fans</strong> receive a Moon 3 UR Fluttershy or
                Pinkie Pie card.
              </td>
            </tr>
          </tbody>
          </table>
</div>

        <div
          style={{
            marginTop: 28,
            padding: 22,
            borderRadius: 14,
            background: "#2A2A2A",
            borderLeft: "4px solid #FFD23C",
          }}
        >
          <div
            style={{
              color: "#FFD23C",
              fontWeight: 800,
              fontSize: 18,
              marginBottom: 14,
            }}
          >
            Important Information
          </div>

          <ul
            style={{
              margin: 0,
              paddingLeft: 22,
              color: "#E8E8E8",
              lineHeight: 1.9,
            }}
          >
            <li>Bracelets will be available beginning at 11:00 AM at the Check-in Counter.</li>
            <li>Only Kayou My Little Pony trading cards will be signed.</li>
            <li>No other merchandise or items may be signed.</li>
            <li>One autographed card per guest.</li>
            <li>Choice of Fluttershy or Pinkie Pie is not guaranteed.</li>
          </ul>
        </div>
      </div>
<section style={sectionStyle}>
  <div
  style={{
    ...headingStyle,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  }}
>
  <div
    style={{
      fontSize: 15,
      color: "#FFFFFF",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 2,
    }}
  >
    SDCC 2026 • Event 2
  </div>

  <div
    style={{
      fontSize: 34,
      fontWeight: 900,
      color: "#FFD23C",
    }}
  >
    Community Hub @ Tito Rick's Garage
  </div>
</div>

  <div
    style={{
      padding: 30,
    }}
  >
<div
  style={{
    marginBottom: 28,
  }}
>
  <div
    style={{
      fontSize: 30,
      fontWeight: 800,
      color: "#FFD23C",
    }}
  >
    Community Hub
  </div>

  <div
    style={{
      marginTop: 8,
      fontSize: 20,
      color: "#F5F5F5",
    }}
  >
    Tito Rick's Garage
  </div>

  <div
    style={{
      color: "#BDBDBD",
      marginTop: 4,
      fontSize: 17,
    }}
  >
    2918 Imperial Ave.
  </div>

  <div
    style={{
      color: "#BDBDBD",
      marginTop: 8,
      fontSize: 17,
    }}
  >
    Thursday–Saturday: 11:00 AM – 8:00 PM<br />
    Sunday: 11:00 AM – 6:00 PM
  </div>
</div>

{window.innerWidth <= 768 && (
  <div
    style={{
      marginBottom: 14,
      textAlign: "center",
      color: "#FFD23C",
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}
  >
    ← SCROLL RIGHT TO SEE MORE INFO →
  </div>
)}

<div
  style={{
    overflowX: window.innerWidth <= 768 ? "auto" : "visible",
    WebkitOverflowScrolling: "touch",
    marginLeft: window.innerWidth <= 768 ? -30 : 0,
    marginRight: window.innerWidth <= 768 ? -30 : 0,
  }}
>
  <table
    style={{
      ...tableStyle,
      minWidth: window.innerWidth <= 768 ? 850 : "100%",
    }}
  >
      <thead>
        <tr>
          <th style={{ ...thStyle, width: 220 }}>Schedule</th>
          <th style={thStyle}>Activity</th>
          <th style={thStyle}>Details</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td style={tdStyle}>Thursday–Sunday</td>
          <td style={tdStyle}>My Little Pony TCG Demo Play</td>
          <td style={tdStyle}>
            Learn to play the My Little Pony Trading Card Game. Demo decks
            will be available, along with staff to teach the game and answer
            questions.
          </td>
        </tr>

        <tr>
          <td style={tdStyle}>Friday • July 24 • 7:00–9:00 PM</td>
          <td style={tdStyle}>
            My Little Pony Fan Meetup & TCG Game Night
          </td>
          <td style={tdStyle}>
            Learn to play the TCG, meet fellow fans, trade cards, win prizes,
            take photos, and receive a My Little Pony TCG promotional card.
            <strong> Limited to the first 200 fans.</strong>
          </td>
        </tr>
      </tbody>
      </table>
</div>

    <div
      style={{
        marginTop: 28,
        padding: 22,
        borderRadius: 14,
        background: "#2A2A2A",
        borderLeft: "4px solid #FFD23C",
      }}
    >
      <div
        style={{
          color: "#FFD23C",
          fontWeight: 800,
          fontSize: 18,
          marginBottom: 14,
        }}
      >
        Important Information
      </div>

      <ul
        style={{
          margin: 0,
          paddingLeft: 22,
          color: "#E8E8E8",
          lineHeight: 1.9,
        }}
      >
        <li>
          Shop official My Little Pony products at the <strong>Petco Park Fan Destination</strong> or the <strong>Kayou Booth (#4934)</strong>.
        </li>
        <li>
          - My Little Pony TCG Starter Decks and Booster Packs (Series 1 &amp; 2) will be available.
        </li>
        <li>
          - My Little Pony collectible cards from <strong>Moon 3</strong>, <strong>Star</strong>, and <strong>Fun Moments</strong> will also be available.
        </li>
      </ul>
    </div>

  </div>
</section>
    </section>
  );
    }
  };

return (
  <div
    onMouseMove={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();

      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }}
    style={{
      position: "relative",
      overflow: "hidden",
      background: "#1C1C1C",
      minHeight: "100vh",
      paddingBottom: 80,
    }}
  >

    <div
      style={{
        position: "absolute",
        left: mouse.x - 250,
        top: mouse.y - 250,
        width: 500,
        height: 500,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(255,210,60,.08) 0%, rgba(255,210,60,.03) 40%, rgba(255,210,60,0) 75%)",
        filter: "blur(40px)",
        transition: "left .08s linear, top .08s linear",
        zIndex: 0,
      }}
    />

    <div
      style={{
        position: "relative",
        zIndex: 1,
      }}
    >

{/* HERO */}

<div
  style={{
    position: "relative",
    width: "100%",
    height: "clamp(420px, 72vh, 850px)",
    minHeight: 420,
    overflow: "hidden",
    background: "#111",
    borderBottom: "2px solid rgba(255,210,60,.18)",
    marginTop: window.innerWidth <= 768 ? -60 : 0,
  }}
>
  <img
    src="/kayou's-assets/SDCCLAUNCHHERO.webp"
    alt="Kayou SDCC"
    style={{
      width: "100%",
      height: "100%",
      objectFit: window.innerWidth <= 768 ? "contain" : "cover",
backgroundColor: "#111",
      objectPosition: "center 28%",
      display: "block",
      userSelect: "none",
      pointerEvents: "none",
    }}
  />

  {/* Fade */}

  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `
        linear-gradient(
          to top,
          rgba(28,28,28,1) 0%,
          rgba(28,28,28,1) 18%,
          rgba(28,28,28,.92) 34%,
          rgba(28,28,28,.65) 50%,
          rgba(28,28,28,.25) 70%,
          rgba(28,28,28,0) 100%
        )
      `,
    }}
  />

  {/* SDCC Text */}

  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "64%",
      transform: "translate(-50%, -50%)",
      width: "92%",
      textAlign: "center",
      zIndex: 2,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        color: "#FFD23C",
        fontSize: "clamp(15px, 2vw, 28px)",
        fontWeight: 900,
        letterSpacing: "clamp(1px, .35vw, 2px)",
        textTransform: "uppercase",
        textShadow: "0 4px 20px rgba(0,0,0,.75)",
      }}
    >
      SAN DIEGO COMIC CON
    </div>

    <div
      style={{
        marginTop: 10,
        color: "#FFD23C",
        fontSize: "clamp(12px, 1.3vw, 18px)",
        fontWeight: 700,
        letterSpacing: "clamp(2px, .45vw, 3px)",
        textTransform: "uppercase",
        textShadow: "0 4px 20px rgba(0,0,0,.75)",
      }}
    >
      JULY 23–26
    </div>
  </div>

  {/* Bottom Content */}

  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      padding: "clamp(20px,4vw,48px)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 24,
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        flex: "1 1 500px",
        minWidth: 0,
      }}
    >
      <h1
        style={{
          margin: 0,
          color: "#FFD23C",
          fontSize: "clamp(36px,6vw,64px)",
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        Kayou News
      </h1>

      <p
        style={{
          marginTop: 14,
          marginBottom: 0,
          color: "#E8E8E8",
          fontSize: "clamp(15px,2vw,21px)",
          maxWidth: 700,
          lineHeight: 1.5,
        }}
      >
        Official announcements, release dates, convention appearances and
        product launches.
      </p>
    </div>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "flex-end",
        flex: "0 1 auto",
      }}
    >
      {[
        { id: "sdcc", label: "SDCC" },
        { id: "products", label: "Products" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as Tab)}
          style={{
            padding: "14px 26px",
            minWidth: 130,
            borderRadius: 14,
            border:
              activeTab === tab.id
                ? "2px solid #FFD23C"
                : "2px solid rgba(255,255,255,.18)",
            background:
              activeTab === tab.id
                ? "#FFD23C"
                : "rgba(0,0,0,.55)",
            color: activeTab === tab.id ? "#111" : "#FFF",
            fontWeight: 700,
            fontSize: "clamp(15px,1.3vw,17px)",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: ".2s",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
</div>

      {/* CONTENT */}

      <div
        style={{
          maxWidth: 1450,
          margin: "48px auto 80px",
          padding: "0 24px",
        }}
      >
        {renderContent()}
      </div>

    </div>

  </div>
);
}