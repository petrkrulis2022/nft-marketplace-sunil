const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT MArket Place Test Cases", function () {

        const PRICE = ethers.utils.parseEther("0.1")
        const TOKEN_ID = 0
        let deployer, nftMarketPlaceContract, player, basicNft

        beforeEach(async function () {
            deployer = (await getNamedAccounts()).deployer
            const accounts = await ethers.getSigners()
            player = accounts[1]
            await deployments.fixture(["all"])
            nftMarketPlaceContract = await ethers.getContract("NftMarketplace")
            basicNft = await ethers.getContract("BasicNft")
            await basicNft.mintNft()
            await basicNft.approve(nftMarketPlaceContract.address, TOKEN_ID)

        })

        it("lists and can be bought", async function () {
            nftMarketPlaceContract.listItem(basicNft.address, TOKEN_ID, PRICE)
            const playerConnectedtoMarketPlace = nftMarketPlaceContract.connect(player)
            await playerConnectedtoMarketPlace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE }
            )
            const newOwner = await basicNft.ownerOf(TOKEN_ID)
            const deployerProceeds = await nftMarketPlaceContract.getProceeds(deployer)
            assert(newOwner.toString() == player.address)
            assert(deployerProceeds.toString() == PRICE.toString())
        })

        it("can update a latest Price", async function () {
            await nftMarketPlaceContract.listItem(basicNft.address, TOKEN_ID, PRICE)
            const NEW_PRICE = ethers.utils.parseEther("0.2")
            await nftMarketPlaceContract.updateListing(basicNft.address, TOKEN_ID, NEW_PRICE)
            const listing = await nftMarketPlaceContract.getListing(basicNft.address, TOKEN_ID)
            assert(listing.price.toString() == NEW_PRICE.toString())
        })

        it("Cancel the listedItem", async function () {
            await nftMarketPlaceContract.listItem(basicNft.address, TOKEN_ID, PRICE)
            const listing = await nftMarketPlaceContract.getListing(basicNft.address, TOKEN_ID)
            console.log(`Item is Listed with a price ${listing.price.toString()}`)
            await nftMarketPlaceContract.cancelListing(basicNft.address, TOKEN_ID)
            const playerConnectedtoMarketPlace = nftMarketPlaceContract.connect(player)
            await expect(playerConnectedtoMarketPlace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })).to.be.revertedWith("NotListed")
        })

    })

