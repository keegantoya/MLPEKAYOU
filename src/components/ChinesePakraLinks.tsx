import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { CARD_IMAGE_WORKER_URL } from "@/lib/card-images";
type SetShop = { name: string; collection: string | null; products: Record<string, string> };
const shops: Record<string, SetShop> = {
  "/cn-moon-one": {
    "name": "Moon: Edition 1",
    "collection": "mlp-moon-1",
    "products": {
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-1-t4w1-yh-lsr-single-cards",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-1-t4w1-yh-r-single-cards",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-1-t4w1-yh-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-1-t4w1-yh-sr-single-cards",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-1-t4w1-yh-ssr-single-cards",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-1-t4w1-yh-ur-single-cards"
    }
  },
  "/cn-moon-two": {
    "name": "Moon: Edition 2",
    "collection": "mlp-moon-2",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-2-t4w2-yh-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-2-t4w2-yh-lsr-single-cards",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-2-t4w2-yh-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-2-t4w2-yh-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-2-t4w2-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-2-t4w2-yh-ssr-single-cards",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-2-t4w2-yh-ur-card-bundle"
    }
  },
  "/cn-moon-three": {
    "name": "Moon: Edition 3",
    "collection": "mlp-moon-3",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-3-t4w3-yh-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-3-t4w3-yh-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-3-t4w3-yh-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-3-t4w3-yh-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-3-t4w3-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-3-t4w3-yh-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-3-t4w3-yh-ur-card-bundle"
    }
  },
  "/cn-moon-four": {
    "name": "Moon: Edition 4",
    "collection": "mlp-moon-4",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-4-t4w4-yh-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-4-t4w4-yh-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-4-t4w4-yh-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-4-t4w4-yh-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-4-t4w4-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-4-t4w4-yh-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-4-t4w4-yh-ur-card-bundle"
    }
  },
  "/cn-moon-five": {
    "name": "Moon: Edition 5",
    "collection": "mlp-moon-5",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-5-t4w5-yh-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-5-t4w5-yh-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-5-t4w5-yh-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-5-t4w5-yh-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-5-t4w5-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-5-t4w5-yh-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-5-t4w5-yh-ur-card-bundle"
    }
  },
  "/cn-moon-six": {
    "name": "Moon: Edition 6",
    "collection": "mlp-moon-6",
    "products": {
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-6-t4w6-hy06-lsr-card-bundle",
      "PTR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-6-t4w6-hy06-ptr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-6-t4w6-hy06-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-6-t4w6-hy06-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-6-t4w6-hy06-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-6-t4w6-hy06-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-6-t4w6-hy06-ur-card-bundle"
    }
  },
  "/cn-moon-seven": {
    "name": "Moon: Edition 7",
    "collection": "mlp-moon-7",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-7-t4w7-hy07-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-7-t4w7-hy07-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-7-t4w7-hy07-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-7-t4w7-hy07-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-7-t4w7-hy07-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-7-t4w7-hy07-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-7-t4w7-hy07-ur-card-bundle"
    }
  },
  "/cn-moon-eight": {
    "name": "Moon: Edition 8",
    "collection": "mlp-moon-8",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-ur-card-bundle",
      "ZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-zr-single-cards",
      "DZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-8-t4w8-hy08-dzr-single-cards"
    }
  },
  "/cn-moon-nine": {
    "name": "Moon: Edition 9",
    "collection": "mlp-moon-9",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-ur-card-bundle",
      "ZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-zr-single-cards",
      "DZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-9-t4w9-hy09-dzr-single-cards"
    }
  },
  "/cn-moon-ten": {
    "name": "Moon: Edition 10",
    "collection": "mlp-moon-10",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-ur-card-bundle",
      "ZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-zr-single-cards",
      "DZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-10-t4w10-hy10-dzr-single-cards"
    }
  },
  "/cn-moon-eleven": {
    "name": "Moon: Edition 11",
    "collection": "mlp-moon-11",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-ur-card-bundle",
      "ZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-zr-single-cards",
      "DZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-11-t4w11-hy11-dzr-single-cards"
    }
  },
  "/cn-moon-twelve": {
    "name": "Moon: Edition 12",
    "collection": "mlp-moon-12",
    "products": {
      "HR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-hr-card-bundle",
      "LSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-lsr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-r-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-sgr-single-cards",
      "SR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-ur-card-bundle",
      "ZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-zr-single-cards",
      "DZR": "https://pakracards.com/products/kayou-mlp-moon-edition-chinese-series-12-t4w12-hy12-dzr-single-cards",
      "REDEMPTION": "https://pakracards.com/products/moon12-redemption-card-binder-14-17-10-24-1-97-in"
    }
  },
  "/cn-moon-thirteen": {
    "name": "Moon: Edition 13",
    "collection": "mlp-moon-13",
    "products": {}
  },
  "/cn-fun-one": {
    "name": "Fun Moments: Edition 1",
    "collection": "mlp-fun-moments-1",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-1-t2w1-yh-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-1-t2w1-yh-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-1-t2w1-yh-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-1-t2w1-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-1-t2w1-yh-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-1-t2w1-yh-ur-card-bundle",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-1-t2w1-yh-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-two": {
    "name": "Fun Moments: Edition 2",
    "collection": "mlp-fun-moments-2",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-2-t2w2-yh-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-2-t2w2-yh-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-2-t2w2-yh-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-2-t2w2-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-2-t2w2-yh-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-2-t2w2-yh-ur-card-bundle",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-2-t2w2-yh-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-three": {
    "name": "Fun Moments: Edition 3",
    "collection": "mlp-fun-moments-3",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-3-t2w3-qy03-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-3-t2w3-qy03-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-3-t2w3-yh-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-3-t2w3-qy03-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-3-t2w3-yh-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-3-t2w3-qy03-ur-card-bundle",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-3-t2w3-qy03-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-four": {
    "name": "Fun Moments: Edition 4",
    "collection": "mlp-fun-moments-4",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-4-t2w4-qy04-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-4-t2w4-qy04-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-4-t2w4-hy07-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-4-t2w4-qy04-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-4-t2w4-qy04-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-4-t2w4-hy07-ur-card-bundle",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-4-t2w4-qy04-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-five": {
    "name": "Fun Moments: Edition 5",
    "collection": "mlp-fun-moments-5",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-qy05-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-qy05-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-hy08-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-qy05-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-qy05-ssr-card-bundle",
      "UGR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-qy05-ugr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-hy08-ur-card-bundle",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-5-t2w5-qy05-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-six": {
    "name": "Fun Moments: Edition 6",
    "collection": "mlp-fun-moments-6",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-qy06-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-qy06-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-hy09-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-hy09-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-qy06-ssr-card-bundle",
      "UGR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-qy06-ugr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-ch05-ur-card-bundle",
      "DCR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-qy06-qcr-single-cards",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-6-t2w6-qy06-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-seven": {
    "name": "Fun Moments: Edition 7",
    "collection": "mlp-fun-moments-7",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-qy07-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-qy07-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-hy10-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-hy10-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-qy07-ssr-card-bundle",
      "UGR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-qy07-ugr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-qy07-ur-card-bundle",
      "DCR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-qy07-qcr-single-cards",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-7-t2w7-qy07-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-eight": {
    "name": "Fun Moments: Edition 8",
    "collection": "mlp-fun-moments-8",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-qy08-cr-single-cards",
      "N": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-qy08-n-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-hy11-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-hy11-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-qy08-ssr-card-bundle",
      "UGR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-qy08-ugr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-qy08-ur-card-bundle",
      "DCR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-qy08-hidden-diamond-cr-single-cards",
      "DN": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-chinese-series-8-t2w8-qy08-hidden-diamond-n-card-bundle"
    }
  },
  "/cn-fun-nine": {
    "name": "Fun Moments: Edition 9",
    "collection": "mlp-fun-moments-9",
    "products": {
      "CR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-9-qy09-cr-single-cards",
      "DCR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-9-qy09-hidden-cr-single-cards",
      "SSR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-9-qy09-ssr-single-cards",
      "UGR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-9-qy09-ugr-single-cards",
      "UR": "https://pakracards.com/products/kayou-mlp-fun-moments-edition-9-qy09-ur-single-cards"
    }
  },
  "/cn-rainbow-one": {
    "name": "Rainbow: Edition 1",
    "collection": "mlp-rainbow-1",
    "products": {
      "R": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-1-t3w1-yh-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-1-t3w1-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-1-t3w1-yh-ssr-single-cards",
      "TGR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-1-t3w1-yh-tgr-card-bundle",
      "TR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-1-t3w1-yh-tr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-1-t3w1-yh-ur-card-bundle"
    }
  },
  "/cn-rainbow-two": {
    "name": "Rainbow: Edition 2",
    "collection": "mlp-rainbow-2",
    "products": {
      "R": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-2-t3w2-yh-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-2-t3w2-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-2-t3w2-yh-ssr-card-bundle",
      "TGR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-2-t3w2-yh-tgr-card-bundle",
      "TR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-2-t3w2-yh-tr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-2-t3w2-yh-ur-card-bundle"
    }
  },
  "/cn-rainbow-three": {
    "name": "Rainbow: Edition 3",
    "collection": "mlp-rainbow-3",
    "products": {
      "FR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-fr-card-bundle",
      "MTR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-mtr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-ssr-card-bundle",
      "TGR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-tgr-card-bundle",
      "TR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-tr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-ur-card-bundle",
      "USR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-usr-single-cards",
      "XR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-3-t3w3-yh-xr-single-cards"
    }
  },
  "/cn-rainbow-four": {
    "name": "Rainbow: Edition 4",
    "collection": "mlp-rainbow-4",
    "products": {
      "MTR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-mtr-card-bundle",
      "FR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-fr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-yh-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-hy06-ssr-card-bundle",
      "TGR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-tgr-card-bundle",
      "TR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-tr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-ur-card-bundle",
      "XR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-xr-single-cards",
      "USR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-4-t3w4-ch04-usr-single-cards"
    }
  },
  "/cn-rainbow-five": {
    "name": "Rainbow: Edition 5",
    "collection": "mlp-rainbow-5",
    "products": {
      "FR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-fr-card-bundle",
      "R": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-r-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-hy09-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-ssr-card-bundle",
      "TGR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-tgr-card-bundle",
      "TR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-tr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-ur-card-bundle",
      "USR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-usr-single-cards",
      "XR": "https://pakracards.com/products/kayou-mlp-rainbow-edition-chinese-series-5-t3w5-ch05-xr-single-cards"
    }
  },
  "/cn-star-one": {
    "name": "Star: Edition 1",
    "collection": "mlp-star-1",
    "products": {
      "AR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-fx01-ar-single-cards",
      "BP": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-fx01-bp-single-cards",
      "OR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-fx01-or-single-cards",
      "SCR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-fx01-scr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-fx01-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-fx01-ur-card-bundle",
      "USR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-fx01-usr-card-bundle",
      "DAR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-1-t5w1-hidden-ar-single-cards"
    }
  },
  "/cn-star-two": {
    "name": "Star: Edition 2",
    "collection": "mlp-star-2",
    "products": {
      "AR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-ar-single-cards",
      "BP": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-bp-single-cards",
      "OR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-or-single-cards",
      "SCR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-scr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-ur-card-bundle",
      "USR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-usr-card-bundle",
      "DAR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-2-t5w2-fx02-hidden-diamond-ar-single-cards"
    }
  },
  "/cn-star-three": {
    "name": "Star: Edition 3",
    "collection": "mlp-star-3",
    "products": {
      "AR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-ar-single-cards",
      "BP": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-bp-single-cards",
      "DAR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-hidden-ar-standard-single-cards",
      "MTR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-mtr-card-bundle",
      "OR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-or-single-cards",
      "SCR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-scr-card-bundle",
      "SE": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-se-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-ur-card-bundle",
      "USR": "https://pakracards.com/products/kayou-mlp-star-edition-chinese-series-3-t5w3-fx03-usr-card-bundle"
    }
  },
  "/cn-stardust-one": {
    "name": "Stardust: Edition 1",
    "collection": "mlp-stardust-1",
    "products": {
      "LSR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-lsr-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-sgr-card-bundle",
      "SP": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-sp-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-ur-card-bundle",
      "DLSR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-hidden-diamond-lsr-card-bundle",
      "DUR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-1-hidden-diamond-ur-card-bundle"
    }
  },
  "/cn-stardust-two": {
    "name": "Stardust: Edition 2",
    "collection": "mlp-stardust-2",
    "products": {
      "LSR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-lsr-card-bundle",
      "SGR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-sgr-card-bundle",
      "SP": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-sp-card-bundle",
      "SR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-sr-card-bundle",
      "SSR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-ssr-card-bundle",
      "UR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-ur-card-bundle",
      "DLSR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-hidden-diamond-lsr-card-bundle",
      "DUR": "https://pakracards.com/products/kayou-mlp-qi-meng-party-2-hidden-diamond-ur-card-bundle"
    }
  },
  "/cn-magicbook-one": {
    "name": "Equestria Girls",
    "collection": "mlp-equestria-girls-magic-book",
    "products": {}
  },
  "/cn-newyears-one": {
    "name": "New Years Eve 2025",
    "collection": "mlp-new-years-eve-2025",
    "products": {
      "HN": "https://pakracards.com/products/kayou-mlp-fu-lai-gift-box-hn-card-bundle",
      "MT": "https://pakracards.com/products/kayou-mlp-fu-lai-gift-box-2-mt-card-bundle",
      "SP": "https://pakracards.com/products/kayou-mlp-fu-lai-gift-box-2-sp-card-bundle",
      "TR": "https://pakracards.com/products/kayou-mlp-fu-lai-gift-box-2-tr-card-bundle",
      "DSP": "https://pakracards.com/products/kayou-mlp-fu-lai-gift-box-2-hidden-diamond-sp-card-bundle"
    }
  },
  "/cn-newyears-two": {
    "name": "Spring Festival 2 Fu Lai Qi Yun",
    "collection": "mlp-spring-festival-2-fu-lai-qi-yun",
    "products": {}
  },
  "/cn-promos": {
    "name": "My Little Pony Chinese Promotional Cards",
    "collection": "mlp-ccg-promotional-cards",
    "products": {}
  },
  "/cn-laser-tickets": {
    "name": "My Little Pony Stained Glass Tickets",
    "collection": "mlp-searchfun-stained-glass-tickets",
    "products": {}
  },
  "/cn-kuji-raffles": {
    "name": "My Little Pony Kuji Raffle",
    "collection": null,
    "products": {}
  }
};
export function normalizePakraRarity(value: string) {
  const clean=value.trim().toUpperCase().replace(/(?:<>|\u25C7|\u2662|\u203B)/g,"D").replace(/\s+/g,"");
  return clean === "REDEMPTIONPRIZE" ? "REDEMPTION" : clean;
}
export function getChinesePakraLink(pathname: string, rarity: string, currentProducts?: Record<string,string>) {
  const route=pathname.replace(/\/+$/,"").toLowerCase();
  const set=shops[route];
  if (!set) return null;
  const key=normalizePakraRarity(rarity);
  if (!key) return null;
  const exact=(currentProducts ?? set.products)[key];
  if (exact) return { href:exact, exact:true, name:set.name, rarity:key };
  // A missing listing must never be replaced by an invented product URL.
  const display=key.replace(/^D(?=N$|CR$|ZR$|AR$|SP$|UR$|LSR$)/,"\u25C7");
  const params=new URLSearchParams({type:"product",q:`"${set.name}" "${display}"`});
  return {href:`https://pakracards.com/search?${params}`,exact:false,name:set.name,rarity:key};
}
const catalogCache=new Map<string,{checkedAt:number;products:Record<string,string>}>();
const CATALOG_TTL=60*60*1000;
type Placement = { route:string; rarity:string; host:HTMLDivElement };
export default function ChinesePakraLinks() {
  const {pathname}=useLocation();
  const route=pathname.replace(/\/+$/,"").toLowerCase();
  const [placement,setPlacement]=useState<Placement | null>(null);
  const [catalog,setCatalog]=useState<{collection:string;products:Record<string,string>} | null>(null);
  const collection=shops[route]?.collection;
  useEffect(()=>{
    if(!collection){setCatalog(null);return;}
    const controller=new AbortController();
    let inFlight=false;
    const refresh=async()=>{
      if(controller.signal.aborted || inFlight)return;
      const cached=catalogCache.get(collection);
      if(cached && Date.now()-cached.checkedAt<CATALOG_TTL){setCatalog({collection,products:cached.products});return;}
      inFlight=true;
      try{
        const url=new URL("/pakra-rarities",CARD_IMAGE_WORKER_URL);
        url.searchParams.set("collection",collection);
        const response=await fetch(url,{signal:controller.signal,credentials:"omit"});
        if(!response.ok)return;
        const data=await response.json();
        if(data.collection!==collection || !data.products || typeof data.products!=="object" || Array.isArray(data.products))return;
        const products:Record<string,string>={};
        for(const [rarity,href] of Object.entries(data.products)){
          if(/^[A-Z0-9-]+$/.test(rarity) && typeof href==="string" && /^https:\/\/pakracards\.com\/products\/[a-z0-9-]+$/.test(href))products[rarity]=href;
        }
        if(controller.signal.aborted)return;
        catalogCache.set(collection,{checkedAt:typeof data.checkedAt==="number" ? Math.min(data.checkedAt,Date.now()) : Date.now(),products});
        setCatalog({collection,products});
      }catch{/* Keep the verified built-in links if the catalog is temporarily unavailable. */}
      finally{inFlight=false;}
    };
    void refresh();
    const timer=window.setInterval(()=>void refresh(),5*60*1000);
    const onVisible=()=>{if(document.visibilityState==="visible")void refresh();};
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{controller.abort();clearInterval(timer);document.removeEventListener("visibilitychange",onVisible);};
  },[collection]);
  useEffect(()=>{
    if (!shops[route]) {setPlacement(null);return;}
    let host:HTMLDivElement | null=null;
    let frame=0,disposed=false;
    // The existing Chinese checklists share this semantic rarity layout.
    // Mount one React portal there so every checklist keeps its current collection logic.
    const locate=()=>{
      frame=0;
      if(disposed)return;
      const gallery=document.querySelector<HTMLElement>("main.cn-gallery");
      const section=gallery?.querySelector<HTMLElement>(".cn-shell > section");
      const active=gallery?.querySelector<HTMLElement>('.cn-rarity[aria-pressed="true"]');
      const raw=active?.querySelector("span")?.textContent || section?.getAttribute("aria-label")?.replace(/\s+(cards|tickets|items)$/i,"") || "";
      const rarity=normalizePakraRarity(raw);
      const heading=section?.querySelector<HTMLElement>("h2");
      const target=heading?.parentElement;
      if(!target || !rarity){host?.remove();host=null;setPlacement(current=>current===null?current:null);return;}
      if(!host || host.parentElement!==target){
        host?.remove();host=document.createElement("div");host.className="cn-pakra-slot";host.dataset.cnPakraSlot="true";target.appendChild(host);
      }
      const currentHost=host;
      setPlacement(current=>current?.route===route && current.rarity===rarity && current.host===currentHost?current:{route,rarity,host:currentHost});
    };
    const observer=new MutationObserver(records=>{
      if(records.every(record=>host?.contains(record.target)))return;
      if(!frame)frame=requestAnimationFrame(locate);
    });
    observer.observe(document.querySelector('[data-kayou-page-content="true"]') ?? document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-label","aria-pressed"]});
    locate();
    return ()=>{disposed=true;observer.disconnect();if(frame)cancelAnimationFrame(frame);host?.remove();};
  },[route]);
  if(!placement || placement.route!==route)return null;
  const link=getChinesePakraLink(route,placement.rarity,catalog?.collection===collection?catalog.products:undefined);
  if(!link)return null;
  return createPortal(<><style>{`.cn-pakra-slot{min-width:0;margin-top:3px}.cn-pakra-shop{display:inline-flex;align-items:center;min-height:32px;max-width:100%;padding:3px 0;color:hsl(var(--primary));font:inherit;font-size:12px;line-height:1.4;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}.cn-pakra-shop:hover{color:hsl(var(--foreground))}.cn-pakra-shop:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:3px;border-radius:3px}`}</style><a className="cn-pakra-shop" href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Shop ${link.name} ${link.rarity} cards on Pakra`} title={link.exact ? undefined : "Search Pakra for this set and rarity"}>Shop these cards on Pakra</a></>,placement.host);
}