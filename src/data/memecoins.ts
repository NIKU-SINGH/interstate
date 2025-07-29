export type MemeCoin = {
  icon: string;
  name: string;
  label: string;
  age: string;
  marketCap: string;
  tokenAddress: string;
  marketCapChange: string;
  marketCapChangePos: boolean;
  liquidity: string;
  volume: string;
  txns: string;
  txnsPos: string;
  txnsNeg: string;
  audit: {
    percent: string;
    status: string;
    power: boolean;
  };
};

export const memecoins: MemeCoin[] = [
  {
    icon: "https://pump.mypinata.cloud/ipfs/QmW5LnbEEL3iCoCvg2hmqSt8QGqfN6sg27TVvDLrckjADs?img-width=256&img-dpr=2&img-onerror=redirect",
    name: "Extractor-91",
    label: "E91",
    tokenAddress: "GD8nFZrqEaXkNzPJAmA4ULjMmftoVfBfoGduWGEFpump",
    age: "4h",
    marketCap: "$68.1K",
    marketCapChange: "+0.5%",
    marketCapChangePos: true,
    liquidity: "$79.3K",
    volume: "$839K",
    txns: "24.9K",
    txnsPos: "12.6K",
    txnsNeg: "12.3K",
    audit: { percent: "+10.06%", status: "???", power: false },
  },
  {
    icon: "https://pump.mypinata.cloud/ipfs/QmTQrP6R7ieRSbKzwzLAy1i8c2U66b7LM6bSUmK1dfYc5b?img-width=256&img-dpr=2&img-onerror=redirect",
    name: "MICHI",
    label: "Michi",
    tokenAddress: "5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp",
    age: "55m",
    marketCap: "$1.6M",
    marketCapChange: "-32.3%",
    marketCapChangePos: false,
    liquidity: "$77.5K",
    volume: "$3.09M",
    txns: "22.6K",
    txnsPos: "11.3K",
    txnsNeg: "11.3K",
    audit: { percent: "+11.4%", status: "???", power: false },
  },
  {
    icon: "https://axiomtrading.sfo3.cdn.digitaloceanspaces.com/J5rwuQH37VYNC4QtGMQie5qPFjV5aTPNukbyxok8pump.webp",
    name: "CHILLGUY",
    label: "Just a chill guy",
    tokenAddress: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump",
    age: "1h",
    marketCap: "$212K",
    marketCapChange: "+217.5%",
    marketCapChangePos: true,
    liquidity: "$168K",
    volume: "$5.09M",
    txns: "22.1K",
    txnsPos: "11.1K",
    txnsNeg: "11K",
    audit: { percent: "+20.5%", status: "???", power: false },
  },
]; 