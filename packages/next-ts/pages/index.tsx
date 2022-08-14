import { BigNumber, BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useAccount, useBalance, useContractWrite, useNetwork, usePrepareContractWrite, useSigner } from "wagmi";
import { ContractsConfig, TARGATED_CHAINS } from "../components/configs/appContract.config";

import useAppLoadContract from "../hooks/useAppLoadContract";

const Home: NextPage = () => {
  const [cost, setCost] = useState<BigNumber>(BigNumber.from(0));
  const [maxSupply, setMaxSupply] = useState<BigNumber>(BigNumber.from(0));
  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0));
  const [minting, setMinting] = useState<boolean>(false);
  const { address, status } = useAccount();

  const { data } = useBalance({ addressOrName: address });
  const { chain: currentChain } = useNetwork();

  const { data: signer } = useSigner();

  const BridgePassNFT = useAppLoadContract({
    contractName: "BridgePassNFT",
  });

  const { config, error, isError } = usePrepareContractWrite({
    addressOrName: ContractsConfig.BridgePassNFT.json[currentChain?.id ?? 0]?.contracts.BridgePassNFT.address,
    contractInterface: ["function mint() external payable"],
    functionName: "mint",
    // args: [1],
    overrides: {
      from: address,
      value: cost,
      gasLimit: 1000000,
    },
    signer,
  });

  const { data: ret, write } = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      setMinting(true);
      void toast.promise(tx.wait(), { loading: "Minting...", success: "Minted", error: "Minting failed" }).then(() => {
        setMinting(false);
      });
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
      setMinting(false);
    },
  });

  const getCost = useCallback(async (): Promise<BigNumberish> => {
    const cost = await BridgePassNFT?.cost();
    setCost(cost ?? BigNumber.from(0));
    return cost ?? 0;
  }, [BridgePassNFT]);

  const getMaxSupply = useCallback(async (): Promise<BigNumberish> => {
    const maxSupply = await BridgePassNFT?.maxSupply();
    setMaxSupply(maxSupply ?? BigNumber.from(0));
    return maxSupply ?? 0;
  }, [BridgePassNFT]);

  const getTotalSupply = useCallback(async (): Promise<BigNumberish> => {
    const totalSupply = await BridgePassNFT?.totalSupply();
    setTotalSupply(totalSupply ?? BigNumber.from(0));
    return totalSupply ?? 0;
  }, [BridgePassNFT]);

  useEffect(() => {
    void getCost();
    void getMaxSupply();
    void getTotalSupply();
  }, [BridgePassNFT]);

  if (!currentChain) {
    console.log("currentChain", currentChain);
    return (
      <main>
        <h2
          className="
              text-2xl
              font-semibold
              text-center
              mb-4
            ">
          Please connect your wallet
        </h2>
      </main>
    );
  }

  if (!TARGATED_CHAINS.includes(currentChain?.name ?? "")) {
    console.log("currentChain", currentChain);
    return (
      <main>
        <h2
          className="
              text-2xl
              font-semibold
              text-center
              mb-4
            ">
          This page is not available on this chain
        </h2>
        <div className="flex items-center justify-center flex--col">
          <div className="w-[50%] mb-4  text-center">
            <p>Please switch to one of the following:</p>
            <p>
              <ul
                className="
                  text-center
                  text-sm
                  mb-4
                  mt-4
                ">
                {TARGATED_CHAINS.map((chain) => (
                  <li key={chain}>{chain}</li>
                ))}
              </ul>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main>
        <Toaster />
        <div className="flex items-center justify-center flex--col">
          <div className="w-[70%] mt-8">
            <h2
              className="
              text-2xl
              font-semibold
              text-center
              mb-4
            ">
              Bridge Pass
            </h2>
            <div className="flex items-center justify-center flex--col">
              <div className="w-[50%]">
                <h3 className="text-xl font-semibold text-center">First Edition - Tree of Life</h3>
                <div className="flex items-center justify-center flex--col">
                  <div className="w-[50%] mb-4  text-center">
                    <p>Cost: {formatEther(cost ?? 0)} ETH</p>
                    <p>
                      Minted: {totalSupply.toString()} of {maxSupply.toString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center flex--col mb-4">
                  <img className="w-[75%]" src="/bg-small.gif" />
                </div>
                <div className="flex items-center justify-center flex--col mb-16">
                  <button
                    className={`w-[50%] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                      !address || (minting && "opacity-50 cursor-not-allowed disabled")
                    }`}
                    disabled={!address || minting}
                    onClick={(): void => {
                      if (address && write && maxSupply?.sub(totalSupply ?? 0).gt(0)) {
                        write();
                      }
                    }}>
                    Mint
                  </button>
                </div>
              </div>
            </div>

            <div className="items-center justify-center mb-4">
              <div className="w-[100%] text-center mb-4">
                <h4 className="text-xl font-semibold text-center">FAQ</h4>
              </div>
              <div className="items-center justify-center">
                <div className="w-[100%] mb-8 text-center">
                  <p>
                    <strong>What is a Bridge Pass?</strong>
                  </p>
                  <p>A Bridge Pass is a unique type of NFT that allows you to bridge your ETH to Optimism..</p>
                </div>
                <div className="w-[100%] mb-8 text-center">
                  <p>
                    <strong>What is the cost of a Bridge Pass?</strong>
                  </p>
                  <p>
                    The NFT itself is free. The current collection (Tree of Life) requires a payment of{" "}
                    {formatEther(cost)} ETH, but that entire amount will be bridged to the address buying the NFT on the
                    Optimism L2. Future collections might have a different cost.
                  </p>
                </div>
                <div className="w-[100%] mb-8 text-center">
                  <p>
                    <strong>What is the maximum supply of Bridge Passes?</strong>
                  </p>
                  <p>The current collection is made of a total of {maxSupply.toString()} NFTs.</p>
                </div>
                <div className="w-[100%] mb-8 text-center">
                  <p>
                    <strong>Can these NFT be traded?</strong>
                  </p>
                  <p>
                    This might change, but the current collection (Tree of Life) is not soulbound - so you can trade it{" "}
                    <a href="https://mintkit.io" target="_blank" rel="noreferrer">
                      on your favourite marketplace
                    </a>
                    .
                  </p>
                </div>
                <div className="w-[100%] mb-8 text-center">
                  <p>
                    <strong>I am an artist and I want to collab</strong>
                  </p>
                  <p>
                    Hit me up on Twitter{" "}
                    <a href="https://twitter.com/DanieleSalatti" target="_blank" rel="noreferrer">
                      @DanieleSalatti
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default Home;
