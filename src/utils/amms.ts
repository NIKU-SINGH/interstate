export interface Amm {
  id: string;
  name: string;
  displayName: string;
  image: string;
  borderColor: string;
  textColor: string;
}

export const AmmList: Amm[] = [
  {
    id: "cp_amm",
    name: "cp_amm",
    displayName: "METEORA AMM V2",
    image: "/meteora.svg",
    borderColor: "from-orange-500 to-orange-600",
    textColor: "text-orange-400"
  },
  {
    id: "raydium_amm",
    name: "raydium_amm",
    displayName: "Raydium",
    image: "/ray.svg",
    borderColor: "from-purple-500 to-violet-600",
    textColor: "text-purple-400"
  },
  {
    id: "pump",
    name: "pump",
    displayName: "Pump",
    image: "/pump.svg",
    borderColor: "from-green-500 to-emerald-600",
    textColor: "text-green-400"
  },
  {
    id: "pump_amm",
    name: "pump_amm",
    displayName: "Pump AMM",
    image: "/pump-amm-temp.svg",
    borderColor: "from-gray-500 to-gray-600",
    textColor: "text-gray-400"
  },
  {
    id: "amm_v3",
    name: "amm_v3",
    displayName: "Raydium CLMM",
    image: "/ray.svg",
    borderColor: "from-purple-500 to-violet-600",
    textColor: "text-purple-400"
  },
  {
    id: "lb_clmm",
    name: "lb_clmm",
    displayName: "Meteora AMM",
    image: "/meteora.svg",
    borderColor: "from-orange-500 to-orange-600",
    textColor: "text-orange-400"
  },
  {
    id: "token_launchpad",
    name: "token_launchpad",
    displayName: "Moonit",
    image: "/moonit.svg",
    borderColor: "from-yellow-400 to-yellow-500",
    textColor: "text-yellow-300"
  },
  {
    id: "raydium_launchpad",
    name: "raydium_launchpad",
    displayName: "Bonk",
    image: "/bonk.svg",
    borderColor: "from-yellow-700 to-yellow-800",
    textColor: "text-yellow-600"
  }
];

export const getAmm = (name: string): Amm | undefined => {
  return AmmList.find(amm => amm.name === name);
};