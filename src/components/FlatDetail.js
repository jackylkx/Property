import React from "react";
import { ethers } from 'ethers';
import ImageGallery from 'react-image-gallery';
import ErrorDialog from './ErrorDialog';
import { useEffect, useState } from "react";
import Web3 from "web3";
import escrowContractABI from "../contracts/escrow.json";
import propertyContractABI from "../contracts/property.json";
import { Link, useLocation } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { getAllPropertyById, updateProperty } from '../api/property_api';
import { switchToNetwork } from './base';

const FlatDetail = (props) => {
    let stateData = props.location.state
    //var account = localStorage.getItem('account')
    var propertyId = stateData['propertyId'];
    var sellingPrice = 0;
    var PRECISION = 1000000000000000000;


    const escrowContractAddress = process.env.REACT_APP_ESCROW_CONTRACT_ADDRESS;
    const propertyContractAddress = process.env.REACT_APP_PROPERTY_CONTRACT_ADDRESS;

    const [images, setImages] = useState(null);
    const [escrowContractInstance, setEscrowContractInstance] = useState(null);
    const [propertyContractInstance, setPropertyContractInstance] = useState(null);

    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [escrow, setEscrow] = useState(null);
    const [properties, setProperties] = useState(null);
    const [accounts, setAccounts] = useState(null);
    const [escrowContractOwner, setEscrowContractOwner] = useState(null);

    const [visible, setVisible] = useState(null);
    const [buttonAction, setButtonAction] = useState(null);

    useEffect(() => {
        const fetchProperties = async (propertyId) => {
            try {
                console.log(propertyId); 
                const data = await getAllPropertyById(propertyId);
                if (data.length > 0) {
                    setProperties(data[0]);
                }
                setEscrow(data[0]);
            } catch (err) {
                console.error('Error:', err);
            }
        };

        console.log("propertyId: "+propertyId); 
        if (properties == null && escrow == null) {
            fetchProperties(propertyId);
        }
        const tempWeb3 = new Web3(window.ethereum);
        if (!escrowContractInstance ) {           

            setEscrowContractInstance(new tempWeb3.eth.Contract(
                escrowContractABI,
                escrowContractAddress,
            ));
        }
        else if(!propertyContractInstance)
        {
            setPropertyContractInstance(new tempWeb3.eth.Contract(
                propertyContractABI,
                propertyContractAddress,
            ));
        }

        window.ethereum.on('accountsChanged', async () => {
      
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccounts(account[0]);
            console.log('Accounts:', account[0]);
        })
        
        setAccounts(localStorage.getItem('account'));
        
        return () => {
            setProperties({}); // This worked for me
          };

    }, []);

    useEffect(() => {
        
        if(properties != null){
            setImages([
                {
                    original: "https://gateway.pinata.cloud/ipfs/" + properties.imageUrls[0],
                    thumbnail: "https://gateway.pinata.cloud/ipfs/" + properties.imageUrls[0],
                },
                {
                    original: "https://gateway.pinata.cloud/ipfs/" + properties.imageUrls[1],
                    thumbnail: "https://gateway.pinata.cloud/ipfs/" + properties.imageUrls[1],
                },
                {
                    original: "https://gateway.pinata.cloud/ipfs/" + properties.imageUrls[2],
                    thumbnail: "https://gateway.pinata.cloud/ipfs/" + properties.imageUrls[2],
                },
            ]);
        }
        
    }, [properties]);

/*     useEffect(() => {
        async function getEscrowContractOwner() {
            
            const networkId = await window.ethereum.request({ method: 'net_version' });
      
              if (networkId !== "100") {
              //Network ID for Sepolia
              await switchToNetwork();
              }
            const escrowContractOwner = await escrowContractInstance.methods.contractOwner().call();
            
            setEscrowContractOwner(escrowContractOwner);
        }

        if(escrowContractInstance != null){
            getEscrowContractOwner();
        }

        return () => {
            setEscrowContractOwner({}); // This worked for me
          };
        
    }, [escrowContractInstance]); */



    const fnConnectWallet = async () => {
        if (window.ethereum) {
            try {
              await window.ethereum.request({ method: 'eth_requestAccounts' });
              const networkId = await window.ethereum.request({ method: 'net_version' });
      
              if (networkId !== "100") {
              //Network ID for Sepolia
              await switchToNetwork();
              }

            } catch (error) {
              console.error(error);
            }
          } else {
            console.error("No web3 provider detected");
          }

    }

    const renderDialogContent = () => {
        if (buttonAction === "initial Purchase") {
            return (
                <div>
                    <div className="row">
                        <div className="col-6">
                            <p className="mb-0"><b>Property Name</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{properties.propertyName}</p>
                        </div>
                    </div>                 
                    <div className="row">
                        <div className="col-6">
                            <p className="mb-0"><b>Property Price</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{Number(properties.purchasePrice) / PRECISION} ETH</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <p className="mb-0"><b>Deposit</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{Number(properties.deposit) / PRECISION} ETH</p>
                        </div>
                    </div>
                    <br></br>
                    <p className="m-0"><i className="fa fa-exclamation-triangle" style={{ color: 'red' }}></i> To reserve the property, contract will hold <b>{Number(properties.deposit) / PRECISION}</b> ETH from your wallet</p>
                    <p className="m-0">Once deposit paid, our agent will liaise with you on the follow-up legal procedure.</p>
                    <br></br>
                    <button className="btn btn-subscribe" onClick={() => initialPurchase(properties.propertyid)}>
                        <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Pay {Number(properties.deposit) / PRECISION} ETH
                    </button>
                </div>
            );
        } else if (buttonAction === "Success Initial Purchase") {
            return (<span>You have reserved the property successfully</span>);
        }
        else if (buttonAction === "approve Purchase") {
            return (
                <div>
                    <div className="row">
                        <div className="col-4">
                            <p className="mb-0"><b>Property Name</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{properties.propertyName}</p>
                        </div>
                    </div>                 
                    <div className="row">
                        <div className="col-4">
                            <p className="mb-0"><b>Property Price</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{Number(properties.purchasePrice) / PRECISION} ETH</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4   ">
                            <p className="mb-0"><b>Buyer</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{properties.buyer}</p>
                        </div>
                    </div>
                    <br></br>
                    <p className="m-0"><i className="fa fa-exclamation-triangle" style={{ color: 'red' }}></i> You agree property to be sold to <b>{properties.buyer}</b></p>
                    <p className="m-0">Once you approved, buyer will proceed to make remaining payment.</p>
                    <br></br>
                    <button className="btn btn-subscribe" onClick={() => approvePurchase(properties.propertyid)}>
                        <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Approve
                    </button>
                </div>
            );
        } else if (buttonAction === "Success Approve Purchase") {
            return (<span>You have approve the property successfully</span>);
        } else if (buttonAction === "complete Purchase") {
            return (
                <div>
                    <div className="row">
                        <div className="col-6">
                            <p className="mb-0"><b>Property Name</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{properties.propertyName}</p>
                        </div>
                    </div>                 
                    <div className="row">
                        <div className="col-6">
                            <p className="mb-0"><b>Property Price</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{Number(properties.purchasePrice) / PRECISION} ETH</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <p className="mb-0"><b>Outstanding Amount</b></p>
                        </div>
                        <div className="col-6">
                            <p className="mb-0">{(Number(properties.purchasePrice) - Number(properties.deposit)) / PRECISION} ETH</p>
                        </div>
                    </div>
                    <br></br>
                    <p className="m-0"><i className="fa fa-exclamation-triangle" style={{ color: 'red' }}></i> You are agree to pay outstanding amount ({(Number(properties.purchasePrice) - Number(properties.deposit)) / PRECISION} ETH) to <b>{properties.seller}</b></p>
                    <br></br>
                    <p className="m-0"><i className="fa fa-info" style={{ color: 'blue', marginRight: "5px" }}></i>Once you approved, government officer will consent and transfer the property ownership to you in 1 working days.</p>
                    <br></br>
                    <button className="btn btn-subscribe" onClick={() => completePurchase(properties.propertyid)}>
                        <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Payment {(Number(properties.purchasePrice) - Number(properties.deposit)) / PRECISION} ETH
                    </button>
                </div>
            );
        } else if (buttonAction === "Success Approve Purchase") {
            return (<span>You have approve the property successfully</span>);
        }else {
            return <span></span>;
        }
    };

    const initialPurchase = async (propertyId) => {
        await fnConnectWallet();
        propertyId = Number(propertyId);
        setVisible(false);
        // Call the function received from the parent component

        const amountInWei = Number(properties.purchasePrice) * 0.1; // For example, 0.1 ether

        try {
    
            const gasEstimate = await escrowContractInstance.methods.initiatePurchase(propertyId).estimateGas({
                from: accounts,
                value: amountInWei.toString()

            });

            const tx = await escrowContractInstance.methods.initiatePurchase(propertyId).send({
                from: accounts,
                value: amountInWei.toString(),
                gas: gasEstimate
            });

            if (tx != null) {
                const data = {
                    buyer: accounts,
                    fundStatus: 1,
                  };

                const returndata = await updateProperty(propertyId, data);
                if (returndata != null && returndata.propertyid == propertyId) {
                    setVisible(true);
                    setButtonAction("Success Initial Purchase");
                    renderDialogContent();
                    setProperties(returndata);
                }
            }

            console.log('Transaction sent:', tx);
        } catch (error) {
            console.error('Error initiating purchase:', error.data != undefined ? (error.data != undefined ? error.data.message : error.message) : error.message);
            if (error.message.includes('gas')) {
                alert('Failed to estimate gas. There might be an error in the contract, and this transaction may fail.');
            } else {
                alert('An error occurred: ' + (error.data != undefined ? (error.data != undefined ? error.data.message : error.message) : error.message));
            }
        }

    };

   

    const approvePurchase = async (propertyId) => {
        await fnConnectWallet();
        propertyId = Number(propertyId);
        setVisible(false);
        try {

            const gasEstimate = await escrowContractInstance.methods.approvePurchase(propertyId).estimateGas({
                from: accounts,
            });

            const tx = await escrowContractInstance.methods.approvePurchase(propertyId).send({
                from: accounts,
                gas: gasEstimate
            });

            if (tx != null) {
                const data = {
                    approval: true,
                    fundStatus:2
                  };

                const returndata = await updateProperty(propertyId, data);
                if (returndata != null && returndata.propertyid == propertyId) {
                    setVisible(true);
                    setButtonAction("Success Approve Purchase");
                    renderDialogContent();
                    setProperties(returndata);
                }
            }

/*             checkEscrow(propertyId);

            setVisible(true);
            setButtonAction("Success Approve Purchase");
            renderDialogContent(); */

            console.log('Transaction sent:', tx);
        } catch (error) {
            console.error('Error create Escrow', (error.data != undefined ? error.data.message : error.message));
            if (error.message.includes('gas')) {
                alert('Failed to estimate gas. There might be an error in the contract, and this transaction may fail.');
            } else {
                alert('An error occurred: ' + (error.data != undefined ? error.data.message : error.message));
            }
        }

    };

    const completePurchase = async (propertyId) => {
        await fnConnectWallet();
        propertyId = Number(propertyId);

        const amountInWei = Number(properties.purchasePrice) * 0.9; // For example, 0.1 ether
        //const amountInWei = ethers.parseEther(amountInEther);
        try {


            const gasEstimate = await escrowContractInstance.methods.completePurchase(propertyId).estimateGas({
                from: accounts,
                value: amountInWei.toString()

            });

            const tx = await escrowContractInstance.methods.completePurchase(propertyId).send({
                from: accounts,
                value: amountInWei.toString(),
                gas: gasEstimate
            });

            if (tx != null) {
                const data = {
                    fundStatus:3
                  };

                const returndata = await updateProperty(propertyId, data);
                if (returndata != null && returndata.propertyid == propertyId) {
                    setVisible(true);
                    setButtonAction("Success Approve Purchase");
                    renderDialogContent();
                    setProperties(returndata);
                }
            }

            console.log('Transaction sent:', tx);
        } catch (error) {
            console.error('Error create Escrow', (error.data != undefined ? error.data.message : error.message));
            if (error.message.includes('gas')) {
                alert('Failed to estimate gas. There might be an error in the contract, and this transaction may fail.');
            } else {
                alert('An error occurred: ' + (error.data != undefined ? error.data.message : error.message));
            }
        }

    };

    const releaseFunding = async (propertyId) => {
        propertyId = Number(propertyId);

        try {

            const gasEstimate = await escrowContractInstance.methods.releaseFunding(propertyId).estimateGas({
                from: accounts,
            });

            const tx = await escrowContractInstance.methods.releaseFunding(propertyId).send({
                from: accounts,
                gas: gasEstimate
            });
            console.log('Transaction sent:', tx);
        } catch (error) {
            console.error('Error create Escrow', (error.data != undefined ? error.data.message : error.message));
            if (error.message.includes('gas')) {
                alert('Failed to estimate gas. There might be an error in the contract, and this transaction may fail.');
            } else {
                alert('An error occurred: ' + (error.data != undefined ? error.data.message : error.message));
            }
        }

    };

    const buyerCancelPurchase = async (propertyId) => {
        propertyId = Number(propertyId);


        try {
            const gasEstimate = await escrowContractInstance.methods.buyerCancelPurchase(propertyId).estimateGas({
                from: accounts,
            });

            const tx = await escrowContractInstance.methods.buyerCancelPurchase(propertyId).send({
                from: accounts,
                gas: gasEstimate
            });
            checkEscrow(propertyId);
            console.log('Transaction sent:', tx);
        } catch (error) {
            console.error('Error create Escrow', (error.data != undefined ? error.data.message : error.message));
            if (error.message.includes('gas')) {
                alert('Failed to estimate gas. There might be an error in the contract, and this transaction may fail.');
            } else {
                alert('An error occurred: ' + (error.data != undefined ? error.data.message : error.message));
            }
        }

    };

    const sellerCancelListing = async (propertyId) => {
        propertyId = Number(propertyId);


        try {

            const gasEstimate = await escrowContractInstance.methods.sellerCancelListing(propertyId).estimateGas({
                from: accounts,
            });

            const tx = await escrowContractInstance.methods.sellerCancelListing(propertyId).send({
                from: accounts,
                gas: gasEstimate
            });
            checkEscrow(propertyId);
            console.log('Transaction sent:', tx);
        } catch (error) {
            console.error('Error create Escrow', (error.data != undefined ? error.data.message : error.message));
            if (error.message.includes('gas')) {
                alert('Failed to estimate gas. There might be an error in the contract, and this transaction may fail.');
            } else {
                alert('An error occurred: ' + (error.data != undefined ? error.data.message : error.message));
            }
        }

    };

    const checkEscrow = async (propertyId) => {

        try {

            const propertyOwner = await propertyContractInstance.methods.ownerOf(propertyId).call();
            console.log('propertyOwner:', propertyOwner);

            const escrowreturn = await escrowContractInstance.methods.checkEscrow(propertyId).call();
            console.log('escrow:', escrow);

            setEscrow(escrowreturn);


        } catch (error) {
            console.error('Error create Escrow', (error.data != undefined ? error.data.message : error.message));
            if (error.message.includes('gas')) {
                alert('Failed to estimate gas. There might be an error in the contract, and this transaction may fail.');
            } else {
                alert('An error occurred: ' + (error.data != undefined ? error.data.message : error.message));
            }
        }

    };


    return (
        <div>
            {
            
            (properties != null) && (escrowContractInstance != null)// && (escrowContractOwner != null) 
            && (images != null)  ? (
                <div className="flat-detail">
                    <ErrorDialog
                        show={showErrorDialog}
                        errorMessage={errorMessage}
                    />

                    <Dialog header={buttonAction ? buttonAction.toUpperCase() : ''} visible={visible} style={{ width: '50vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
                        {renderDialogContent()}                       
                        
                    </Dialog>

                    <div className="page-top">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <h1 className="page-title">DETAIL</h1>
                                    <h2 className="page-description">{properties.propertyName}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container mt-5 mb-5">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="fd-top flat-detail-content">
                                    <div>
                                        <h3 className="flat-detail-title">{properties.propertyName}</h3>
                                        <p className="fd-address"> <i className="fas fa-map-marker-alt"></i>
                                            {properties.propertyDesc}</p>
                                    </div>
                                    <div>
                                        <span className="fd-price"><i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> {Number(properties.purchasePrice) / PRECISION}</span>
                                    </div>
                                </div>
                                <ImageGallery flickThreshold={0.50} slideDuration={0} items={images} showNav={false} showFullscreenButton={false} showPlayButton={false} />
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="fd-item">
                                            <h4>Description</h4>
                                            <p>Discover the grandeur of a luxurious mansion nestled in the heart of {properties.propertyName}, where sophistication meets tranquility. This sprawling estate boasts exquisite architectural design, lavish interiors, and lush landscaped gardens, creating an idyllic retreat amidst the vibrant cityscape. With spacious living areas, opulent amenities, and panoramic views, this mansion offers the epitome of upscale living in {properties.propertyName}.</p>
                                            {
                                                (() => {
                                                    const seller = properties.seller.toLowerCase();
                                                    const buyer = properties.buyer.toLowerCase();
                                                    const account = accounts != null ? accounts.toLowerCase() : "";
                                                    //const _escrowContractOwner = escrowContractOwner != null ? escrowContractOwner.toLowerCase() : "";
                                                    const fundStatus = Number(properties.fundStatus);

                                                    
                                                    //0 = initial, 1 = deposit paid, 2 = sellerApproved, 3= full payment, 4 = fund release, 5 = listing cancelled
                                                    if (fundStatus === 0) {
                                                        if (seller.toLowerCase() == account.toLowerCase()) {
                                                            return (
                                                                <span>You have listed your property</span>
                                                            );
                                                        } else if (buyer == "0x0000000000000000000000000000000000000000" || buyer == "") {
                                                            return (
                                                                <button className="btn btn-subscribe" onClick={() => {setVisible(true); setButtonAction("initial Purchase")}}>
                                                                    <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Purchase Property
                                                                </button>
                                                            );
                                                        }
                                                    } else if (fundStatus === 1) { //pending approval

                                                        if (buyer.toLowerCase() == account.toLowerCase()) {
                                                            return (
                                                                <span>Pending Approval From Seller</span>
                                                            );
                                                        } else if (seller.toLowerCase() == account.toLowerCase()) {
                                                            return (
                                                                <button className="btn btn-subscribe" onClick={() => {setVisible(true); setButtonAction("approve Purchase")}}>
                                                                    <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Approve Purchase
                                                                </button>
                                                            );
                                                        } else {
                                                            return (
                                                                <span>The Property is reserved by other buyer</span>
                                                            );
                                                        }
                                                    } else if (fundStatus === 2) { //2 = sellerApproved
                                                        if (buyer.toLowerCase() == account.toLowerCase()) {
                                                            return (
                                                                <button className="btn btn-subscribe" onClick={() => {setVisible(true); setButtonAction("complete Purchase")}}>
                                                                    <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Complete Purchase
                                                                </button>
                                                            );

                                                        } else if (seller.toLowerCase() == account.toLowerCase()) {
                                                            return (
                                                                <span>Pending full deposit from buyer</span>
                                                            );
                                                        } else {
                                                            return (
                                                                <span>The Property is reserved by other buyer</span>
                                                            );
                                                        }

                                                    } else if (fundStatus === 3) { //3= full payment


                                                        if (buyer.toLowerCase() == account.toLowerCase() ){
                                                            return (
                                                                <button className="btn btn-subscribe" disabled={true}>
                                                                    <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Pending Release Fund by Contract Owner
                                                                </button>
                                                            );

                                                        } else if (seller.toLowerCase() == account.toLowerCase()) {
                                                            return (
                                                                <button className="btn btn-subscribe" disabled={true}>
                                                                    <i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> Pending Release Fund by Contract Owner
                                                                </button>
                                                            );
                                                        } else {
                                                            return (
                                                                <span>The Property is reserved by other buyer</span>
                                                            );
                                                        }
                                                    } else {
                                                        return <span></span>;
                                                    }
                                                })()
                                            }

                                            {/*                                     <button className="btn btn-subscribe" onClick={() => createEscrow(escrow.propertyId,2.0)}><i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> List Property</button>
                                    
                                    <button className="btn btn-subscribe" onClick={() => approvePurchase(escrow.propertyId)}><i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> approvePurchase</button>
                                    
                                    <button className="btn btn-subscribe" onClick={() => releaseFunding(escrow.propertyId)}><i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> releaseFunding</button>
                                    <button className="btn btn-subscribe" onClick={() => buyerCancelPurchase(escrow.propertyId)}><i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> buyerCancelPurchase</button>
                                    <button className="btn btn-subscribe" onClick={() => sellerCancelListing(escrow.propertyId)}><i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> sellerCancelListing</button>
                                    <button className="btn btn-subscribe" onClick={() => checkEscrow(escrow.propertyId)}><i className='fab fa-ethereum' style={{ fontSize: '24px' }}></i> checkEscrow</button>

 */}
                                        </div>
                                        <div className="fd-item fd-property-detail">
                                            <h4>Property Details</h4>
                                            <div className="row">
                                                <div className="col-lg-4">
                                                    <i className="fas fa-bed"></i> <span> Bedroom: </span>
                                                    <span>{Number(properties.bedroom)}</span>
                                                </div>
                                                <div className="col-lg-4">
                                                    <i className="fas fa-bath"></i><span> Bathroom: </span>
                                                    <span>{Number(properties.bathroom)}</span>
                                                </div>
                                                <div className="col-lg-4">
                                                    <i className="fas fa-utensils"></i><span> Kitchen:  </span>
                                                    <span>2</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="fd-item">
                                            <h4>Maps</h4>

                                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4737.390425889979!2d101.63067475421606!3d3.1852059285918206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc48a5d32f5fb7%3A0x1fbfb9bf04283220!2sDesa%20Parkcity%2C%2052200%20Kuala%20Lumpur%2C%20Federal%20Territory%20of%20Kuala%20Lumpur!5e0!3m2!1sen!2smy!4v1717857304167!5m2!1sen!2smy" width="100%" height="450" loading="lazy"></iframe>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (<div>Loading escrow...</div>)
            }

        </div>
    )
}

export default FlatDetail