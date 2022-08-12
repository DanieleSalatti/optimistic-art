import { BigNumber, BigNumberish } from "ethers";
import { formatEther } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { useAccount, useBalance, useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { ContractsConfig, TARGATED_CHAINS } from "../components/configs/appContract.config";

import useAppLoadContract from "../hooks/useAppLoadContract";

const Home: NextPage = () => {
  const [cost, setCost] = useState<BigNumber>(BigNumber.from(0));
  const [maxSupply, setMaxSupply] = useState<BigNumber>(BigNumber.from(0));
  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0));
  const { address, status } = useAccount();

  const { data } = useBalance({ addressOrName: address });
  const { chain: currentChain } = useNetwork();

  const BridgePassNFT = useAppLoadContract({
    contractName: "BridgePassNFT",
  });

  if (!TARGATED_CHAINS.includes(currentChain?.name ?? "")) {
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

  const { config, error, isError } = usePrepareContractWrite({
    addressOrName: ContractsConfig.BridgePassNFT.json[currentChain?.id ?? 0].contracts.BridgePassNFT.address,
    contractInterface: ["function mint(address) external payable"],
    functionName: "mint",
    args: [address],
    overrides: {
      from: address,
      value: cost,
      gasLimit: 1000000,
    },
  });

  const { data: ret, write } = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      toast.promise(tx.wait(), { loading: "Minting...", success: "Minted", error: "Minting failed" });
    },
    onError: (error) => {
      console.log("error", error);
      toast.error(error.message);
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
                <div className="flex items-center justify-center flex--col mb-4">
                  <button
                    className="w-[50%] bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={!address}
                    onClick={async () => {
                      if (address && write && maxSupply?.sub(totalSupply ?? 0).gt(0)) {
                        write();
                      }
                    }}>
                    Mint
                  </button>
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
