//SPDX-License-Identifier: MIT

interface IERC721{ //interface imports the function instead of entire contract
    function transferFrom(address _from, address _to, uint256 _id)external;
}

pragma solidity ^0.8.0;


contract Escrow {

    //State variables
    address public nftAddress;
    uint256 public nftID;
    address payable seller;
    address payable buyer;


    constructor(address _nftAddress,
        uint256 _nftID,
        address payable _seller,
        address payable _buyer
    ){
        nftAddress = _nftAddress;
        nftID = _nftID;
        seller = _seller;
        buyer = _buyer;
    }

    function finalizeSale() public {
    //Transfer ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }
}