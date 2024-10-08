import React from 'react';
import { Link } from "react-router-dom";

const FlatItem = ({slug, properties, account}) => {
    const PRECISION = 1000000000000000000;
    return (
        <div className="text-center col-lg-4 col-12 col-md-6 ">
            { properties !== undefined && properties != null?  (
            <div className="item">
                <div className="item-image">
                    <img className="img-fluid" src={"https://gateway.pinata.cloud/ipfs/"+ properties.imageUrls[0]} alt="flat" />
                </div>
                <div className="item-description">
                    <div className="d-flex justify-content-between mb-3">
                        <span className="item-title">{properties.propertyName}</span>
                        <span className="item-price"><i className='fab fa-ethereum' style={{ fontSize: '24px', marginRight: '10px'}}></i>{Number(properties.purchasePrice / PRECISION)}</span>
                    </div>
                    <div style={{ minHeight: '60px', textAlign: 'left' }}>
                        <span >{properties.propertyDesc}</span>
                    </div>
                    <div className="item-icon d-flex alig-items-center justify-content-between">
                        <div>
                            <i className="fas fa-bed"></i> <span style={{ marginLeft: '10px' }}>{Number(properties.bedroom)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-bath"></i> <span style={{ marginLeft: '10px' }}>{Number(properties.bathroom)}</span>
                        </div>
                        <Link to={{
                                pathname: `/flat/${slug}`,
                                state: { propertyId: properties.propertyid, account: account}
                            }} 
                            className="item-title" >
                            <button className="btn btn-detail">View</button>
                        </Link>
                    </div>
                </div>
            </div>):(<div></div>)}
        </div>
    )
}

export default FlatItem