import keeganPfp from "@/assets/avatars/keeganpfp.webp";

export default function LinksPage() {
  const links = [
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@keanaex?is_from_webapp=1&sender_device=pc",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/sammikiii/",
    },
    {
      label: "Discord",
      href: "https://discord.gg/mlpekayou",
    },
    {
      label: "MLPEKayou",
      href: "https://www.mlpekayou.com/",
    },
    {
      label: "MyPrismaTCG",
      href: "https://www.myprismatcg.com/",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
        paddingLeft: "20px",
        paddingRight: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: "4px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #FFF4C2 0%, #D4AF37 25%, #FFF8D8 50%, #B8860B 75%, #FFF4C2 100%)",
          boxShadow:
            "0 0 12px rgba(212,175,55,0.35), 0 6px 18px rgba(212,175,55,0.2)",
        }}
      >
        <img
          src={keeganPfp}
          alt="Keegan"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <h1
        style={{
          marginTop: "20px",
          marginBottom: 0,
          fontFamily: "'Fredoka', sans-serif",
          fontSize: "36px",
          fontWeight: 600,
          textAlign: "center",
          background:
            "linear-gradient(180deg, #F9E7A3 0%, #D4AF37 50%, #A67C00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 2px 6px rgba(212,175,55,0.15)",
        }}
      >
        Keegan's Links
      </h1>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginTop: "36px",
        }}
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "66px",
              padding: "18px 24px",
              borderRadius: "9999px",
              textDecoration: "none",
              position: "relative",
              overflow: "hidden",
              boxSizing: "border-box",

              color: "#4D3A17",
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "0.02em",

              background:
                "linear-gradient(180deg, #FFFEFB 0%, #FFF8EE 100%)",

              border: "2px solid transparent",

              backgroundImage: `
                linear-gradient(#FFFDF8, #FFF6E9),
                linear-gradient(
                  135deg,
                  #FFF4C2 0%,
                  #D4AF37 25%,
                  #FFF8D8 50%,
                  #B8860B 75%,
                  #FFF4C2 100%
                )
              `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",

              boxShadow:
                "0 3px 10px rgba(212,175,55,0.18), " +
                "0 10px 24px rgba(212,175,55,0.12), " +
                "inset 0 1px 0 rgba(255,255,255,0.95)",

              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "-40%",
                width: "30%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                transform: "skewX(-20deg)",
              }}
            />

            <span
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}