//SPDX-License-Identifier: MIT

interface IERC721{ //interface imports the function instead of entire contract
    function transferFrom(address _from, address _to, uint256 _id)external;
}

pragma solidity ^0.8.0;


contract Escrow {

    //State variables
    address public nftAddress;
    uint256 public nftID;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable seller;
    address payable buyer;
    address public inspector;
    address public lender;


    //Modifier
    modifier onlyBuyer(){
        require(msg.sender == buyer, "only buyer can call this function");
        _;
    }
    modifier onlyInspector(){
        require(msg.sender == inspector, "Only inspector can call this function");
        _;
    }

    bool public inspectionPassed = false;

    constructor(address _nftAddress,
        uint256 _nftID,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address _inspector,
        address _lender
    ){
        nftAddress = _nftAddress;
        nftID = _nftID;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        lender = _lender;
    }

    function depositEarnest() public payable onlyBuyer{
        require(msg.value >= escrowAmount);
    }

    function updateInspectionStatus(bool _passed) public onlyInspector {
        inspectionPassed = _passed;

    }

    function getBalance() public view returns(uint256){
        return address(this).balance;
    }

    function finalizeSale() public {
        require(inspectionPassed, "Must pass inspection");
    //Transfer ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }


}