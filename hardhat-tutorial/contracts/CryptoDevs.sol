// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    // For computing token urls = baseurl + tokenId:
    string _baseTokenURI;

    // price for a nft:
    uint256 public _price = 0.00001 ether;

    // in case of any mishaps pause the contract:
    bool public _paused;

    // setting the upperlimit for cryptodevs:
    uint256 public maxTokenIds = 20;

    // to count the total no of tokenIds minted:
    uint256 public tokenIds;

    // An empty instance of whitelist contract:
    IWhitelist whitelist;

    // to keep track whether pre-sale started:
    bool public presaleStarted;

    // timestamp for when the pre-sale ended:
    uint256 public presaleEnded;

    // creating custom modifer to check if it is not paused:
    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract under maintainance");
        _;
    }

    // calling contructor:
    constructor(
        string memory baseURI,
        address whitelistContract
    ) ERC721("Crypto Devs", "CD") {
        _baseTokenURI = baseURI;
        // creating an instance of our contract
        whitelist = IWhitelist(whitelistContract);
    }

    // start pre-sale for whitelisted addresses:
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // to togggle pre-sale off set time as current time + 5min:
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable onlyWhenNotPaused {
        // check if presale is on or presale ended:
        require(
            presaleStarted && block.timestamp < presaleEnded,
            "Presale is not running"
        );
        // only the whitelisted address can mint in this event:
        require(
            whitelist.whitelistedAddresses(msg.sender),
            "You are not Whitelisted"
        );
        // dont exceed max tokens:
        require(tokenIds < maxTokenIds, "Exceeded maximum Crypto Devs supply");
        // making sure the buyer has enough eth:
        require(msg.value >= _price, "Ether sent is not correct");
        // incrementing the tokenIds:
        tokenIds += 1;
        // minting the token(bulitin fxn):
        _safeMint(msg.sender, tokenIds);
    }

    // mint an nft after presale is over(For normal users):
    function mint() public payable onlyWhenNotPaused {
        require(
            presaleStarted && block.timestamp >= presaleEnded,
            "Presale has not ended yet!"
        );
        require(tokenIds < maxTokenIds, "Exceeded max crypto devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // overriding the fxn present in ERC721 which by default returns and emty string:
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // controling the pause effect of the contract:
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    // transfers all the ethers in the contract to the owner:
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    // ur contract should accept Ether:
    receive() external payable {}

    fallback() external payable {}
}
