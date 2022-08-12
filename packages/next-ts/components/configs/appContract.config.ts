import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { Chain, chain, configureChains, createClient } from "wagmi";
import { BridgePassNFT__factory } from "../../contracts/contract-types";
import foundryContracts from "../../contracts/foundry_contracts.json";

import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

export type contractNameType = keyof typeof ContractsConfig;

/** ----------------------
 * define your contracts like   YourContract: { factory: YourContract__factory, json: foundryContracts }
 * inside ContractsConfig
 * ---------------------*/
export const ContractsConfig = {
  BridgePassNFT: { factory: BridgePassNFT__factory, json: foundryContracts },
} as const;

export const TARGATED_CHAINS = [chain.goerli.name, chain.mainnet.name]; // <---- define your target network

// disabled: define your target names in root .env file inside NEXT_PUBLIC_TARGET_NETWORKS variable
// const TARGATED_CHAINS = [...(process.env.NEXT_PUBLIC_TARGET_NETWORKS as string).split(",")];

export const targetNetowrks = (requiredChains: string[]): Chain[] => {
  console.log("requiredChains", requiredChains);
  const targetedChains: Chain[] = [];
  //   type chainNameType = keyof typeof chain;

  Object.keys(chain).forEach((chainName: string) => {
    if (requiredChains.includes(chain[chainName].name)) {
      targetedChains.push(chain[chainName] as Chain);
    }
  });
  return targetedChains;
};

/** ----------------------
 * RAINBOW KIT COFIGS
 * ---------------------*/
export const targedChains = targetNetowrks([...TARGATED_CHAINS]);

export const { chains, provider } = configureChains(
  [...targedChains],
  [
    // alchemyProvider({ alchemyId: process.env.ALCHEMY_ID })
    // TODO: inifura id from env
    jsonRpcProvider({
      rpc: (chain: Chain) => {
        if (chain.id === 5) {
          // Goerli
          return {
            http: "https://goerli.infura.io/v3/e23ef6f1da494103bf900b3734e228f7",
            webSocket: "wss://goerli.infura.io/ws/v3/e23ef6f1da494103bf900b3734e228f7",
          };
        }
        return {
          http: "https://mainnet.infura.io/v3/e23ef6f1da494103bf900b3734e228f7",
          webSocket: "wss://mainnet.infura.io/ws/v3/e23ef6f1da494103bf900b3734e228f7",
        };
      },
    }),
    /*publicProvider(),*/
  ]
); // <---- configure your custom chain

const { connectors } = getDefaultWallets({
  appName: "Optimistic Art",
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
