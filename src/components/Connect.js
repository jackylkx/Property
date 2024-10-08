import Web3 from "web3";
import React, { useState, useEffect } from "react";
import propertyContractABI from "../contracts/property.json";
import escrowContractABI from "../contracts/escrow.json";
import { switchToNetwork } from './base';

/* const contractAddress = "0x99d33b32d22996a4123c6cbafacdf93b8d5b1782";
const profileContractAddress = "0x70fdd5844c2ce347833d9533f344ae68375c89b1"; */

const propertyContractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const escrowContractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

const Connect = ({
  web3,
  account,
  shortAddress,
  setContract,
  setAccount,
  setProfileContract,
  setWeb3,
  fnConnectWallet
}) => {
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileData, setProfileData] = useState(null);

  var propertyContractInstance;
  var escrowContractInstance;

  useEffect(() => {
        
    if (window.ethereum) {
    window.ethereum.on('accountsChanged', async () => {

      const tempWeb3 = new Web3(window.ethereum);
      var accounts = await tempWeb3.eth.getAccounts();          
       if (accounts.length > 0) {                
          setAccount(accounts[0]);   
          localStorage.setItem('account', accounts[0]);  
        } 
    })
  }

    if(account != null){
        console.log("account updated: ", account);
    }
    
}, [account]);

  async function fnConnectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const networkId = await window.ethereum.request({ method: 'net_version' });


        if (networkId !== process.env.REACT_APP_CHAIN_ID) {
          //Network ID for Sepolia
          await switchToNetwork();
        }

        // user enables the app to connect to MetaMask

        const tempWeb3 = new Web3(window.ethereum);
       
        var accounts = await tempWeb3.eth.getAccounts();          
        setAccount(accounts[0]); 
        localStorage.setItem('account', accounts[0]);

        
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("No web3 provider detected");
      alert("Please install wallet");
    }
  }

  const handleClick = () => {
    // Call the function received from the parent component
    fnConnectWallet();
};

  return (
    <>
      <div className="connect">
        {account == null ? (
          <button  className="btn btn-connect" id="connectWalletBtn" onClick={handleClick}>
            Connect Wallet
          </button>
        ) : (
            <div>
              <div>
                 {/*  <div id="userName">ProfileName: {profileData.displayName}</div> */}
                  <div id="userAddress" style={{fontSize: "14px", padding: "8px"}}>Connected: {shortAddress(account)}</div>
                </div>
            </div>
          )}
      </div>
      {/* <div id="connectMessage">
        {!account ? "Please connect your wallet to tweet." : ""}
      </div>*/}
    </>
  );
};

export default Connect;
