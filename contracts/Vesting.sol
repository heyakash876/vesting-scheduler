// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

import "./Token.sol";

contract Vesting {
    
    constructor(){
        owner = msg.sender;
    }
    
    address public owner;
    struct Organization{
        address organizationAddress;
        string name;
        string tokenName;
        string tokenSymbol;
        uint256 releaseTime;
        mapping(address => bool) whitelistedAddresses;
        address[] shareholderAddresses;
        mapping(address => uint8) stakeholdersCategories;//0 = founders, 1 = community, 2 = investors, 3 = pre-sale buyers
        mapping(address => uint256) stakeholdersVestedAmounts;
        uint256 totalVestedAmount;
        Token token;
    }
    mapping (address => Organization) internal organizationMapping;
    mapping (string => address) internal orgNameAddrMapping;
    address[] public organizationAddresses;


    function createOrganization(address _organizationAddress, string memory _name, string memory _tokenName,uint256 _vestingPeriod, string memory _tokenSymbol,bool[] memory _whitelistedAddresses,address[] memory _shareholderAddresses,uint8[] memory _stakeholdersCategories,uint256[] memory _stakeholdersVestedAmounts) public{
        Organization storage organization = organizationMapping[_organizationAddress];
        organization.organizationAddress = _organizationAddress;
        organization.name = _name;
        organization.tokenName = _tokenName;
        organization.tokenSymbol = _tokenSymbol;
        organization.releaseTime = block.timestamp+_vestingPeriod;
        organization.shareholderAddresses = _shareholderAddresses;
        organization.totalVestedAmount = 0;
        for(uint i=0;i<_shareholderAddresses.length;i++){
            organization.whitelistedAddresses[_shareholderAddresses[i]] = _whitelistedAddresses[i];
            organization.stakeholdersCategories[_shareholderAddresses[i]] = _stakeholdersCategories[i];
            organization.stakeholdersVestedAmounts[_shareholderAddresses[i]] = _stakeholdersVestedAmounts[i];
            organization.totalVestedAmount += _stakeholdersVestedAmounts[i];
        }
        //Mint Tokens to Organization Owner. Will transfer once the vesting period is over.
        organization.token = new Token(_tokenName,_tokenSymbol,_organizationAddress,organization.totalVestedAmount);

        organizationAddresses.push(_organizationAddress);
        orgNameAddrMapping[_name] = _organizationAddress;
    }

    function getOrgNames() public view returns (string[] memory){
        string[] memory orgNames = new string[](organizationAddresses.length);
        for(uint i=0;i<organizationAddresses.length;i++){
            orgNames[i] = organizationMapping[organizationAddresses[i]].name;
        }
        return orgNames;
    }

    function getOrganizationByAddress(address _organizationAddress) public view returns (address, string memory, string memory, string memory, uint256, bool[] memory,address[] memory,uint8[] memory,uint256[] memory,uint256){
        Organization storage organization = organizationMapping[_organizationAddress];
        bool[] memory whitelistedAddresses = new bool[](organization.shareholderAddresses.length);
        uint8[] memory stakeholdersCategories = new uint8[](organization.shareholderAddresses.length);
        uint256[] memory stakeholdersVestedAmounts = new uint256[](organization.shareholderAddresses.length);
        for(uint i=0;i<organization.shareholderAddresses.length;i++){
            whitelistedAddresses[i]=organization.whitelistedAddresses[organization.shareholderAddresses[i]];
            stakeholdersCategories[i]=organization.stakeholdersCategories[organization.shareholderAddresses[i]];
            stakeholdersVestedAmounts[i]=organization.stakeholdersVestedAmounts[organization.shareholderAddresses[i]];
        }
        return (organization.organizationAddress, organization.name, organization.tokenName, organization.tokenSymbol, organization.releaseTime, whitelistedAddresses,organization.shareholderAddresses,stakeholdersCategories,stakeholdersVestedAmounts,organization.token.balanceOf(_organizationAddress));
    }

    function getOrganizationAddresses() public view returns (address[] memory){
        return organizationAddresses;
    }

    function getOrganizationByOrgName(string memory _orgName) public view returns (address, string memory, string memory, string memory, uint256, bool[] memory,address[] memory,uint8[] memory,uint256[] memory){
        address _organizationAddress = orgNameAddrMapping[_orgName];
        (address organizationAddress, string memory name, string memory tokenName, string memory tokenSymbol, uint256 releaseTime, bool[] memory whitelistedAddresses, address[] memory shareholderAddresses,uint8[] memory stakeholdersCategories, uint256[] memory stakeholdersVestedAmounts,) = getOrganizationByAddress(_organizationAddress);
        return (organizationAddress, name, tokenName, tokenSymbol, releaseTime, whitelistedAddresses,shareholderAddresses,stakeholdersCategories,stakeholdersVestedAmounts);
    }

    function getShareholderBalance(address _shareholderAddress,address _organizationAddress) public view returns (uint256){
        Organization storage organization = organizationMapping[_organizationAddress];
        return organization.token.balanceOf(_shareholderAddress);
    }

    function withdrawTokens(address _shareholderAddress,address _organizationAddress) public{
        Organization storage organization = organizationMapping[_organizationAddress];
        require(organization.whitelistedAddresses[_shareholderAddress] == true, "Shareholder is not whitelisted");
        require(block.timestamp >= organization.releaseTime, "Tokens are still locked");
        organization.token.transferFrom(_organizationAddress,_shareholderAddress,organization.stakeholdersVestedAmounts[_shareholderAddress]);
    }
}