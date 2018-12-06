pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {
    struct Star {
        string name;
        string starNotary;
        string ra;
        string dec;
        string mag;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(bytes32 => address) public uniqnessInUse;
    mapping(bytes32 => bool) public uniqnessTo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, string _starStory, string _ra, string _dec, string _mag, uint256 _tokenId) public { 
        Star memory newStar = Star(_name, _starStory, _ra, _dec, _mag);
        
        bool isExist;
        bytes32 uniqness;
        (isExist, uniqness) = checkIfStarExist(_ra, _dec, _mag);
        require(isExist == false);

        tokenIdToStarInfo[_tokenId] = newStar;
        uniqnessInUse[uniqness] = msg.sender;

        _mint(msg.sender, _tokenId);
    }

    function checkIfStarExist(string _ra, string _dec, string _mag) public view returns (bool, bytes32) {

        bytes32 uniqness = keccak256(abi.encodePacked(_ra, _dec, _mag));
        
        bool isExist = uniqnessInUse[uniqness] != 0x0;
        return (isExist, uniqness);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }
}