import { profileViewGroup, profileViewSquare, isProfileMerchandiseHidden } from "@/lib/english-card-views";
import { profileViewCard as englishViewCard, profileViewEligible as englishViewEligible, profileViewName as englishViewName, profileViewCode as englishViewCode, profileViewImage as englishViewImage, profileViewStyle as englishViewStyle, profileViewWide as englishViewWide, compareProfileViewCards as compareEnglishViewCards, ownedEnglishViewCards, missingProfileViewCards as missingEnglishViewCards, readEnglishViewRows } from "@/lib/english-card-views";
import { ChineseProfileCards, ProfileCardLanguageSwitch, usePublicChineseProfile, type ProfileCardLanguage } from "@/pages/Chinese Kayou/Chinese ISO/PublicChineseCards";
import ProfileRarestShowcase, { profileShowcaseStyles } from "./ProfileRarestShowcase";
import ProfileAvatar from "@/components/ProfileAvatar";
import CardImage from "@/components/CardImage";
import { useEffect, useId, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getProfileAssets } from "../Everypony/profile-assets";
import NotFound from "../NotFound";
const publicProfileStyles = `
.pp-upgrade{--pp-accent:#e7c84b;--pp-line:#ffffff15;--pp-panel:#181b1e;--pp-soft:#22262a;--pp-ink:#f4f4f5;--pp-muted:#9ca3af}.light .pp-upgrade,[data-theme="light"] .pp-upgrade{--pp-line:#19242d18;--pp-panel:#fff;--pp-soft:#f1f3f5;--pp-ink:#20262b;--pp-muted:#68727b}.spooky .pp-upgrade,[data-theme="spooky"] .pp-upgrade{--pp-accent:#be9af9}.pp-shell{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:20px;width:100%;max-width:none;margin:0}.pp-shell>section:first-of-type{grid-column:1;align-self:stretch;border-radius:22px}.pp-stats{grid-column:2;display:flex;flex-direction:column;justify-content:center;gap:0;background:var(--pp-panel);border:1px solid var(--pp-line);border-radius:22px;padding:22px;color:var(--pp-ink)}.pp-owned{padding-bottom:18px}.pp-owned>span{display:block;font-size:10px;letter-spacing:.09em;color:var(--pp-muted)}.pp-owned strong{display:block;font-size:42px;line-height:1.1;font-weight:700;letter-spacing:-.04em;margin:9px 0 6px;color:var(--pp-accent)}.pp-owned>span:last-child{font-size:12px;letter-spacing:0}.pp-metric{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-top:1px solid var(--pp-line);font-size:12px;color:var(--pp-muted)}.pp-metric strong{font-size:15px;color:var(--pp-ink)}.pp-showcase{grid-column:1 / -1;min-width:0;margin-top:4px}.pp-showcase-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:4px 0 18px}.pp-eyebrow{font-size:10px;letter-spacing:.12em;color:var(--pp-accent);font-weight:650}.pp-showcase-heading h2{font-size:25px;font-weight:650;letter-spacing:-.03em;margin:5px 0 0;color:var(--pp-ink)}.pp-showcase-heading p{font-size:12px;color:var(--pp-muted);margin:0}.pp-tabs{display:flex;gap:8px;overflow-x:auto;margin-bottom:16px;padding:2px 2px 5px}.pp-tabs button{display:flex;align-items:center;gap:22px;justify-content:space-between;flex:1;min-width:135px;min-height:48px;padding:11px 16px;border:1px solid var(--pp-line);border-radius:12px;background:var(--pp-panel);font-size:13px;color:var(--pp-muted);cursor:pointer;transition:background .2s,transform .2s}.pp-tabs button>span:last-child{font-size:11px;opacity:.7}.pp-tabs button[aria-pressed="true"]{background:var(--pp-accent);border-color:var(--pp-accent);color:#19151f;font-weight:650}.pp-tabs button:hover{transform:translateY(-1px)}.pp-gallery{animation:pp-reveal .25s ease both}.pp-gallery>div:last-child:not(.text-center){gap:12px}.pp-upgrade button:focus-visible{outline:2px solid var(--pp-accent);outline-offset:3px}.pp-embedded{gap:14px}.pp-embedded .pp-owned strong{font-size:32px}@keyframes pp-reveal{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:850px){.pp-shell{grid-template-columns:1fr;gap:16px}.pp-shell>section:first-of-type{grid-column:1}.pp-stats{grid-column:1;display:grid;grid-template-columns:minmax(100px,1.3fr) repeat(3,minmax(0,1fr));padding:16px;gap:12px;border-radius:18px;align-items:center}.pp-owned{padding:0}.pp-owned strong{font-size:30px;margin:6px 0 4px}.pp-owned>span{font-size:8px}.pp-owned>span:last-child{font-size:10px}.pp-metric{display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:0 0 0 12px;border-top:0;border-left:1px solid var(--pp-line);font-size:10px}.pp-metric strong{font-size:17px}.pp-showcase-heading{align-items:start;flex-direction:column;gap:8px;margin-bottom:14px}.pp-showcase-heading h2{font-size:23px}.pp-tabs{gap:7px;margin-bottom:12px}.pp-tabs button{flex:none;min-width:128px;min-height:44px;padding:10px 12px;font-size:12px;gap:18px}}
@media(max-width:380px){.pp-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.pp-owned{grid-row:1 / span 2}.pp-metric:last-child{grid-column:2}}
@media(prefers-reduced-motion:reduce){.pp-gallery{animation:none}.pp-tabs button{transition:none;transform:none}}
.pp-shell{grid-template-columns:minmax(0,1fr) 280px;gap:16px}.pp-shell>section:first-of-type{align-self:start;border-radius:18px}.pp-stats{align-self:start;padding:16px 18px;border-radius:18px}.pp-owned{padding-bottom:10px}.pp-owned strong{font-size:29px;margin:5px 0}.pp-metric{padding:7px 0}.pp-metric strong{font-size:13px}.pp-identity{margin-top:8px}.pp-name{font-size:25px!important;line-height:1.2!important}.pp-avatar{width:72px!important;height:72px!important;border-radius:18px!important}.pp-showcase{margin-top:0}.pp-showcase-heading{margin:0 0 12px}.pp-showcase-heading h2{font-size:21px}.pp-showcase-heading>p{display:none}.pp-tabs{margin-bottom:12px}.pp-tabs button{min-height:42px;padding:9px 13px}.pp-gallery{padding:14px!important;border-radius:18px!important}.pp-preview-grid{grid-template-columns:repeat(auto-fill,minmax(110px,145px))!important;gap:12px!important;justify-content:start}.pp-gallery>div:first-child{margin-bottom:12px!important}.pp-preview-grid>div{min-width:0}
@media(max-width:850px){.pp-shell{grid-template-columns:1fr;gap:12px}.pp-stats{grid-column:1;display:grid;grid-template-columns:1.3fr repeat(3,minmax(0,1fr));gap:10px;padding:12px 14px}.pp-owned{padding:0}.pp-owned strong{font-size:26px}.pp-metric{padding:0 0 0 10px}.pp-avatar{width:60px!important;height:60px!important}.pp-name{font-size:23px!important}.pp-preview-grid{grid-template-columns:repeat(auto-fill,minmax(100px,135px))!important}}
@media(max-width:480px){.pp-preview-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}.pp-stats{grid-template-columns:1.2fr repeat(3,minmax(0,1fr));gap:8px}.pp-owned strong{font-size:24px}.pp-metric{grid-column:auto!important;grid-row:auto!important;font-size:9px;padding-left:8px}.pp-owned{grid-row:auto!important}.pp-tabs button{min-width:115px;font-size:11px}.pp-identity{align-items:flex-start;gap:12px}}
`;
function ProfilePixelTwilight() {
const id = useId().replace(/:/g, "");
const outline = "M6 10H7 M6 9V10 M6 9H7 M7 9H8 M8 10H9 M8 9H9 M10 9V10 M9 9H10 M13 10H14 M13 9V10 M13 9H14 M14 10H15 M14 9H15 M15 10H16 M15 9H16 M16 10H17 M16 9H17 M18 9V10 M17 10H18 M17 9H18 M25 9V10 M25 9H26 M26 9H27 M27 10H28 M27 9H28 M28 10H29 M28 9H29 M29 9H30 M31 9V10 M30 9H31 M7 10V11 M6 10V11 M8 10V11 M7 11H8 M9 10V11 M8 11H9 M10 10V11 M13 10V11 M18 10V11 M25 10V11 M27 10V11 M26 11H27 M27 11H28 M29 10V11 M28 11H29 M31 10V11 M6 11V12 M8 11V12 M11 11V12 M10 12H11 M10 11H11 M11 11H12 M12 11H13 M18 11H19 M19 11H20 M20 11H21 M22 11V12 M21 11H22 M26 11V12 M25 11V12 M27 11V12 M32 11V12 M31 12H32 M31 11H32 M6 12V13 M8 12V13 M8 13H9 M10 12V13 M10 13H11 M11 13H12 M17 13H18 M18 13H19 M22 12V13 M26 12V13 M25 13H26 M25 12V13 M27 12V13 M31 12V13 M32 12V13 M6 13V14 M9 13V14 M9 14H10 M12 13V14 M12 14H13 M17 13V14 M16 14H17 M19 13V14 M22 13H23 M23 13H24 M24 13H25 M27 13V14 M31 13V14 M32 13V14 M31 14H32 M6 14V15 M5 15H6 M5 14V15 M5 14H6 M10 14V15 M10 15H11 M13 14V15 M16 14V15 M19 14V15 M18 15H19 M27 14V15 M29 15H30 M32 15H33 M32 14H33 M34 14V15 M33 15H34 M33 14H34 M5 15V16 M11 15V16 M11 16H12 M13 15V16 M12 16H13 M14 16H15 M16 15V16 M15 16H16 M18 15V16 M27 15V16 M26 16H27 M29 15V16 M30 15V16 M32 15V16 M34 15V16 M5 16V17 M14 16V17 M13 17H14 M16 17H17 M18 16V17 M17 17H18 M26 16V17 M29 16V17 M30 16V17 M32 16V17 M34 16V17 M5 17V18 M4 18H5 M4 17V18 M4 17H5 M13 17V18 M12 18H13 M16 17V18 M16 18H17 M18 17V18 M17 18H18 M24 18H25 M26 17V18 M25 18H26 M29 17V18 M30 17V18 M32 17V18 M34 17V18 M3 18V19 M3 18H4 M12 18V19 M11 19H12 M16 18V19 M24 18V19 M29 18V19 M30 18V19 M29 19H30 M32 18V19 M32 19H33 M34 18V19 M3 19V20 M11 19V20 M16 19V20 M24 19V20 M33 19V20 M32 20H33 M34 19V20 M3 20V21 M11 20V21 M16 20V21 M24 20V21 M24 21H25 M25 21H26 M26 21H27 M32 20V21 M34 20V21 M2 21V22 M1 21V22 M1 21H2 M2 21H3 M11 21V22 M11 22H12 M12 22H13 M13 22H14 M14 22H15 M16 21V22 M15 22H16 M24 22H25 M25 22H26 M27 21V22 M26 22H27 M32 21V22 M31 22H32 M34 21V22 M2 22V23 M1 22V23 M24 22V23 M31 22V23 M34 22V23 M2 23V24 M1 24H2 M1 23V24 M2 24H3 M3 24H4 M4 24H5 M5 24H6 M6 24H7 M7 24H8 M8 24H9 M9 24H10 M11 24H12 M12 24H13 M13 24H14 M16 24H17 M17 24H18 M18 24H19 M22 24H23 M24 23V24 M23 24H24 M24 24H25 M25 24H26 M26 24H27 M31 23V24 M34 23V24 M10 24V25 M9 24V25 M11 24V25 M14 24V25 M16 24V25 M16 25H17 M17 25H18 M19 24V25 M18 25H19 M22 24V25 M22 25H23 M24 24V25 M27 24V25 M31 24V25 M34 24V25 M10 25V26 M9 25V26 M11 25V26 M14 25V26 M16 25V26 M16 26H17 M17 26H18 M19 25V26 M18 26H19 M22 25V26 M23 25V26 M22 26H23 M24 25V26 M24 26H25 M25 26H26 M27 25V26 M26 26H27 M31 25V26 M34 25V26 M35 25V26 M34 26H35 M34 25H35 M10 26V27 M9 26V27 M11 26V27 M14 26V27 M16 27H17 M17 27H18 M22 26V27 M24 26V27 M31 26V27 M35 26V27 M10 27V28 M9 27V28 M11 27V28 M10 28H11 M14 27V28 M16 27V28 M18 27V28 M17 28H18 M22 27V28 M22 28H23 M24 27V28 M31 27V28 M35 27V28 M51 27V28 M51 27H52 M52 27H53 M53 27H54 M54 27H55 M55 27H56 M56 27H57 M57 27H58 M59 27V28 M58 27H59 M9 29H10 M9 28V29 M10 29H11 M14 28V29 M16 28V29 M17 28V29 M16 29H17 M18 28V29 M17 29H18 M22 28V29 M21 29H22 M23 28V29 M24 28V29 M23 29H24 M29 29H30 M31 28V29 M30 29H31 M35 28V29 M51 28V29 M59 28V29 M60 28V29 M59 29H60 M59 28H60 M9 29V30 M8 30H9 M8 29V30 M8 29H9 M9 30H10 M11 29V30 M10 30H11 M14 29V30 M19 30H20 M21 29V30 M20 30H21 M22 29V30 M21 30H22 M29 29V30 M35 29V30 M48 29V30 M48 29H49 M49 29H50 M50 29H51 M53 30H54 M56 30H57 M60 29H61 M62 29V30 M61 29H62 M9 30V31 M8 30V31 M11 31H12 M12 31H13 M14 30V31 M16 31H17 M17 31H18 M19 30V31 M18 31H19 M19 31H20 M20 31H21 M22 31H23 M23 31H24 M29 30V31 M35 30V31 M46 31H47 M46 30V31 M46 30H47 M48 30V31 M47 31H48 M47 30H48 M53 30V31 M54 30V31 M54 31H55 M56 30V31 M55 31H56 M57 30V31 M57 31H58 M62 30V31 M62 31H63 M62 30H63 M63 31H64 M63 30H64 M65 30V31 M64 31H65 M64 30H65 M9 31V32 M8 31V32 M11 31V32 M11 32H12 M13 31V32 M14 31V32 M14 32H15 M16 31V32 M15 32H16 M16 32H17 M17 32H18 M18 32H19 M19 32H20 M21 31V32 M20 32H21 M22 31V32 M22 32H23 M24 31V32 M23 32H24 M29 31V32 M35 31V32 M46 31V32 M49 32H50 M50 32H51 M51 32H52 M53 31V32 M52 32H53 M57 31V32 M58 31V32 M57 32H58 M58 32H59 M59 32H60 M60 32H61 M65 31V32 M66 31V32 M65 32H66 M65 31H66 M9 32V33 M8 32V33 M12 32V33 M13 32V33 M29 32V33 M35 32H36 M37 32V33 M36 32H37 M45 32V33 M45 32H46 M49 32V33 M50 32V33 M51 32V33 M50 33H51 M58 32V33 M59 32V33 M58 33H59 M60 32V33 M61 32V33 M60 33H61 M67 32V33 M66 32H67 M9 33V34 M8 34H9 M8 33V34 M10 34H11 M12 33V34 M13 33V34 M24 34H25 M25 34H26 M26 34H27 M27 34H28 M29 33V34 M28 34H29 M37 33V34 M45 33V34 M49 33V34 M48 34H49 M50 34H51 M51 34H52 M52 34H53 M53 34H54 M54 34H55 M55 34H56 M56 34H57 M61 33V34 M61 34H62 M67 33V34 M10 34V35 M9 35H10 M9 34V35 M11 34V35 M10 35H11 M12 34V35 M11 35H12 M13 34V35 M12 35H13 M13 35H14 M14 35H15 M15 35H16 M16 35H17 M17 35H18 M18 35H19 M19 35H20 M20 35H21 M21 35H22 M24 34V35 M34 35H35 M37 34V35 M45 34V35 M46 35H47 M48 34V35 M47 35H48 M50 34V35 M49 35H50 M57 34V35 M57 35H58 M58 35H59 M60 35H61 M62 34V35 M62 35H63 M63 35H64 M67 34H68 M69 34V35 M68 34H69 M13 36H14 M13 35V36 M22 35V36 M24 35V36 M34 35V36 M33 36H34 M35 35V36 M37 35V36 M43 35V36 M43 35H44 M44 35H45 M46 35V36 M48 35V36 M47 36H48 M49 35V36 M48 36H49 M59 35V36 M60 35V36 M59 36H60 M61 35V36 M63 35V36 M64 35V36 M63 36H64 M70 35V36 M69 35H70 M71 35V36 M70 36H71 M70 35H71 M14 36V37 M13 37H14 M13 36V37 M14 37H15 M15 37H16 M16 37H17 M17 37H18 M18 37H19 M19 37H20 M20 37H21 M22 36V37 M21 37H22 M24 36V37 M24 37H25 M33 36V37 M33 37H34 M35 36V37 M37 36V37 M43 36V37 M46 36V37 M45 37H46 M47 36V37 M46 37H47 M48 36V37 M47 37H48 M61 36V37 M61 37H62 M64 36V37 M64 37H65 M65 37H66 M71 36V37 M21 38H22 M21 37V38 M25 37V38 M24 38H25 M32 38H33 M34 37V38 M33 38H34 M35 37V38 M37 38H38 M37 37H38 M38 38H39 M38 37H39 M39 38H40 M39 37H40 M40 38H41 M40 37H41 M41 38H42 M41 37H42 M42 38H43 M42 37H43 M43 38H44 M45 37V38 M44 38H45 M46 37V38 M49 38H50 M50 38H51 M51 38H52 M52 38H53 M62 37V38 M66 37V38 M72 37V38 M71 37H72 M22 38V39 M21 38V39 M24 38V39 M32 38V39 M33 39H34 M35 38V39 M34 39H35 M37 38V39 M44 38V39 M44 39H45 M46 38V39 M45 39H46 M49 38V39 M50 39H51 M51 39H52 M53 38V39 M52 39H53 M62 38V39 M62 39H63 M63 39H64 M66 38V39 M72 38V39 M73 38V39 M72 39H73 M72 38H73 M74 38V39 M73 38H74 M22 39V40 M21 39V40 M24 39V40 M32 39V40 M33 39V40 M34 39V40 M33 40H34 M37 39V40 M42 40H43 M45 39V40 M46 40H47 M47 40H48 M49 39V40 M48 40H49 M50 39V40 M49 40H50 M53 40H54 M53 39V40 M54 40H55 M55 40H56 M64 39V40 M63 40H64 M66 39V40 M66 40H67 M74 39V40 M22 40V41 M21 40V41 M24 40V41 M32 40V41 M31 41H32 M34 40V41 M33 41H34 M37 40V41 M40 41H41 M42 40V41 M43 40V41 M42 41H43 M45 40V41 M46 40V41 M45 41H46 M56 40V41 M57 41H58 M63 40V41 M63 41H64 M67 40V41 M75 40V41 M74 40H75 M22 41V42 M21 41V42 M24 41V42 M24 42H25 M31 41V42 M30 42H31 M33 41V42 M32 42H33 M34 41V42 M33 42H34 M35 42H36 M37 41V42 M36 42H37 M40 41V42 M41 41V42 M46 42H47 M46 41H47 M48 41V42 M47 41H48 M57 41V42 M56 42H57 M56 41V42 M58 41V42 M57 42H58 M64 41V42 M67 41V42 M75 41V42 M22 42V43 M21 43H22 M21 42V43 M25 42V43 M27 43H28 M28 43H29 M30 42V43 M29 43H30 M32 42V43 M31 43H32 M35 42V43 M37 43H38 M40 42V43 M39 43H40 M41 42V43 M41 43H42 M42 43H43 M46 42V43 M47 42V43 M48 42V43 M47 43H48 M58 43H59 M58 42V43 M64 42V43 M64 43H65 M67 42V43 M67 43H68 M68 43H69 M75 42V43 M21 44H22 M21 43V44 M25 43V44 M27 43V44 M28 43V44 M29 43V44 M28 44H29 M31 43V44 M35 43V44 M37 43V44 M38 43V44 M39 43V44 M43 43V44 M46 43V44 M48 43V44 M59 43V44 M65 43V44 M68 43V44 M69 43V44 M75 43H76 M77 43V44 M76 43H77 M22 44V45 M21 45H22 M21 44V45 M23 45H24 M25 44V45 M25 45H26 M27 44V45 M26 45H27 M27 45H28 M28 45H29 M29 45H30 M31 44V45 M30 45H31 M35 44V45 M34 45H35 M37 44V45 M38 44V45 M37 45H38 M39 44V45 M39 45H40 M41 45H42 M43 44V45 M42 45H43 M46 44V45 M48 44V45 M59 45H60 M59 44V45 M60 45H61 M65 44V45 M68 44V45 M69 44V45 M77 44V45 M23 45V46 M22 45V46 M24 45V46 M27 45V46 M32 46H33 M34 45V46 M33 46H34 M40 45V46 M39 46H40 M41 45V46 M40 46H41 M43 46H44 M44 46H45 M46 45V46 M48 45V46 M61 45V46 M65 45V46 M65 46H66 M66 46H67 M68 45V46 M69 45V46 M77 45V46 M23 46V47 M22 46V47 M24 46V47 M23 47H24 M27 46V47 M32 46V47 M39 46V47 M40 46V47 M41 47H42 M43 46V47 M42 47H43 M45 46V47 M46 46V47 M48 46V47 M61 46V47 M67 46V47 M68 46V47 M69 46V47 M78 46V47 M77 46H78 M79 46V47 M78 46H79 M22 48H23 M22 47V48 M23 48H24 M24 48H25 M27 47V48 M27 48H28 M28 48H29 M29 48H30 M30 48H31 M32 47V48 M31 48H32 M37 48H38 M39 47V48 M40 47V48 M39 48H40 M41 47V48 M41 48H42 M43 47V48 M42 48H43 M43 48H44 M45 47V48 M44 48H45 M46 47V48 M45 48H46 M46 48H47 M48 47V48 M47 48H48 M61 47V48 M67 47V48 M68 47V48 M69 47V48 M68 48H69 M69 48H70 M70 48H71 M78 47V48 M79 47V48 M25 48V49 M24 48V49 M25 49H26 M26 49H27 M37 48V49 M38 48V49 M37 49H38 M45 48V49 M46 48V49 M61 49H62 M61 48V49 M67 48V49 M71 48V49 M78 48V49 M79 48V49 M78 49H79 M24 50H25 M24 49V50 M27 49V50 M39 50H40 M45 49V50 M46 49V50 M62 49V50 M61 50H62 M61 49V50 M67 49V50 M71 49V50 M79 49V50 M80 49V50 M79 50H80 M79 49H80 M25 50V51 M24 51H25 M24 50V51 M27 50V51 M27 51H28 M28 51H29 M32 51H33 M33 51H34 M34 51H35 M35 51H36 M36 51H37 M37 51H38 M39 50V51 M38 51H39 M40 50V51 M40 51H41 M45 50V51 M46 50V51 M62 50V51 M67 50V51 M71 50V51 M78 51H79 M80 50V51 M79 51H80 M24 52H25 M24 51V52 M29 51V52 M32 51V52 M41 51V52 M45 51V52 M46 51V52 M47 51V52 M46 52H47 M46 51H47 M48 51V52 M47 51H48 M62 51V52 M67 51V52 M71 51V52 M78 51V52 M79 51V52 M25 52V53 M24 53H25 M24 52V53 M25 53H26 M26 53H27 M29 52V53 M32 52V53 M34 53H35 M35 53H36 M36 53H37 M37 53H38 M38 53H39 M39 53H40 M41 52V53 M41 53H42 M42 53H43 M45 52V53 M45 53H46 M46 53H47 M48 52V53 M47 53H48 M62 52V53 M67 52V53 M71 52V53 M78 52V53 M77 53H78 M79 52V53 M78 53H79 M25 53V54 M24 54H25 M24 53V54 M27 53V54 M29 53V54 M32 53V54 M34 53V54 M37 53V54 M40 53V54 M40 54H41 M41 54H42 M43 53V54 M48 53V54 M49 53V54 M48 53H49 M50 53V54 M49 53H50 M62 53V54 M67 53V54 M71 53V54 M75 54H76 M77 53V54 M76 54H77 M24 54V55 M27 54V55 M29 54V55 M32 54V55 M34 54V55 M37 55H38 M37 54V55 M39 55H40 M42 54V55 M43 54V55 M48 54V55 M49 54V55 M50 54V55 M62 54V55 M67 54V55 M71 54V55 M75 54V55 M75 55H76 M77 54V55 M76 55H77 M24 56H25 M24 55V56 M27 55V56 M29 55V56 M32 55V56 M34 55V56 M39 55V56 M38 55V56 M40 55V56 M42 55V56 M43 55V56 M42 56H43 M43 56H44 M44 56H45 M48 55V56 M49 55V56 M50 55V56 M62 55V56 M67 55V56 M71 55V56 M75 55V56 M25 56V57 M24 57H25 M24 56V57 M27 56V57 M29 56V57 M28 57H29 M32 56V57 M34 56V57 M39 56V57 M38 56V57 M40 56V57 M43 56V57 M45 56V57 M48 56V57 M49 56V57 M50 56V57 M62 56V57 M67 56V57 M71 56V57 M75 56V57 M24 57V58 M23 58H24 M23 57V58 M23 57H24 M27 57V58 M26 58H27 M28 57V58 M27 58H28 M32 57V58 M34 57V58 M39 57V58 M38 57V58 M40 57V58 M43 57V58 M45 57V58 M48 57V58 M49 57V58 M50 57V58 M62 57V58 M67 57V58 M71 57V58 M75 57V58 M74 58H75 M23 58V59 M22 58V59 M22 58H23 M24 58V59 M26 58V59 M27 58V59 M32 58V59 M34 58V59 M39 58V59 M38 58V59 M40 58V59 M43 58V59 M45 58V59 M48 58V59 M49 58V59 M48 59H49 M50 58V59 M62 58V59 M67 58V59 M69 59H70 M71 58V59 M70 59H71 M72 59H73 M74 58V59 M73 59H74 M23 59V60 M22 59V60 M24 59V60 M26 59V60 M27 59V60 M32 59V60 M34 59V60 M39 59V60 M38 59V60 M40 59V60 M43 59V60 M45 59V60 M50 59V60 M51 59V60 M50 59H51 M62 59V60 M67 59V60 M67 60H68 M69 59V60 M68 60H69 M72 59V60 M23 60V61 M22 60V61 M24 60V61 M26 60V61 M27 60V61 M32 60V61 M34 60V61 M39 60V61 M38 60V61 M40 60V61 M43 60V61 M45 60V61 M50 60V61 M51 60V61 M62 60V61 M65 61H66 M67 60V61 M66 61H67 M67 61H68 M69 60V61 M68 61H69 M69 61H70 M70 61H71 M72 60V61 M71 61H72 M23 61V62 M22 61V62 M24 61V62 M23 62H24 M26 61V62 M27 61V62 M32 61V62 M34 61V62 M39 61V62 M38 61V62 M40 61V62 M43 61V62 M45 61V62 M50 61V62 M51 61V62 M62 61V62 M65 61V62 M65 62H66 M67 61V62 M66 62H67 M67 62H68 M69 61V62 M68 62H69 M21 63H22 M21 62V63 M21 62H22 M26 62V63 M27 62V63 M32 62V63 M34 62V63 M39 62V63 M38 62V63 M40 62V63 M43 62V63 M45 62V63 M50 62V63 M51 62V63 M62 62V63 M67 62V63 M67 63H68 M69 62V63 M68 63H69 M22 63V64 M21 63V64 M24 64H25 M26 63V64 M27 63V64 M26 64H27 M32 63V64 M34 63V64 M39 63V64 M38 63V64 M40 63V64 M43 63V64 M45 63V64 M50 63V64 M51 63V64 M62 63V64 M65 64H66 M67 63V64 M66 64H67 M19 64V65 M19 64H20 M20 64H21 M22 64V65 M21 65H22 M24 64V65 M25 64V65 M32 64V65 M34 64V65 M39 64V65 M38 64V65 M40 64V65 M43 64V65 M45 64V65 M50 64V65 M51 64V65 M50 65H51 M62 64V65 M65 64V65 M64 65H65 M66 64V65 M19 65V66 M21 65V66 M24 65V66 M25 65V66 M32 65V66 M34 65V66 M39 65V66 M38 65V66 M40 65V66 M43 65V66 M45 65V66 M51 65H52 M53 65V66 M52 66H53 M52 65H53 M62 65V66 M64 65V66 M64 66H65 M66 65V66 M65 66H66 M19 66V67 M21 66V67 M21 67H22 M22 67H23 M24 66V67 M23 67H24 M25 66V67 M32 66V67 M34 66V67 M39 66V67 M38 66V67 M40 66V67 M40 67H41 M41 67H42 M43 66V67 M42 67H43 M45 66V67 M52 66V67 M51 67H52 M53 66V67 M52 67H53 M62 67H63 M62 66V67 M64 66V67 M63 67H64 M19 68H20 M19 67V68 M20 68H21 M21 68H22 M22 68H23 M25 67V68 M32 67V68 M32 68H33 M34 67V68 M33 68H34 M39 67V68 M38 67V68 M39 68H40 M40 68H41 M41 68H42 M42 68H43 M45 67V68 M51 67V68 M52 67V68 M53 67V68 M52 68H53 M19 69H20 M19 68V69 M20 69H21 M21 69H22 M23 68V69 M25 68V69 M24 69H25 M31 69H32 M32 69H33 M34 68V69 M33 69H34 M38 69H39 M38 68V69 M39 69H40 M40 69H41 M41 69H42 M43 68V69 M42 69H43 M45 68V69 M51 68V69 M53 68V69 M23 69V70 M22 69V70 M24 69V70 M31 69V70 M32 69V70 M31 70H32 M43 69V70 M45 69V70 M51 69V70 M53 69V70 M23 70V71 M22 70V71 M24 70V71 M32 70V71 M43 70V71 M45 70V71 M51 70V71 M51 71H52 M53 70V71 M52 71H53 M23 71V72 M22 72H23 M22 71V72 M24 71V72 M23 72H24 M24 72H25 M25 72H26 M26 72H27 M27 72H28 M28 72H29 M29 72H30 M30 72H31 M32 71V72 M31 72H32 M43 72H44 M43 71V72 M45 71V72 M44 72H45 M45 72H46 M46 72H47 M47 72H48 M48 72H49 M49 72H50 M50 72H51 M51 72H52 M53 71V72 M52 72H53";
    return <div className="pp-pixel-twilight" aria-hidden="true"><svg viewBox="-2 0 84 84" fill="none" stroke="currentColor" strokeWidth=".45" strokeLinejoin="miter" strokeLinecap="square" shapeRendering="crispEdges" focusable="false">
    <defs>
      <clipPath id={`${id}-body`}><rect x="0" y="0" width="80" height="48"/></clipPath>
      <clipPath id={`${id}-front`}><rect x="0" y="48" width="38" height="32"/></clipPath>
      <clipPath id={`${id}-rear`}><rect x="38" y="48" width="42" height="32"/></clipPath>
    </defs>
    <g className="pp-twilight-body">
      <path d={outline} clipPath={`url(#${id}-body)`}/>
      <g className="pp-twilight-leg pp-twilight-leg-front"><path d={outline} clipPath={`url(#${id}-front)`}/></g>
      <g className="pp-twilight-leg pp-twilight-leg-back"><path d={outline} clipPath={`url(#${id}-rear)`}/></g>
    </g>
  </svg></div>;
}
function useEnglishProfileActivation(profileId?: string) {
const [snapshot, setSnapshot] = useState<{ owner: string; ready: boolean; enabled: boolean; error: string }>({ owner: "", ready: false, enabled: false, error: "" });
const [retry, setRetry] = useState(0);
    useEffect(() => {
let active = true;
let request = 0;
const load = async () => {
const ticket = ++request;
            if (!profileId) return;
            setSnapshot({ owner: profileId, ready: false, enabled: false, error: "" });
            try {
const { data, error } = await supabase.from("profiles").select("english_cards_enabled").eq("id", profileId).single();
                if (!active || ticket !== request) return;
                if (error) throw error;
                if (!data) throw new Error("Profile not found");
                setSnapshot({ owner: profileId, ready: true, enabled: data.english_cards_enabled !== false, error: "" });
            } catch (cause) {
                if (!active || ticket !== request) return;
const code = (cause as { code?: string } | null)?.code;
                setSnapshot({ owner: profileId, ready: true, enabled: false, error: code === "42703" || code === "PGRST204" ? "Run the English activation setup SQL, then retry." : "Card preferences could not be loaded. Please retry." });
            }
        };
const changed = (event: Event) => {
const detail = (event as CustomEvent<{ userId?: string }>).detail;
            if (detail?.userId === profileId) void load();
        };
        void load();
        window.addEventListener("english-card-settings-changed", changed);
        return () => { active = false; request += 1; window.removeEventListener("english-card-settings-changed", changed); };
    }, [profileId, retry]);
const current = snapshot.owner === profileId;
    return { ready: current && snapshot.ready, enabled: current && snapshot.ready && snapshot.enabled, error: current ? snapshot.error : "", refresh: () => setRetry(value => value + 1) };
}
export default function PublicProfile() {
const { username } = useParams();
const [profile, setProfile] = useState<any>(null);
const chineseProfile = usePublicChineseProfile(profile?.id);
const [cardLanguage, setCardLanguage] = useState<ProfileCardLanguage>("english");
const englishProfile = useEnglishProfileActivation(profile?.id);
const englishEnabled = englishProfile.enabled;
const cardLanguagesReady = englishProfile.ready && chineseProfile.ready;
const hasActiveCards = englishEnabled || chineseProfile.enabled;
const showChineseCards = chineseProfile.enabled && (!englishEnabled || cardLanguage === "chinese");
    useEffect(() => { setCardLanguage("english"); setShowCollectionModal(false); }, [profile?.id]);
const [profileLoading, setProfileLoading] = useState(true);
const [profileNotFound, setProfileNotFound] = useState(false);
const [discord, setDiscord] = useState("");
const [copied, setCopied] = useState(false);
const [activeShowcase, setActiveShowcase] = useState<"iso" | "wishlist" | "trade" | "sale">("iso");
const [showCollectionModal, setShowCollectionModal] = useState(false);
    useEffect(() => { if (englishProfile.ready && !englishEnabled) setShowCollectionModal(false); }, [englishProfile.ready, englishEnabled]);
const [collectionMode, setCollectionMode] = useState<"iso" | "wishlist" | "trade" | "sale">("iso");
const [marketListings, setMarketListings] = useState<any[]>([]);
const [selectedSet, setSelectedSet] = useState("1");
const [stats, setStats] = useState({
        owned: 0,
        trades: 0,
        sales: 0,
        wishlist: 0,
    });
const [hiddenIsoSets, setHiddenIsoSets] = useState<string[]>([]);
const [lastActivityAt, setLastActivityAt] = useState<string | null>(null);
const [isLightMode, setIsLightMode] = useState(() => document.documentElement.dataset.theme === "light");
const [currentUserId, setCurrentUserId] = useState("");
const [isFriend, setIsFriend] = useState(false);
const [requestPending, setRequestPending] = useState(false);
const [sendingRequest, setSendingRequest] = useState(false);
const isEmbedded = typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("embed") === "1";
    useEffect(() => {
        if (!showCollectionModal)
            return;
const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showCollectionModal]);
    useEffect(() => {
let cancelled = false;
const loadProfile = async () => {
            setProfileLoading(true);
            setProfileNotFound(false);
            setProfile(null);
const { data: { session }, } = await supabase.auth.getSession();
            if (cancelled)
                return;
            if (!username) {
                if (!cancelled) {
                    setProfileLoading(false);
                    setProfileNotFound(true);
                }
                return;
            }
const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .ilike("username", username)
                .limit(1)
                .maybeSingle();
            if (cancelled)
                return;
            if (error || !profileData) {
                setProfileLoading(false);
                setProfileNotFound(true);
                return;
            }
            setProfile(profileData);
const legacyHidden = profileData.iso_hidden_sets || [];
const hidden = [
                ...(profileData.iso_hidden_sets?.length
                    ? profileData.iso_hidden_sets
                    : legacyHidden),
                ...(profileData.iso_hidden_sets?.length
                    ? profileData.iso_hidden_sets
                    : legacyHidden),
            ];
            setHiddenIsoSets(hidden);
const { data: tradingProfile } = await supabase
                .from("trading_profiles")
                .select("discord_username")
                .eq("user_id", profileData.id)
                .maybeSingle();
            if (cancelled)
                return;
            setDiscord(tradingProfile?.discord_username || "");
            if (!cancelled) {
                setCurrentUserId(session?.user?.id || "");
            }
            if (session?.user && session.user.id !== profileData.id) {
const [{ data: friendship }, { data: pendingRequest }] = await Promise.all([
                    supabase
                        .from("friends")
                        .select("id")
                        .eq("user_id", session.user.id)
                        .eq("friend_id", profileData.id)
                        .maybeSingle(),
                    supabase
                        .from("friend_requests")
                        .select("id")
                        .eq("sender_id", session.user.id)
                        .eq("receiver_id", profileData.id)
                        .eq("status", "pending")
                        .maybeSingle(),
                ]);
                if (!cancelled) {
                    setIsFriend(Boolean(friendship));
                    setRequestPending(Boolean(pendingRequest));
                }
            }
            else if (!cancelled) {
                setIsFriend(false);
                setRequestPending(false);
            }
const { data: activityData } = await supabase
                .from("user_activity")
                .select("last_activity_at")
                .eq("user_id", profileData.id)
                .maybeSingle();
            if (!cancelled) {
                setLastActivityAt(activityData?.last_activity_at || null);
            }
            setProfileLoading(false);
        };
        loadProfile();
        return () => {
            cancelled = true;
        };
    }, [username]);
    useEffect(() => {
let active = true;
const loadStats = async () => {
            if (!profile?.id) return;
            if (!englishEnabled) {
                setEnglishISO({ owner: profile.id, cards: [] });
                setEnglishWishlist({ owner: profile.id, cards: [] });
                setMarketListings([]);
                setStats({ owned: 0, trades: 0, sales: 0, wishlist: 0 });
                return;
            }
const { data: collection, error: collectionError } = await supabase
                .from("collection_progress_raw")
                .select("set_id, progress")
                .eq("user_id", profile.id);
            if (!active)
                return;
            if (collectionError)
                throw collectionError;
const owned = ownedEnglishViewCards(collection || []).length;
const statusRows: Array<{
                card_key: string;
                status: string;
            }> = [];
let statusesLoaded = true;
            for (let offset = 0;; offset += 500) {
const { data, error } = await supabase.from("iso_status").select("card_key, status").eq("user_id", profile.id).order("card_key").range(offset, offset + 499);
                if (error) {
                    statusesLoaded = false;
                    console.error(error);
                    break;
                }
                statusRows.push(...(data || []));
                if (!data || data.length < 500)
                    break;
            }
            if (!active)
                return;
            if (statusesLoaded)
                setEnglishISO({ owner: profile.id, cards: missingEnglishViewCards(collection || [], statusRows).map(card => ({ set_id: card.setId, card_key: card.key })) });
const listings = await readEnglishViewRows<any>((from, to) => supabase.from("card_market_listings").select("user_id, set_id, card_key, is_for_trade, is_for_sale, asking_price, trade_quantity, sale_quantity, updated_at").eq("user_id", profile.id).order("set_id").order("card_key").range(from, to));
            if (!active)
                return;
const activeListings = (listings || []).filter((card: any) => englishViewEligible(card) && ((card.is_for_trade && Number(card.trade_quantity) > 0) ||
                (card.is_for_sale && Number(card.sale_quantity) > 0)));
            setMarketListings(activeListings);
const wishlist = await readEnglishViewRows<{
                card_key: string;
            }>((from, to) => supabase.from("wishlists").select("card_key").eq("user_id", profile.id).order("card_key").range(from, to));
            if (!active)
                return;
const savedWishlist = wishlist.map(row => { const [set_id, ...keys] = row.card_key.split(":"); return { set_id, card_key: keys.join(":") }; }).filter(englishViewEligible);
            setEnglishWishlist({ owner: profile.id, cards: savedWishlist });
            setStats({
                owned,
                trades: activeListings.filter((card: any) => card.is_for_trade).length,
                sales: activeListings.filter((card: any) => card.is_for_sale).length,
                wishlist: savedWishlist.length,
            });
        };
        void loadStats().catch(console.error);
        return () => { active = false; };
    }, [profile, englishEnabled]);
const { avatar } = getProfileAssets(profile);
const [englishISO, setEnglishISO] = useState<{
        owner: string;
        cards: Array<{
            set_id: string;
            card_key: string;
        }>;
    }>({ owner: "", cards: [] });
const isoCards = englishISO.owner === profile?.id ? englishISO.cards : [];
const [englishWishlist, setEnglishWishlist] = useState<{
        owner: string;
        cards: Array<{
            set_id: string;
            card_key: string;
        }>;
    }>({ owner: "", cards: [] });
const wishlistCards = englishWishlist.owner === profile?.id ? englishWishlist.cards : [];
const tradeCards = useMemo(() => {
        return marketListings
            .filter((card: any) => card.is_for_trade && Number(card.trade_quantity) > 0)
            .map((card: any) => ({
            ...card,
            type: "trade",
        }));
    }, [marketListings]);
const saleCards = useMemo(() => marketListings
        .filter((card: any) => card.is_for_sale && Number(card.sale_quantity) > 0)
        .map((card: any) => ({ ...card, type: "sale" })), [marketListings]);
const getSetName = englishViewName;
const getTradeCardImage = englishViewImage;
const visibleIsoCards = useMemo(() => isoCards.filter((card: any) => {
const setId = String(card.set_id);
        if (!englishViewEligible(card))
            return false;
        if (hiddenIsoSets.includes(setId) || isProfileMerchandiseHidden(card, hiddenIsoSets)) {
            return false;
        }
        if (setId === "SD" &&
            (hiddenIsoSets.includes("SD") ||
                hiddenIsoSets.includes("SD_STARTERS") ||
                hiddenIsoSets.includes("SD_BONUS"))) {
            return false;
        }
        if (setId === "tcgpromos" && hiddenIsoSets.includes("TCG_PROMOS")) {
            return false;
        }
        return true;
    }), [isoCards, hiddenIsoSets]);
const modalCards = useMemo(() => {
        switch (collectionMode) {
            case "wishlist":
                return wishlistCards;
            case "trade":
                return tradeCards;
            case "sale":
                return saleCards;
            default:
                return visibleIsoCards;
        }
    }, [collectionMode, visibleIsoCards, wishlistCards, tradeCards, saleCards]);
const modalTabs = useMemo(() => {
        return Array.from(new Set(modalCards.map((c: any) => profileViewGroup(c))));
    }, [modalCards]);
const filteredCards = modalCards.filter((c: any) => profileViewGroup(c) === selectedSet);
const activityStatus = (() => {
        if (!lastActivityAt) {
            return {
                label: "Inactive",
                lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
                darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
                dotClass: "bg-zinc-400",
            };
        }
const age = Date.now() - new Date(lastActivityAt).getTime();
        if (age <= 24 * 60 * 60 * 1000) {
            return {
                label: "Active in the last 24 Hours",
                lightClass: "border-emerald-700/15 bg-emerald-700/[0.06] text-emerald-800",
                darkClass: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
                dotClass: "bg-emerald-500",
            };
        }
        if (age <= 7 * 24 * 60 * 60 * 1000) {
            return {
                label: "Active in the last 7 Days",
                lightClass: "border-[#8a6a00]/20 bg-[#c89d13]/10 text-[#725700]",
                darkClass: "border-[#FFD54A]/20 bg-[#FFD54A]/[0.08] text-[#FFE27A]",
                dotClass: "bg-[#FFD54A]",
            };
        }
        return {
            label: "Inactive",
            lightClass: "border-zinc-300 bg-zinc-100 text-zinc-600",
            darkClass: "border-white/10 bg-white/[0.05] text-zinc-400",
            dotClass: "bg-zinc-400",
        };
    })();
    useEffect(() => {
const syncTheme = () => {
            setIsLightMode(document.documentElement.dataset.theme === "light");
        };
        syncTheme();
const observer = new MutationObserver(syncTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        });
        return () => observer.disconnect();
    }, []);
