const { ethers, network } = require("hardhat")
const fs = require("fs")
const FRONT_END_CONTRACTS_FILE = "check.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating the Front End ........")
        await updateContractAddress()

    }
}

async function updateContractAddress() {
    const nftMarketPlace = await ethers.getContract("NftMarketplace")
    const chainId = network.config.chainId.toString()
    console.log(chainId)
    const contactAddress = JSON.parse(fs.readFileSync(FRONT_END_CONTRACTS_FILE, "utf8"))
    console.log(contactAddress)
    if (chainId in contactAddress) {
        if (!contactAddress[chainId]["NftMarketplace"].includes(nftMarketPlace.address)) {
            contactAddress[chainId]["NftMarketplace"].push(nftMarketPlace.address)
        } else {
            contactAddress[chainId] = { NftMarketplace: [nftMarketPlace.address] }
        }
    }
    fs.writeFileSync(FRONT_END_CONTRACTS_FILE, JSON.stringify(contactAddress))
    console.log(contactAddress)
    console.log("Update Completed")
}

module.exports.tags = ["all", "frontend"]