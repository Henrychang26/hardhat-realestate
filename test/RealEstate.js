const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("RealEstate", () => {
    let realEstate, escrow
    let deployer, seller
    let nftID = 1

    beforeEach(async () => {
        //Setup accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        seller = deployer
        buyer = accounts[1]

        //Load contracts
        const RealEstate = await ethers.getContractFactory("RealEstate")
        const Escrow = await ethers.getContractFactory("Escrow")
        //Deploy contract
        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(realEstate.address, nftID, seller.address, buyer.address)

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
        it("executes a successful transaction", async () => {
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
            //finalize sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait(1)
            console.log("Buyer finalize sale")
            //expects buyer to be NFT owner after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)
        })
    })
})
