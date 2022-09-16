const { ethers } = require("hardhat")

async function mintAndList() {
    const PRICE = ethers.utils.parseEther("0.1")
    const nftMarketPlace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting..............")
    const mintTx = await basicNft.mintNft()
    const mintTxReciept = await mintTx.wait(1)
    const tokenId = mintTxReciept.events[0].args.tokenId
    console.log("Approving Nft...............")
    const approveTx = await basicNft.approve(nftMarketPlace.address, tokenId)
    await approveTx.wait(1)
    console.log("Listing the Nft.........")
    const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("Listed")
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })