const { expect } = require("chai")
const { formatEther } = require("ethers/lib/utils")
const { ethers } = require("hardhat")

const tokens = (n) => {
    //to convert ethereum
    return ethers.utils.parseUnits(n.toString(), "ether")
}

const ether = tokens

describe("RealEstate", () => {
    let realEstate, escrow
    let deployer, seller
    let nftID = 1
    let purchasrPrice = ether(100)
    let escrowAmount = ether(20)

    beforeEach(async () => {
        //Setup accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        seller = deployer
        buyer = accounts[1]
        inspector = accounts[2]
        lender = accounts[3]

        //Load contracts
        const RealEstate = await ethers.getContractFactory("RealEstate")
        const Escrow = await ethers.getContractFactory("Escrow")
        //Deploy contract
        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(
            realEstate.address,
            nftID,
            purchasrPrice,
            escrowAmount,
            seller.address,
            buyer.address,
            inspector.address,
            lender.address
        )

        //Seller approves the transaction
        transaction = await realEstate.connect(seller).approve(escrow.address, nftID)
        await transaction.wait()
    })

    describe("Deployment", async () => {
        it("sends an NFT to the seller/deployer", async () => {
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
        })
    })

    describe("Selling real estate", async () => {
        let balance, transaction
        it("executes a successful transaction", async () => {
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)

            //Check escrow balance
            balance = await escrow.getBalance()
            console.log("escrow balance:", ethers.utils.formatEther(balance))

            //buyer deposits earnest
            transaction = await escrow.connect(buyer).depositEarnest({ value: escrowAmount })
            console.log("Buyer deposits earnest money")

            //Inspector updates status
            transaction = await escrow.connect(inspector).updateInspectionStatus(true)
            await transaction.wait()
            console.log("Inspector updates status")

            //Buyer approves sale
            transaction = await escrow.connect(buyer).approveSale()
            await transaction.wait()
            console.log("Buyer approves sale")

            //Seller approves sale
            transaction = await escrow.connect(seller).approveSale()
            await transaction.wait()
            console.log("Seller approves sale")

            //Lender funds the sale
            transaction = await lender.sendTransaction({ to: escrow.address, value: ether(80) })

            //Lender approves sale
            transaction = await escrow.connect(lender).approveSale()
            await transaction.wait()
            console.log("Lender approves sale")

            //finalize sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait(1)
            console.log("Buyer finalize sale")

            //expects buyer to be NFT owner after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)

            //Expect seller to receive funds
            balance = await ethers.provider.getBalance(seller.address)
            console.log("Seller balance:", ethers.utils.formatEther(balance))
            expect(balance).to.be.above(ether(10099))
        })
    })
})