async function sendFriendRequest() {
        if (!currentUserId || !profile?.id || currentUserId === profile.id)
            return;
        if (isFriend || requestPending || sendingRequest)
            return;
        setSendingRequest(true);
const { data: targetProfile } = await supabase
            .from("profiles")
            .select("allow_friend_requests")
            .eq("id", profile.id)
            .maybeSingle();
        if (targetProfile && targetProfile.allow_friend_requests === false) {
            alert("This Superfan isn't accepting friend requests.");
            setSendingRequest(false);
            return;
        }
const { error } = await supabase.from("friend_requests").insert({
            sender_id: currentUserId,
            receiver_id: profile.id,
            status: "pending",
        });
        if (!error) {
            setRequestPending(true);
        }
        setSendingRequest(false);
    }
const CollectionModal = () => {
        if (!showCollectionModal)
            return null;
const modeLabel = collectionMode === "iso"
            ? "ISO"
            : collectionMode === "wishlist"
                ? "Wishlist"
                : collectionMode === "sale"
                    ? "For Sale"
                    : "For Trade";
        return (<div className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-3 backdrop-blur-md sm:p-8 ${isLightMode ? "bg-white/35" : "bg-black/80"}`} onClick={() => setShowCollectionModal(false)}>
        <div onClick={(e) => e.stopPropagation()} className={`relative flex h-[min(82dvh,620px)] min-h-0 w-full max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[22px] border sm:rounded-[28px] ${isEmbedded
                ? "sm:h-[88vh] sm:min-h-0 sm:w-[94vw] sm:max-w-[980px] sm:flex-row"
                : "sm:h-[72vh] sm:min-h-0 sm:w-[78vw] sm:max-w-[1080px] sm:flex-row"} ${isLightMode
                ? "border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,.18)]"
                : "border-white/10 bg-[#151718] shadow-[0_24px_70px_rgba(0,0,0,.45)]"}`}>
          <div className={`flex w-full shrink-0 flex-col border-b sm:w-52 sm:border-b-0 sm:border-r ${isLightMode
                ? "border-black/[0.08] bg-zinc-50"
                : "border-white/[0.07] bg-[#111314]"}`}>
            <div className={`flex items-center justify-between border-b px-4 py-4 sm:block sm:p-5 ${isLightMode ? "border-black/[0.08]" : "border-white/[0.07]"}`}>
              <div>
                <h2 className="text-lg font-semibold">{modeLabel}</h2>
                <div className={`mt-1 text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  {modalTabs.length} {modalTabs.length === 1 ? "set" : "sets"}
                </div>
              </div>
              <button type="button" onClick={() => setShowCollectionModal(false)} className={`rounded-lg px-3 py-1.5 text-xl sm:hidden ${isLightMode
                ? "text-zinc-500 hover:bg-black/[0.05]"
                : "text-zinc-400 hover:bg-white/[0.06]"}`}>
                &times;
              </button>
            </div>
            <div className="flex min-w-0 flex-nowrap gap-2 overflow-x-auto p-3 sm:block sm:flex-1 sm:space-y-1 sm:overflow-x-hidden sm:overflow-y-auto">
              {modalTabs.map((setId) => (<button key={setId} type="button" onClick={() => setSelectedSet(setId)} className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:w-full sm:rounded-xl sm:text-left ${selectedSet === setId
                    ? isLightMode
                        ? "bg-[#c89d13]/15 text-[#725700]"
                        : "bg-[#FFD54A]/10 text-[#FFE27A]"
                    : isLightMode
                        ? "text-zinc-600 hover:bg-black/[0.04]"
                        : "text-zinc-400 hover:bg-white/[0.05]"}`}>
                  {getSetName(setId)}
                </button>))}
            </div>
          </div>
          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className={`sticky top-0 z-20 flex items-center justify-between border-b px-4 py-4 backdrop-blur-xl sm:px-6 ${isLightMode
                ? "border-black/[0.08] bg-white/95"
                : "border-white/[0.07] bg-[#151718]/95"}`}>
              <div className="min-w-0">
                <div className={`text-xs ${isLightMode ? "text-zinc-500" : "text-zinc-400"}`}>
                  {modeLabel}
                </div>
                <h3 className="truncate text-lg font-semibold sm:text-xl">
                  {getSetName(selectedSet)}
                </h3>
              </div>
              <button type="button" onClick={() => setShowCollectionModal(false)} className={`hidden rounded-lg px-3 py-1.5 text-2xl sm:block ${isLightMode
                ? "text-zinc-500 hover:bg-black/[0.05]"
                : "text-zinc-400 hover:bg-white/[0.06]"}`}>
                &times;
              </button>
            </div>
            <div className="p-3 sm:p-6">
              {filteredCards.length === 0 ? (<div className={`flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed px-6 text-center text-sm ${isLightMode
                    ? "border-black/10 bg-zinc-50 text-zinc-500"
                    : "border-white/10 bg-white/[0.03] text-zinc-400"}`}>
                  There's nothing to see here.
                </div>) : (<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                  {filteredCards
                    .slice()
                    .sort((a: any, b: any) => {
                    return compareEnglishViewCards(a, b);
                })
                    .map((card: any) => (<div key={`${card.set_id}-${card.card_key}`} className={`relative overflow-hidden rounded-[10px] bg-transparent ${profileViewSquare(card) ? "aspect-square" : englishViewWide(card)
                        ? "col-span-2 aspect-[10/7]"
                        : "aspect-[5/7]"}`}>
                        <CardImage publicProfile src={getTradeCardImage(card)} style={englishViewStyle(card)} imageSize={englishViewCard(card)?.original ? "original" : "grid"} alt={englishViewCode(card)} className="absolute inset-0 h-full w-full bg-transparent object-cover"/>
                        {(card.is_for_trade || card.is_for_sale) && (<div className="absolute left-1.5 top-1.5 flex gap-1">
                            {card.is_for_trade && (<span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-[#FFD54A]">
                                &#8644;
                              </span>)}
                            {card.is_for_sale && (<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD54A] text-xs font-bold text-black">
                                $
                              </span>)}
                          </div>)}
                        {card.is_for_sale && card.asking_price != null && (<span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/80 px-2 py-1 text-[10px] font-bold text-white">
                            ${Number(card.asking_price).toFixed(2)}
                          </span>)}
                      </div>))}
                </div>)}
            </div>
          </div>
        </div>
      </div>);
    };
    if (profileLoading) {
        return null;
    }
    if (profileNotFound) {
        return <NotFound />;
    }
    return (<div className={`pp-upgrade min-h-screen pb-32 transition-colors duration-200 sm:pb-8 ${isLightMode ? "bg-[#f5f5f3] text-zinc-900" : "bg-[#0d0f10] text-white"}`}>
      <style>{publicProfileStyles + profileShowcaseStyles + `.pp-hero-copy .pp-avatar{width:92px!important;height:92px!important;border-radius:20px!important}.pp-hero-copy .pp-name{font-size:32px!important;line-height:1.15!important}.pp-hero-copy .pp-profile-discord{font-size:15px!important}.pp-hero-copy .pp-profile-description{font-size:15px!important;line-height:1.6!important}.pp-hero-copy .pp-profile-actions button{font-size:14px!important;min-height:44px}.pp-hero-copy .pp-owned strong{font-size:30px}.pp-hero-copy .pp-metric strong{font-size:21px}.pp-hero-copy .pp-metric{font-size:11px}@media(max-width:850px){.pp-hero-copy .pp-identity{grid-template-columns:72px minmax(0,1fr);gap:8px 14px}.pp-hero-copy .pp-avatar{width:72px!important;height:72px!important}.pp-hero-copy .pp-profile-title .pp-name{font-size:27px!important}.pp-hero-copy .pp-profile-discord{font-size:13px!important}.pp-hero-copy .pp-profile-description{font-size:13px!important;line-height:1.5!important}.pp-hero-copy .pp-profile-actions button{font-size:13px!important}.pp-hero-copy .pp-owned strong{font-size:27px}.pp-hero-copy .pp-metric strong{font-size:20px}}@media(max-width:360px){.pp-hero-copy .pp-identity{grid-template-columns:64px minmax(0,1fr);gap:8px 10px}.pp-hero-copy .pp-avatar{width:64px!important;height:64px!important}.pp-hero-copy .pp-profile-title .pp-name{font-size:24px!important}.pp-hero-copy .pp-metric{font-size:9px}.pp-hero-copy .pp-metric strong{font-size:18px}}.pp-pixel-twilight{display:none;pointer-events:none;color:var(--pp-ink);opacity:.42}.spooky .pp-pixel-twilight,[data-theme="spooky"] .pp-pixel-twilight{color:var(--pp-accent);opacity:.7}.pp-pixel-twilight svg{display:block;width:100%;height:100%;overflow:visible}.pp-twilight-body{animation:pp-twilight-bob .55s steps(2,end) infinite;transform-origin:40px 47px}.pp-twilight-leg{transform-box:view-box;transform-origin:40px 48px;animation:pp-twilight-trot .55s steps(3,end) infinite alternate}.pp-twilight-leg-front,.pp-twilight-leg-near-back{animation-delay:-.55s}@keyframes pp-twilight-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}@keyframes pp-twilight-trot{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}@media(min-width:1100px){.pp-hero-copy>section>div.relative{padding-right:280px!important}.pp-pixel-twilight{display:block;position:absolute;right:22px;top:50%;width:240px;height:224px;transform:translateY(-50%)}}@media(prefers-reduced-motion:reduce){.pp-twilight-body,.pp-twilight-leg{animation:none}}`}</style>
      <style>{`.pp-avatar-space{display:flex;flex-shrink:0;align-items:center;justify-content:center}.pp-identity:has(.pp-avatar[data-avatar-frame="frame013"]){align-items:center}.pp-avatar-space:has(>[data-avatar-frame="frame013"]){padding:46px 34px 32px}.pp-identity:has([data-avatar-frame="frame013"]) .pp-profile-details{min-width:0}@media(max-width:640px){.pp-identity:has([data-avatar-frame="frame013"]){display:flex!important;flex-direction:column;align-items:stretch;gap:4px!important}.pp-avatar-space:has(>[data-avatar-frame="frame013"]){align-self:center;padding:40px 34px 28px}.pp-identity:has([data-avatar-frame="frame013"]) .pp-profile-details{width:100%}}`}</style>
      <main className={isEmbedded
            ? "pp-shell pp-embedded px-3 py-3 sm:px-4 sm:py-4"
            : "pp-shell px-4 py-5 sm:px-6 sm:py-8"}>
        <header className="pp-profile-hero">
          <div className="pp-hero-copy">
        <section className={`relative overflow-hidden rounded-[30px] border ${isLightMode
            ? "border-black/10 bg-white shadow-[0_14px_36px_rgba(0,0,0,.05)]"
            : "border-white/[0.08] bg-[#151718]"}`}>
          <div className={`absolute inset-0 bg-cover bg-center ${isLightMode ? "opacity-[0.08]" : "opacity-[0.07]"}`} style={{
            backgroundImage: "url('/website-assets/exploreequestria.webp')",
        }}/>
          <div className={`absolute inset-0 ${isLightMode
            ? "bg-gradient-to-r from-white via-white/95 to-white/80"
            : "bg-gradient-to-r from-[#151718] via-[#151718]/95 to-[#151718]/80"}`}/>
          <div className={isEmbedded ? "relative p-4" : "relative p-4 sm:p-5"}>
            <div style={{ marginTop: 0 }} className={isEmbedded
            ? "pp-identity mt-3 flex items-center gap-3 sm:gap-4"
            : "pp-identity mt-2 flex items-center gap-4"}>
              <div className="pp-avatar-space"><ProfileAvatar profile={profile} src={avatar} alt={profile?.username || "Profile avatar"} className={`pp-avatar relative shrink-0 rounded-[20px] border ${isLightMode ? "border-black/10" : "border-white/10"}`} /></div>
              <div className="pp-profile-details min-w-0 flex-1">
                <div className="pp-profile-title flex flex-wrap items-center gap-2">
                  <h1 className={`pp-name break-words font-semibold tracking-tight ${isEmbedded
            ? "text-xl sm:text-2xl"
            : "text-3xl sm:text-4xl"} ${isLightMode ? "text-zinc-950" : "text-white"}`}>
                    {profile?.username}
                  </h1>
                  {getProfileAssets(profile).verification && (<CardImage src={getProfileAssets(profile).verification!.badge} alt={getProfileAssets(profile).verification!.label} title={getProfileAssets(profile).verification!.label} className="h-6 w-6 object-contain"/>)}
                </div>
                {discord && (<div className={`pp-profile-discord mt-2 text-sm ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                    Discord:{" "}
                    <span className={isLightMode
                ? "font-medium text-[#725700]"
                : "font-medium text-[#FFE27A]"}>
                      {discord}
                    </span>
                  </div>)}
                <p className={`pp-profile-description ${isEmbedded ? "mt-2 hidden sm:block" : "mt-3"} max-w-2xl text-sm leading-6 ${isLightMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  Send me a friend request or contact me via Discord.
                </p>
              <div className={`pp-profile-activity col-span-full mt-2 flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${isLightMode
            ? activityStatus.lightClass
            : activityStatus.darkClass}`}>
                <span className={`h-2 w-2 rounded-full ${activityStatus.dotClass}`}/>
                {activityStatus.label}
              </div>
                <div className={isEmbedded
            ? "pp-profile-actions mt-2 flex flex-wrap gap-2"
            : "pp-profile-actions mt-4 flex flex-wrap gap-2"}>
                  {currentUserId && currentUserId !== profile?.id && (<button type="button" onClick={sendFriendRequest} disabled={isFriend || requestPending || sendingRequest} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isFriend
                ? isLightMode
                    ? "bg-[#c89d13]/15 text-[#725700]"
                    : "bg-[#FFD54A]/10 text-[#FFE27A]"
                : requestPending
                    ? isLightMode
                        ? "cursor-not-allowed bg-zinc-100 text-zinc-500"
                        : "cursor-not-allowed bg-white/[0.05] text-zinc-500"
                    : "bg-[#FFD54A] text-black hover:bg-[#FFE27A]"}`}>
                      {isFriend
                ? "Friends"
                : requestPending
                    ? "Request Pending"
                    : sendingRequest
                        ? "Sending..."
                        : "Add Friend"}
                    </button>)}
                  <button type="button" onClick={() => {
const url = `https\://www.mlpekayou.community/${encodeURIComponent(profile?.username ?? "")}`;
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(url);
            }
            else {
const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy");
                }
                finally {
                    document.body.removeChild(textArea);
                }
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${isLightMode
            ? "border-black/10 bg-white/80 text-zinc-700 hover:bg-zinc-100"
            : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"}`}>
                    {copied ? "Link Copied" : "Share Profile"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ProfilePixelTwilight />
        </section>
        <aside className="pp-stats" aria-label="Collection overview">
          <div className="pp-owned"><span>COLLECTION SIZE</span><strong>{!cardLanguagesReady || !hasActiveCards || englishProfile.error ? "--" : showChineseCards ? chineseProfile.data.settings.chinese_hide_iso || chineseProfile.cardsError ? "--" : chineseProfile.ownedCount.toLocaleString() : stats.owned.toLocaleString()}</strong><span>cards owned</span></div>
          <div className="pp-metric"><span>Wishlist</span><strong>{!cardLanguagesReady || !hasActiveCards || englishProfile.error ? "--" : showChineseCards ? chineseProfile.data.settings.chinese_hide_wishlist || chineseProfile.cardsError ? "--" : chineseProfile.state.wishlisted.length.toLocaleString() : stats.wishlist.toLocaleString()}</strong></div>
          <div className="pp-metric"><span>For trade</span><strong>{!cardLanguagesReady || !hasActiveCards || englishProfile.error ? "--" : showChineseCards ? chineseProfile.marketError ? "--" : chineseProfile.trades.length.toLocaleString() : tradeCards.length.toLocaleString()}</strong></div>
          <div className="pp-metric"><span>For sale</span><strong>{!cardLanguagesReady || !hasActiveCards || englishProfile.error ? "--" : showChineseCards ? chineseProfile.marketError ? "--" : chineseProfile.sales.length.toLocaleString() : stats.sales.toLocaleString()}</strong></div>
        </aside>
          </div>
          {cardLanguagesReady && hasActiveCards && !englishProfile.error && <ProfileRarestShowcase key={`${profile?.id}:${englishEnabled}:${chineseProfile.enabled}`} profileId={profile?.id}/>}
        </header>
        <section className="pp-showcase">
          {!cardLanguagesReady ? <p role="status" className="px-3 py-6 text-sm text-muted-foreground">Loading card preferences...</p> : englishProfile.error ? <p role="alert" className="px-3 py-6 text-sm text-muted-foreground">{englishProfile.error}<button type="button" onClick={englishProfile.refresh} className="ml-2 underline">Retry</button></p> : !hasActiveCards ? <p className="px-3 py-6 text-sm text-muted-foreground">This collector has deactivated English and Chinese cards.</p> : <>
          <ProfileCardLanguageSwitch enabled={englishEnabled && chineseProfile.enabled} value={showChineseCards ? "chinese" : "english"} onChange={value => { setCardLanguage(value); setShowCollectionModal(false); }}/>
          {!(englishEnabled && chineseProfile.enabled) && <p className="border-b border-border px-3 py-3 text-sm font-semibold">{showChineseCards ? "Chinese cards" : "English cards"}</p>}
          {showChineseCards ? <ChineseProfileCards profile={chineseProfile} contact={discord} initialMode={activeShowcase}/> : <>
          <nav className="pp-tabs" aria-label="Collection category">{([
                { mode: "iso", label: "Looking for", count: visibleIsoCards.length },
                { mode: "wishlist", label: "Wishlist", count: stats.wishlist },
                { mode: "trade", label: "For trade", count: tradeCards.length },
                { mode: "sale", label: "For sale", count: stats.sales },
            ] as const).map(tab => <button type="button" key={tab.mode} aria-pressed={activeShowcase === tab.mode} onClick={() => setActiveShowcase(tab.mode)}><span>{tab.label}</span><span>{tab.count.toLocaleString()}</span></button>)}</nav>
          {[
                {
                    title: "ISO",
                    cards: visibleIsoCards,
                    mode: "iso" as const,
                    count: null,
                },
                {
                    title: "Wishlist",
                    cards: wishlistCards,
                    mode: "wishlist" as const,
                    count: stats.wishlist,
                },
                {
                    title: "For Trade",
                    cards: tradeCards,
                    mode: "trade" as const,
                    count: tradeCards.length,
                },
                {
                    title: "For Sale",
                    cards: saleCards,
                    mode: "sale" as const,
                    count: stats.sales,
                },
            ].filter(section => section.mode === activeShowcase).map((section) => (<div key={section.title} className={`pp-gallery rounded-[26px] border ${isEmbedded ? "p-3 sm:p-4" : "p-4 sm:p-5"} ${isLightMode
                    ? "border-black/10 bg-white"
                    : "border-white/[0.08] bg-[#151718]"}`}>
              <div className={isEmbedded
                    ? "mb-3 flex items-center justify-between"
                    : "mb-4 flex items-center justify-between"}>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  {section.count !== null && (<span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-600"
                        : "border-white/10 bg-white/[0.04] text-zinc-300"}`}>
                      {section.count.toLocaleString()}
                    </span>)}
                </div>
                <button type="button" disabled={section.cards.length === 0} onClick={() => {
                    if (section.cards.length === 0)
                        return;
                    setCollectionMode(section.mode);
                    setSelectedSet(section.cards[0] ? profileViewGroup(section.cards[0]) : "");
                    setShowCollectionModal(true);
                }} className={`text-sm font-semibold ${section.cards.length === 0
                    ? "cursor-not-allowed text-zinc-500"
                    : isLightMode
                        ? "text-[#725700] hover:text-[#5c4700]"
                        : "text-[#FFE27A] hover:text-white"}`}>
                  View All
                </button>
              </div>
              {section.cards.length === 0 ? (<div className={`flex items-center justify-center rounded-2xl border border-dashed px-5 text-center text-sm ${isEmbedded ? "min-h-[110px]" : "min-h-[180px]"} ${isLightMode
                        ? "border-black/10 bg-zinc-50 text-zinc-500"
                        : "border-white/10 bg-white/[0.03] text-zinc-400"}`}>
                  There's nothing to see here.
                </div>) : (<div className={isEmbedded
                        ? "pp-preview-grid grid gap-2"
                        : "pp-preview-grid grid gap-3"}>
                  {section.cards.slice(0, 12).map((card: any) => (<div key={`${card.set_id}-${card.card_key}`} className={`relative overflow-hidden rounded-[10px] bg-transparent ${profileViewSquare(card) ? "aspect-square" : String(card.set_id) === "3" &&
                            String(card.card_key) === "SZR-1"
                            ? "col-span-2 aspect-[10/7]"
                            : "aspect-[5/7]"}`}>
                      <CardImage publicProfile src={getTradeCardImage(card)} style={englishViewCard(card)?.family === "merch" ? englishViewStyle(card) : String(card.set_id) === "13" ? { transform: "scale(1.055)" } : String(card.set_id) === "14" &&
                            /^BP03-C(2[5-9]|3[0-9]|4[0-8])$/.test(card.card_key)
                            ? {
                                left: "50%",
                                top: "50%",
                                right: "auto",
                                bottom: "auto",
                                width: "140%",
                                height: "71.4285714286%",
                                maxWidth: "none",
                                transform: "translate(-50%, -50%) rotate(-90deg)",
                            }
                            : undefined} alt={englishViewCard(card)?.family === "merch" ? englishViewCode(card) : card.card_key} className={`absolute inset-0 h-full w-full bg-transparent ${englishViewCard(card)?.family === "merch" ? "object-contain" : [
                            "FW",
                            "SD",
                            "friendshipsbegin",
                            "12",
                            "14", "hearthswarming-eve",
                            "tcgpromos",
                        ].includes(String(card.set_id))
                            ? "object-contain"
                            : "scale-[1.05] object-cover"}`}/>
                      {(card.is_for_trade || card.is_for_sale) && (<div className="absolute left-1.5 top-1.5 flex gap-1">
                          {card.is_for_trade && (<span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-xs font-bold text-[#FFD54A]">
                              &#8644;
                            </span>)}
                          {card.is_for_sale && (<span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFD54A] text-xs font-bold text-black">
                              $
                            </span>)}
                        </div>)}
                      {card.is_for_sale && card.asking_price != null && (<span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/80 px-2 py-1 text-[10px] font-bold text-white">
                          ${Number(card.asking_price).toFixed(2)}
                        </span>)}
                    </div>))}
                </div>)}
            </div>))}
          </>}
          </>}
        </section>
        {cardLanguagesReady && englishEnabled && !showChineseCards && !englishProfile.error && <CollectionModal />}
      </main>
    </div>);
}
