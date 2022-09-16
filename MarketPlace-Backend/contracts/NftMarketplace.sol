//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error PriceMustBeAboveZero();
error NotApprovedForMarketPlace();
error AlreadyListed(address nftAddress, uint256 tokenId);
error NotOwner();
error NotListed(address nftAddress, uint256 tokenId);
error PriceDoNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NoProceeds();
error TransferFailed();

contract NftMarketplace is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }
    //Events
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );
    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    //NFT Contract Addresss --> NFT TokenID -->Listing
    mapping(address => mapping(uint256 => Listing)) private s_Listing;

    //Proceeds to tract Amount got by selling NFTs
    mapping(address => uint256) private s_proceeds;

    //Modifiers
    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_Listing[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NotOwner();
        }
        _;
    }
    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_Listing[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    //////////////////
    //Main Functions///
    /////////////////
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NotApprovedForMarketPlace();
        }
        s_Listing[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
        nonReentrant
    {
        Listing memory listing = s_Listing[nftAddress][tokenId];
        if (msg.value < listing.price) {
            revert PriceDoNotMet(nftAddress, tokenId, listing.price);
        }
        s_proceeds[listing.seller] = s_proceeds[listing.seller] + msg.value;
        //Delete that listing
        delete (s_Listing[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(listing.seller, msg.sender, tokenId);
        emit ItemBought(nftAddress, tokenId, msg.sender, listing.price);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
    {
        delete (s_Listing[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isOwner(nftAddress, tokenId, msg.sender) {
        s_Listing[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external payable {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    //////////////////
    //Getter Functions///
    /////////////////
    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_Listing[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}

// Creating a Decentralized NFT MArket Place

// Features:
// l `listItem`
// 2 `buyItem`
// 3 `updatePrice`
// 4 `delist the Item`
// 5 `Withdraw the Funds`
