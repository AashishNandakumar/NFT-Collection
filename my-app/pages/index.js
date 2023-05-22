"use client";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { Contract, ethers, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";

export default function main() {
  // To check if the users wallet is connected or not:
  const [walletConnected, setWalletConnected] = useState(false);
  // To check if the presale started:
  const [presaleStarted, setPresaleStarted] = useState(false);
  // To check if the presale has ended:
  const [presaleEnded, setPresaleEnded] = useState(false);
  // Set the loading when transasaction occurs:
  const [loading, setLoading] = useState(false);
  // Check if the current address connected is the owner or not:
  const [isOwner, setIsOwner] = useState(false);
  // Kepp track of the token Ids minted:
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a ref to web3modal:
  const web3ModalRef = useRef(null);

  // Minting an neft during presale:
  const presaleMint = async () => {
    try {
      // fetching the signer:
      const signer = await getProviderOrSigner(true);
      // creating an instance of the nft contract:
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      //! call the required (payable)fxn from ur contract:
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.00001"),
      });
      // Set the loading to true:
      setLoading(true);
      // wait for the transaction to be complete:
      await tx.wait();
      // Set the loading to false:
      setLoading(false);
      //  alert the user that a nft is minted:
      window.alert("You have successfully minted a Crypto Dev!!");
    } catch (err) {
      console.error(err);
    }
  };

  // mint an nft after presale:
  const publicMint = async () => {
    try {
      // fetching the signer:
      const signer = await getProviderOrSigner(true);
      // creating an instance of the nft contract:
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // Call the mint fxn from the nft contract:
      const tx = await nftContract.mint({
        value: ethers.utils.parseEther("0.00001"),
      });
      // Set the loading to true:
      setLoading(true);
      // wait for the transaction to be complete:
      await tx.wait();
      // Set the loading to false:
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Connecting the metamask wallet:
  const connectWallet = async () => {
    try {
      // get the provider, when used for the first time it prompts the user to connec the wallet:
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Start the presale for ur NFT-Collection:
  const startPresale = async () => {
    try {
      // fetching the signer:
      const signer = await getProviderOrSigner(true);
      // creating an instance of the nft contract:
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // call the presale from the contract:
      const tx = await nftContract.startPresale();
      // Set the loading to true:
      setLoading(true);
      // wait for the transaction to be complete:
      await tx.wait();
      // Set the loading to false:
      setLoading(false);
      // set the presale started to be true:
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

  // check if the presale started:
  const checkIfPresaleStarted = async () => {
    try {
      // getting the provider:
      const provider = await getProviderOrSigner();
      // creating an instance of our nft contract:
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // get the value of presaleStarted from the contract:
      const _presaleStarted = await nftContract.presaleStarted();

      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
    }
  };

  // check if presale ended:
  const checkIfPresaleEnded = async () => {
    try {
      // get the provider:
      const provider = await getProviderOrSigner();
      // create an instance of our nft-contract:
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // get the value of presaleEnded from the contract:
      const _presaleEnded = await nftContract.presaleEnded();
      // we have to check if the presale has actually ended:
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      // set presale ended if it has indeed ended:
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // calling the contract to retrieve the owner :
  const getOwner = async () => {
    try {
      // get the provider:
      const provider = await getProviderOrSigner();
      // create an instance of our nft-contract:
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      //* get the value of owner(BUILT IN FXN) from the contract:
      const _owner = await nftContract.owner();
      // get the signer:
      const signer = await getProviderOrSigner(true);
      //* get the address(BUILT IN FXN) associated with the signer which is connected to metamask:
      const address = await signer.getAddress();
      // Check if it is really the owner:
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get the no of token ids minted:
  const getTokenIdsMinted = async () => {
    try {
      // get the provider:
      const provider = await getProviderOrSigner();
      // create an instance of our nft-contract:
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract:
      const _tokenIds = await nftContract.tokenIds();
      // set the token ids minted:
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  // function to generate a provider and a signer:
  const getProviderOrSigner = async (needSigner = false) => {
    // obtain the provider from the web3 modal:
    // prompting the metamask to connect who is a provider:
    const provider = await web3ModalRef.current.connect();
    //  metamask provides us web3 connection, hence it is a web3provider:
    const web3Provider = new providers.Web3Provider(provider);

    // making sure the user is connected to sepolia:
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 11155111) {
      window.alert("Please change the network to Sepolia!!!");
      throw new Error("Change the network to sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    //  if wallet is not connected create a new instance of web3modal and connect the wallet:
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "11155111",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // check if preasale has started or ended:
      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }

      getTokenIdsMinted();

      // create an interval which gets called every 5 sec to check if presale ended:
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            // come out of the interval fxn:
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval which checks for token ids minted every 5 secs:
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  // create a button which changes according to the changes in state of dApp:
  const renderButton = () => {
    // check for wallet connection, then print the necessary messages:
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // set the loading scene whenver necesaary:
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // check if the coonected user is owner and allow them to start the presale:
    if (isOwner && !presaleStarted) {
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale!
        </button>
      );
    }

    // if the user is not owner + if presale has not started yet, tell them:
    if (!presaleStarted) {
      return (
        <div className={styles.description}>Presale hasn&#39;t started!</div>
      );
    }

    // presale has started but not ended allow minting of nfts within this period:
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button onClick={presaleMint} className={styles.button}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // if the presale has ended it is time for public minting:
    if (presaleStarted && presaleEnded) {
      return (
        <button onClick={publicMint} className={styles.description}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs</h1>
          <div className={styles.description}>
            An Amazing NFT collection for developers in Crypto
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted!
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} c src="./cryptodevs/0.svg" />
        </div>
      </div>
      <footer className={styles.footer}>Made with &#10084; by Ash Devs</footer>
    </div>
  );
}
