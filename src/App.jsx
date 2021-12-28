import React, { useEffect, useState, Component } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import MIDISounds from "midi-sounds-react";
import CryptoJS from "crypto-js";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [midi, setMidi] = useState("");
  const [msg, setMsg] = useState("");
  const [musicStr, setMusicStr] = useState("none");
  const [musicAddr, setMusicAddr] = useState("none");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0xAb40411f60DE710F19F287892Ddd6DAf10DcEDdf";
        const contractABI = abi.abi;
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await contract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await contract.wave(msg);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await contract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const notes = new Map([
    ["0", 65],
    ["1", 66],
    ["2", 67],
    ["3", 68],
    ["4", 69],
    ["5", 70],
    ["6", 71],
    ["7", 72],
    ["8", 73],
    ["9", 74],
    ["a", 75],
    ["b", 76],
    ["c", 77],
    ["d", 78],
    ["e", 79],
    ["f", 80]
  ]);

  const playMessage = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0xAb40411f60DE710F19F287892Ddd6DAf10DcEDdf";
        const contractABI = abi.abi;
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        let waves = await contract.getAllWaves();
        let randomIndex = Math.floor(Math.random() * waves.length);
        setMusicStr(waves[randomIndex].music);
        setMusicAddr(waves[randomIndex].waver);
        let musicCut = waves[randomIndex].music.substring(2);
        var when = midi.contextTime();
        var b = 0.5;
        var music = [];
        for (var i = 0; i < musicCut.length; i++) {
          music.push(notes.get(musicCut[i]));
        }
        for (var i = 0; i < music.length; i++) {
          midi.playChordAt(when + b * i, 0, [music[i]], b);
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const updateMsg = async (e) => {
    setMsg(e.target.value);
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Wave your secret as music! ♪
        </div>

        <div className="bio">
          Wanna share a secret? This site will hash your secret and turn it into piano notes! Connect your Ethereum wallet and wave it away!
        </div>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <input type="text" placeholder="Secret goes here <==" onInput={updateMsg} />

        <button className="waveButton" onClick={wave}>
          ♫ Wave it away ♫
        </button>

        <button className="waveButton" onClick={playMessage}>
          Play a random secret
        </button>

        <div className="bio">
          Playing music : {musicStr} by address {musicAddr}
        </div>

        <MIDISounds ref={(ref) => (setMidi(ref))} appElementName="root" instruments={[0]} />
      </div>
    </div>
  );
}

export default App