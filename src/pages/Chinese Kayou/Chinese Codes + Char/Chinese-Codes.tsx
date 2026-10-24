export type ChineseCardCode = {
    key: string;
    rarity: string;
    number: number;
    code: string;
};
const sequence = (rarity: string, count: number, prefix: string, start = 1, offset = 0): ChineseCardCode[] => Array.from({ length: count }, (_, index) => ({ key: `${rarity}-${index + offset + 1}`, rarity, number: index + offset + 1, code: `${prefix}-${String(index + start).padStart(3, "0")}` }));
export const CHINESE_MOON_ONE_CODES: ChineseCardCode[] = [
    ...sequence("R", 40, "YH-F01"),
    ...sequence("SR", 20, "YH-F01", 41),
    ...sequence("SSR", 15, "YH-F01", 61),
    ...sequence("SSR", 12, "YH-T01", 17, 15),
    ...sequence("HR", 30, "YH-HR"),
    ...sequence("UR", 18, "YH-UR"),
    ...sequence("LSR", 15, "YH-LSR"),
    ...sequence("SGR", 7, "YH-SGR"),
];
export const CHINESE_MOON_TWO_CODES: ChineseCardCode[] = [
    ...sequence("R", 8, "YH-T01"),
    ...sequence("R", 8, "YH-T02", 1, 8),
    ...sequence("SR", 8, "YH-F01", 9),
    ...sequence("SR", 8, "YH-T02", 9, 8),
    ...sequence("SSR", 12, "YH-T01", 17),
    ...sequence("SSR", 12, "YH-T02", 17, 12),
    ...sequence("HR", 30, "YH-HR", 31),
    ...sequence("UR", 18, "YH-UR"),
    ...sequence("LSR", 15, "YH-LSR", 16),
    ...sequence("SGR", 7, "YH-SGR", 8),
    ...sequence("SC", 6, "YH-SC"),
];
export const CHINESE_MOON_TWO_UR_CODES: ChineseCardCode[] = sequence("UR", 6, "YH-UR", 19, 18);
export const CHINESE_MOON_THREE_CODES: ChineseCardCode[] = [
    ...sequence("R", 12, "YH-T03"),
    ...sequence("SR", 12, "YH-T03", 13),
    ...sequence("SSR", 15, "YH-T03", 25),
    ...sequence("HR", 30, "YH-HR", 61),
    ...sequence("UR", 9, "YH-UR", 31),
    ...sequence("LSR", 24, "YH-LSR", 31),
    ...sequence("SGR", 7, "YH-SGR", 15),
    ...sequence("SC", 6, "YH-SC", 7),
];
export const CHINESE_MOON_FOUR_CODES: ChineseCardCode[] = [
    ...sequence("R", 20, "YH-T04"),
    ...sequence("SR", 20, "YH-T04", 21),
    ...sequence("SSR", 20, "YH-T04", 41),
    ...sequence("HR", 30, "YH-HR", 91),
    ...sequence("UR", 15, "YH-UR", 40),
    ...sequence("LSR", 15, "YH-LSR", 55),
    ...sequence("SGR", 6, "YH-SGR", 22),
    ...sequence("SC", 6, "YH-SC", 13),
];
export const CHINESE_MOON_FIVE_CODES: ChineseCardCode[] = [
    ...sequence("R", 20, "YH-T05"),
    ...sequence("SR", 20, "YH-T05", 21),
    ...sequence("SSR", 20, "YH-T05", 41),
    ...sequence("HR", 30, "YH-HR", 121),
    ...sequence("UR", 15, "YH-UR", 55),
    ...sequence("LSR", 15, "YH-LSR", 70),
    ...sequence("SGR", 8, "YH-SGR", 28),
    ...sequence("SC", 6, "YH-SC", 19),
];
export const CHINESE_MOON_SIX_CODES: ChineseCardCode[] = [
    ...sequence("R", 30, "HY06-R"),
    ...sequence("SR", 20, "HY06-SR"),
    ...sequence("SSR", 20, "HY06-SSR"),
    ...sequence("PTR", 36, "HY06-PTR"),
    ...sequence("UR", 16, "HY06-UR"),
    ...sequence("LSR", 15, "HY06-LSR"),
    ...sequence("SGR", 8, "HY06-SGR"),
    ...sequence("SC", 7, "HY06-SC"),
];
export const CHINESE_MOON_SEVEN_CODES: ChineseCardCode[] = [
    ...sequence("R", 30, "HY07-R"),
    ...sequence("SR", 20, "HY07-SR"),
    ...sequence("SSR", 54, "HY07-SSR"),
    ...sequence("HR", 36, "HY07-HR"),
    ...sequence("UR", 16, "HY07-UR"),
    ...sequence("LSR", 15, "HY07-LSR"),
    ...sequence("SGR", 8, "HY07-SGR"),
    ...sequence("SC", 7, "HY07-SC"),
];
export const CHINESE_MOON_EIGHT_CODES: ChineseCardCode[] = [
    ...sequence("R", 30, "HY08-R"),
    ...sequence("SR", 20, "HY08-SR"),
    ...sequence("SSR", 54, "HY08-SSR"),
    ...sequence("HR", 30, "HY08-HR"),
    ...sequence("UR", 16, "HY08-UR"),
    ...sequence("LSR", 16, "HY08-LSR"),
    ...sequence("SGR", 8, "HY08-SGR"),
    ...sequence("ZR", 7, "HY08-ZR"),
    ...sequence("SC", 7, "HY08-SC"),
    ...sequence("DZR", 1, "HY08-\u25C7ZR"),
];
export const CHINESE_MOON_NINE_CODES: ChineseCardCode[] = [
    ...sequence("R", 30, "HY09-R"),
    ...sequence("SR", 20, "HY09-SR"),
    ...sequence("SSR", 20, "HY09-SSR"),
    ...sequence("HR", 30, "HY09-HR"),
    ...sequence("UR", 19, "HY09-UR"),
    ...sequence("LSR", 16, "HY09-LSR"),
    ...sequence("SGR", 8, "HY09-SGR"),
    ...sequence("ZR", 7, "HY09-ZR"),
    ...sequence("SC", 7, "HY09-SC"),
    ...sequence("DZR", 1, "HY09-\u25C7ZR"),
];
export const CHINESE_MOON_TEN_CODES: ChineseCardCode[] = [
    ...sequence("R", 30, "HY10-R"),
    ...sequence("SR", 20, "HY10-SR"),
    ...sequence("SSR", 20, "HY10-SSR"),
    ...sequence("HR", 30, "HY10-HR"),
    ...sequence("UR", 18, "HY10-UR"),
    ...sequence("LSR", 16, "HY10-LSR"),
    ...sequence("SGR", 8, "HY10-SGR"),
    ...sequence("ZR", 7, "HY10-ZR"),
    ...sequence("SC", 7, "HY10-SC"),
    ...sequence("DZR", 2, "HY10-\u25C7ZR"),
];
export const CHINESE_MOON_ELEVEN_CODES: ChineseCardCode[] = [
    ...sequence("R", 30, "HY11-R"),
    ...sequence("SR", 20, "HY11-SR"),
    ...sequence("SSR", 26, "HY11-SSR"),
    ...sequence("HR", 30, "HY11-HR"),
    ...sequence("UR", 16, "HY11-UR"),
    ...sequence("LSR", 16, "HY11-LSR"),
    ...sequence("SGR", 8, "HY11-SGR"),
    ...sequence("ZR", 7, "HY11-ZR"),
    ...sequence("SC", 7, "HY11-SC"),
    ...sequence("DZR", 2, "HY11-\u25C7ZR"),
];
export const CHINESE_MOON_TWELVE_CODES: ChineseCardCode[] = [
    ...sequence("R", 30, "HY12-R"),
    ...sequence("SR", 20, "HY12-SR"),
    ...sequence("SSR", 26, "HY12-SSR"),
    ...sequence("HR", 30, "HY12-HR"),
    ...sequence("UR", 16, "HY12-UR"),
    ...sequence("LSR", 16, "HY12-LSR"),
    ...sequence("SGR", 10, "HY12-SGR"),
    ...sequence("ZR", 7, "HY12-ZR"),
    ...sequence("SC", 7, "HY12-SC"),
    ...sequence("DZR", 2, "HY12-\u25C7ZR"),
];
export const CHINESE_FUN_ONE_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "YH-N01"),
    ...sequence("DN", 20, "\u25C7YH-N01"),
    ...sequence("R", 12, "YH-T03"),
    ...sequence("R", 20, "YH-T04", 1, 12),
    ...sequence("SR", 9, "YH-T03", 13),
    ...sequence("SR", 6, "YH-T04", 35, 9),
    ...sequence("SSR", 9, "YH-T03", 31),
    ...sequence("SSR", 6, "YH-T04", 49, 9),
    ...sequence("UR", 10, "YH-UR", 40),
    ...sequence("CR", 9, "YH-CR"),
];
export const CHINESE_FUN_TWO_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "YH-N02"),
    ...sequence("DN", 20, "\u25C7YH-N02"),
    ...sequence("R", 20, "YH-T04"),
    ...sequence("R", 20, "YH-T05", 1, 20),
    ...sequence("SR", 13, "YH-T05", 21),
    ...sequence("SR", 2, "YH-T05", 38, 13),
    ...sequence("SSR", 14, "YH-T04", 41),
    ...sequence("SSR", 6, "YH-T05", 55, 14),
    ...sequence("UR", 6, "YH-UR", 55),
    ...sequence("UR", 4, "YH-UR", 64, 6),
    ...sequence("CR", 12, "YH-CR", 10),
];
export const CHINESE_FUN_THREE_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "QY03-N"),
    ...sequence("DN", 20, "QY03-\u25C7N"),
    ...sequence("R", 13, "YH-T05"),
    ...sequence("R", 2, "YH-T05", 16, 13),
    ...sequence("R", 20, "HY06-R", 1, 15),
    ...sequence("SR", 15, "QY03-SR"),
    ...sequence("SSR", 6, "YH-T05", 47),
    ...sequence("SSR", 2, "YH-T05", 57, 6),
    ...sequence("SSR", 14, "HY06-SSR", 7, 8),
    ...sequence("UR", 10, "HY06-UR"),
    ...sequence("CR", 12, "QY03-CR"),
];
export const CHINESE_FUN_FOUR_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "QY04-N"),
    ...sequence("DN", 20, "QY04-\u25C7N"),
    ...sequence("R", 15, "HY06-R"),
    ...sequence("R", 20, "HY07-R", 1, 15),
    ...sequence("SR", 15, "QY04-SR"),
    ...sequence("SSR", 15, "QY04-SSR"),
    ...sequence("UR", 6, "HY07-UR"),
    ...sequence("UR", 3, "HY07-UR", 10, 6),
    ...sequence("UR", 1, "HY07-UR", 14, 9),
    ...sequence("CR", 12, "QY04-CR"),
];
export const CHINESE_FUN_FIVE_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "QY05-N"),
    ...sequence("DN", 20, "QY05-\u25C7N"),
    ...sequence("R", 20, "HY07-R"),
    ...sequence("R", 20, "HY08-R", 1, 20),
    ...sequence("SR", 15, "QY05-SR"),
    ...sequence("SSR", 15, "QY05-SSR"),
    ...sequence("UR", 6, "HY08-UR"),
    ...sequence("UR", 4, "HY08-UR", 12, 6),
    ...sequence("UGR", 9, "QY05-UGR"),
    ...sequence("CR", 12, "QY05-CR"),
];
export const CHINESE_FUN_SIX_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "QY06-N"),
    ...sequence("DN", 20, "QY06-\u25C7N"),
    ...sequence("R", 15, "HY08-R"),
    ...sequence("R", 20, "HY09-R", 1, 15),
    ...sequence("SR", 15, "HY09-SR"),
    ...sequence("SSR", 15, "QY06-SSR"),
    ...sequence("UR", 15, "CH05-USR"),
    ...sequence("UGR", 9, "QY06-UGR"),
    ...sequence("CR", 12, "QY06-CR"),
    ...sequence("DCR", 12, "QY06-\u25C7CR"),
];
export const CHINESE_FUN_SEVEN_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "QY07-N"),
    ...sequence("DN", 20, "QY07-\u25C7N"),
    ...sequence("R", 15, "HY09-R"),
    ...sequence("R", 20, "HY10-R", 1, 15),
    ...sequence("SR", 15, "QY07-SR"),
    ...sequence("SSR", 15, "QY07-SSR"),
    ...sequence("UR", 13, "QY07-UR"),
    ...sequence("UGR", 9, "QY07-UGR"),
    ...sequence("CR", 12, "QY07-CR"),
    ...sequence("DCR", 12, "QY07-\u25C7CR"),
];
export const CHINESE_FUN_EIGHT_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "QY08-N"),
    ...sequence("DN", 20, "QY08-\u25C7N"),
    ...sequence("R", 15, "HY10-R"),
    ...sequence("R", 20, "HY11-R", 1, 15),
    ...sequence("SR", 15, "QY08-SR"),
    ...sequence("SSR", 15, "QY08-SSR"),
    ...sequence("UR", 13, "QY08-UR"),
    ...sequence("UGR", 8, "QY08-UGR"),
    ...sequence("CR", 13, "QY08-CR"),
    ...sequence("DCR", 12, "QY08-\u25C7CR"),
];
export const CHINESE_FUN_NINE_CODES: ChineseCardCode[] = [
    ...sequence("N", 20, "QY09-N"),
    ...sequence("DN", 20, "QY09-\u25C7N"),
    ...sequence("R", 35, "QY09-R"),
    ...sequence("SR", 15, "HY12-SR"),
    ...sequence("SSR", 15, "QY09-SSR"),
    ...sequence("UR", 13, "QY09-UR"),
    ...sequence("UGR", 9, "QY09-UGR"),
    ...sequence("CR", 12, "QY09-CR"),
    ...sequence("DCR", 12, "QY09-\u25C7CR"),
];
export const CHINESE_RAINBOW_ONE_CODES: ChineseCardCode[] = [
    ...sequence("R", 40, "YH-F01"),
    ...sequence("SR", 20, "YH-F01", 41),
    ...sequence("SSR", 15, "YH-F01", 61),
    ...sequence("TR", 15, "YH-TR"),
    ...sequence("TGR", 5, "YH-TGR"),
    ...sequence("UR", 12, "YH-UR"),
];
export const CHINESE_RAINBOW_TWO_CODES: ChineseCardCode[] = [
    ...sequence("TR", 15, "YH-TR", 16),
    ...sequence("TGR", 6, "YH-TGR", 6),
    ...sequence("SSR", 12, "YH-F02"),
    ...sequence("UR", 6, "YH-UR", 25),
];
export const CHINESE_RAINBOW_THREE_CODES: ChineseCardCode[] = [
    ...sequence("R", 10, "YH-T04"),
    ...sequence("R", 20, "YH-T05", 1, 10),
    ...sequence("FR", 18, "YH-FR"),
    ...sequence("SR", 13, "YH-T05", 21),
    ...sequence("SR", 2, "YH-T05", 38, 13),
    ...sequence("SSR", 14, "YH-T04", 41),
    ...sequence("SSR", 6, "YH-T05", 55, 14),
    ...sequence("TR", 12, "YH-TR", 31),
    ...sequence("TGR", 8, "YH-TGR"),
    ...sequence("MTR", 18, "YH-MTR"),
    ...sequence("UR", 5, "YH-UR", 45),
    ...sequence("UR", 6, "YH-UR", 55, 5),
    ...sequence("UR", 4, "YH-UR", 64, 11),
    ...sequence("USR", 8, "YH-USR"),
    ...sequence("XR", 7, "YH-XR"),
];
export const CHINESE_RAINBOW_FOUR_CODES: ChineseCardCode[] = [
    ...sequence("R", 10, "YH-T05"),
    ...sequence("R", 20, "HY06-R", 1, 10),
    ...sequence("FR", 18, "CH04-FR"),
    ...sequence("TR", 12, "CH04-TR"),
    ...sequence("TGR", 8, "CH04-TGR"),
    ...sequence("MTR", 18, "CH04-MTR"),
    ...sequence("SR", 7, "QY03-SR"),
    ...sequence("SR", 3, "QY03-SR", 13, 7),
    ...sequence("SSR", 15, "QY04-SSR"),
    ...sequence("UR", 15, "CH04-UR"),
    ...sequence("USR", 8, "CH04-USR"),
    ...sequence("XR", 7, "CH04-XR"),
];
export const CHINESE_RAINBOW_FIVE_CODES: ChineseCardCode[] = [
    ...sequence("BASE", 18, "CH05-BASE"),
    ...sequence("ST", 20, "CH05-ST"),
    ...sequence("R", 15, "HY08-R"),
    ...sequence("R", 15, "HY09-R", 1, 15),
    ...sequence("TR", 12, "CH05-TR"),
    ...sequence("TGR", 8, "CH05-TGR"),
    ...sequence("FR", 18, "CH05-FR"),
    ...sequence("SR", 6, "HY09-SR"),
    ...sequence("SR", 8, "HY09-SR", 13, 6),
    ...sequence("SSR", 6, "HY09-SSR"),
    ...sequence("SSR", 8, "HY09-SSR", 13, 6),
    ...sequence("SSR", 1, "CH05-SSR", 1, 14),
    ...sequence("UR", 19, "CH05-UR"),
    ...sequence("USR", 8, "CH05-USR"),
    ...sequence("XR", 8, "CH05-XR"),
];
export const CHINESE_STAR_ONE_CODES: ChineseCardCode[] = [
    ...sequence("SSR", 20, "FX01-SSR"),
    ...sequence("SCR", 12, "FX01-SCR"),
    ...sequence("UR", 10, "FX01-UR"),
    ...sequence("USR", 10, "FX01-USR"),
    ...sequence("AR", 9, "FX01-AR"),
    ...sequence("OR", 6, "FX01-0R"),
    ...sequence("BP", 6, "FX01-BP"),
    ...sequence("DAR", 9, "FX01-\u25C7AR"),
];
export const CHINESE_STAR_TWO_CODES: ChineseCardCode[] = [
    ...sequence("SSR", 20, "FX02-SSR"),
    ...sequence("SCR", 18, "FX02-SCR"),
    ...sequence("UR", 18, "FX02-UR"),
    ...sequence("USR", 15, "FX02-USR"),
    ...sequence("AR", 9, "FX02-AR"),
    ...sequence("OR", 7, "FX02-OR"),
    ...sequence("BP", 9, "FX02-BP"),
    ...sequence("DAR", 9, "FX02-\u25C7AR"),
];
export const CHINESE_STAR_THREE_CODES: ChineseCardCode[] = [
    ...sequence("MTR", 26, "FX03-MTR"),
    ...sequence("SSR", 20, "FX03-SSR"),
    ...sequence("SCR", 18, "FX03-SCR"),
    ...sequence("UR", 18, "FX03-UR"),
    ...sequence("USR", 16, "FX03-USR"),
    ...sequence("AR", 9, "FX03-AR"),
    ...sequence("OR", 8, "FX03-OR"),
    ...sequence("BP", 8, "FX03-BP"),
    ...sequence("DAR", 13, "FX03-DAR"),
    ...sequence("SE", 8, "FX03-SE"),
];
export const CHINESE_PROMOS_CODES: ChineseCardCode[] = [
    ...sequence("PR", 19, "YH-PR"),
    { key: "PR-D19", rarity: "PR", number: 19, code: "\u25C7YH-PR-019" },
    ...sequence("PR", 63, "YH-PR", 20, 19),
    ...sequence("TFXMLP", 2, "TFXMLP-PR"),
    ...sequence("KB", 3, "YH-KB"),
    ...sequence("SPR", 6, "YH-SPR"),
];
export const CHINESE_STARDUST_ONE_CODES: ChineseCardCode[] = [
    ...sequence("SR", 20, "YH-PL01"),
    ...sequence("SSR", 12, "YH-PL01", 21),
    ...sequence("UR", 6, "PL01-UR"),
    ...sequence("LSR", 6, "PL-LSR"),
    ...sequence("SGR", 12, "PL-SGR"),
    ...sequence("DUR", 7, "PL-\u25C7UR"),
    ...sequence("DLSR", 7, "PL-\u25C7LSR"),
    ...sequence("SP", 5, "PL-SP"),
];
export const CHINESE_STARDUST_TWO_CODES: ChineseCardCode[] = [
  ...sequence("SR", 24, "PL02-SR"),
  ...sequence("SSR", 18, "PL02-SSR"),
  ...sequence("UR", 15, "PL02-UR"),
  ...sequence("LSR", 9, "PL02-LSR"),
  ...sequence("SGR", 12, "PL02-SGR"),
  ...sequence("DUR", 10, "PL02-\u25C7UR"),
  ...sequence("DLSR", 10, "PL02-\u25C7LSR"),
  ...sequence("SP", 13, "PL02-SP"),
];
export const CHINESE_MAGICBOOK_ONE_CODES: ChineseCardCode[] = [
  ...sequence("SF", 22, "ML01-SF"),
  ...sequence("ZP", 20, "ML01-ZP"),
  ...sequence("YD", 18, "ML01-YD"),
  ...sequence("DA", 20, "ML01-DA"),
  ...sequence("SP", 7, "ML01-SP"),
];
export const CHINESE_NEWYEARS_ONE_CODES: ChineseCardCode[] = [
  ...sequence("SM", 6, "YH-HN01"),
  ...sequence("CB", 6, "YH-HN01", 7),
  ...sequence("T", 6, "YH-HN01", 13),
  ...sequence("S", 6, "YH-HN01", 19),
];
export const CHINESE_NEWYEARS_TWO_CODES: ChineseCardCode[] = [
  ...sequence("ST", 18, "FL02-ST"),
  ...sequence("DST", 18, "FL02-\u25C7ST"),
  ...sequence("TR", 18, "FL02-TR"),
  ...sequence("CH", 15, "FL02-CH"),
  ...sequence("ZH", 8, "FL02-ZH"),
  ...sequence("SP", 8, "FL02-SP"),
  ...sequence("DSP", 6, "FL02-\u25C7SP"),
  ...sequence("MT", 6, "FL02-MT"),
];
export type ChineseKujiPrizeGroup = { raffle: string; type: string; label: string; imagePrefix: string; codes?: string[]; names?: string[]; imageFiles?: string[] };
export const CHINESE_KUJI_RAFFLE_PRIZES: ChineseKujiPrizeGroup[] = [
    { raffle: "1", type: "TICKET", label: "Ticket", imagePrefix: "KUJI1-TICKET", codes: Array.from({ length: 10 }, (_, index) => `KYS-MLP01-${String(index + 1).padStart(2, "0")}`) },
    { raffle: "2", type: "TICKET", label: "Ticket", imagePrefix: "KUJI2-TICKET", codes: [
        ...Array.from({ length: 12 }, (_, index) => `KYS-MLP02-B${String(index + 1).padStart(2, "0")}`),
        ...Array.from({ length: 3 }, (_, index) => `KYS-MLP02-A${String(index + 1).padStart(2, "0")}`),
        ...Array.from({ length: 6 }, (_, index) => `KYS-MLP02-S${String(index + 1).padStart(2, "0")}`),
    ] },
    { raffle: "3", type: "TICKET", label: "Ticket", imagePrefix: "KUJI3-TICKET", codes: [
        ...Array.from({ length: 6 }, (_, index) => `KYS-MLP03-C${String(index + 1).padStart(2, "0")}`),
        ...Array.from({ length: 4 }, (_, index) => `KYS-MLP03-B${String(index + 1).padStart(2, "0")}`),
        ...Array.from({ length: 6 }, (_, index) => `KYS-MLP03-A${String(index + 1).padStart(2, "0")}`),
    ] },
    { raffle: "4", type: "TICKET", label: "Ticket", imagePrefix: "KUJI4-TICKET", codes: [
        ...Array.from({ length: 12 }, (_, index) => `KYS-MLP04-B${String(index + 1).padStart(2, "0")}`),
        ...Array.from({ length: 4 }, (_, index) => `KYS-MLP04-A${String(index + 1).padStart(2, "0")}`),
        ...Array.from({ length: 7 }, (_, index) => `KYS-MLP04-S${String(index + 1).padStart(2, "0")}`),
    ] },
    { raffle: "3", type: "C", label: "C Ticket", imagePrefix: "KUJI3-C", codes: Array.from({ length: 6 }, (_, index) => `KYS-MLP03-S${String(index + 1).padStart(2, "0")}`) },
    { raffle: "2", type: "E", label: "Pin", imagePrefix: "KUJI2-E", codes: Array.from({ length: 10 }, (_, index) => `MLP-E-${String(index + 9).padStart(2, "0")}`) },
    { raffle: "1", type: "B", label: "B Prize", imagePrefix: "KUJI1-B", names: Array.from({ length: 4 }, (_, index) => `Raffle 1 - B Prize ${index + 1}`) },
    { raffle: "1", type: "A", label: "A Prize", imagePrefix: "KUJI1-A", names: Array.from({ length: 2 }, (_, index) => `Raffle 1 - A Prize ${index + 1}`) },
    { raffle: "1", type: "S", label: "S Prize", imagePrefix: "KUJI1-S", names: ["Raffle 1 - S Prize"], imageFiles: ["KUJI1-S.webp"] },
    { raffle: "1", type: "LAST", label: "LAST Prize", imagePrefix: "KUJI1-LAST", names: ["Raffle 1 - LAST Prize"], imageFiles: ["KUJI1-LAST.webp"] },
    { raffle: "2", type: "B", label: "B Prize", imagePrefix: "KUJI2-B", names: Array.from({ length: 4 }, (_, index) => `Raffle 2 - B Prize ${index + 1}`) },
    { raffle: "2", type: "A", label: "A Prize", imagePrefix: "KUJI2-A", names: Array.from({ length: 2 }, (_, index) => `Raffle 2 - A Prize ${index + 1}`) },
    { raffle: "2", type: "S", label: "S Prize", imagePrefix: "KUJI2-S", names: ["Raffle 2 - S Prize"], imageFiles: ["KUJI2-S.webp"] },
    { raffle: "2", type: "LAST", label: "LAST Prize", imagePrefix: "KUJI2-LAST", names: ["Raffle 2 - LAST Prize"], imageFiles: ["KUJI2-LAST.webp"] },
    { raffle: "3", type: "B", label: "B Prize", imagePrefix: "KUJI3-B", names: Array.from({ length: 4 }, (_, index) => `Raffle 3 - B Prize ${index + 1}`) },
    { raffle: "3", type: "A", label: "A Prize", imagePrefix: "KUJI3-A", names: Array.from({ length: 2 }, (_, index) => `Raffle 3 - A Prize ${index + 1}`) },
    { raffle: "3", type: "S", label: "S Prize", imagePrefix: "KUJI3-S", names: ["Raffle 3 - S Prize"], imageFiles: ["KUJI3-S.webp"] },
    { raffle: "3", type: "LAST", label: "LAST Prize", imagePrefix: "KUJI3-LAST", names: ["Raffle 3 - LAST Prize"], imageFiles: ["KUJI3-LAST.webp"] },
    { raffle: "4", type: "B", label: "B Prize", imagePrefix: "KUJI4-B", names: Array.from({ length: 4 }, (_, index) => `Raffle 4 - B Prize ${index + 1}`) },
    { raffle: "4", type: "A", label: "A Prize", imagePrefix: "KUJI4-A", names: Array.from({ length: 2 }, (_, index) => `Raffle 4 - A Prize ${index + 1}`) },
    { raffle: "4", type: "S", label: "S Prize", imagePrefix: "KUJI4-S", names: ["Raffle 4 - S Prize"], imageFiles: ["KUJI4-S.webp"] },
    { raffle: "4", type: "LAST", label: "LAST Prize", imagePrefix: "KUJI4-LAST", names: ["Raffle 4 - LAST Prize"], imageFiles: ["KUJI4-LAST.webp"] },
];
export const CHINESE_KUJI_RAFFLES_CODES: (ChineseCardCode & { imageFile: string; displayName?: string })[] = CHINESE_KUJI_RAFFLE_PRIZES.flatMap(prize => (prize.codes ?? prize.names ?? []).map((value, index) => ({ key: `${prize.raffle}-${prize.type}-${index + 1}`, rarity: prize.raffle, number: index + 1, code: prize.codes ? value : "", ...(prize.names ? { displayName: value } : {}), imageFile: prize.imageFiles?.[index] ?? `${prize.imagePrefix}${index + 1}.webp` })));
export const CHINESE_LASER_TICKETS_CODES: ChineseCardCode[] = [
    ...sequence("LTR", 12, "XH-LTR"),
    ...Array.from({ length: 14 }, (_, index) => ({ key: `SH-${index + 1}`, rarity: "SH", number: index + 1, code: index < 6 ? `YH-LTR-${String(index + 1).padStart(3, "0")}` : index < 12 ? `YH-LTSR-${String(index - 5).padStart(3, "0")}` : index === 12 ? "YH-LTSR-002" : "YH-LTSR-008" })),
];
