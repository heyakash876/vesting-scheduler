# Vesting Scheduler

This is a simple vesting scheduler app for organizations to create ERC20 tokens and for shareholders to withdraw their vested tokens

## Companion Video

[Loom Companion Video](https://www.loom.com/share/5c53b77c4af740c192868c7c6a9eebab?sid=1d09010b-2ae3-42dc-87d1-97ff080b8579)

## Problem Statement

Using Solidity and ether.js we built a simple DApp that will allow a particular organization to create a vesting schedule for their tokens. Depending on the tokenomics model of a web3 organization, they will have various vesting schedules for different stakeholders like community, investors, pre-sale buyers, founders etc.

 A simple DApp which will have a front end and Solidity Smart contracts with the following functionality:

1. An organization should be able to register themselves and their token (basically spinning off a contract for one ERC20 token).
2. Organisation should be able to mention the type of stakeholder and their vesting period (timelock).
3. Org should be able to whitelist addresses for certain stakeholders (founders, investors etc.).
4. Whitelisted addresses should be able to claim their tokens after the vesting period.

In our project we performed the following tasks:

1. Created Solidity contracts for registering orgs and adding stakeholders for each.
2. Created a front end page for users to connect their wallet.
3. Created a front end page for admins to register their org and add stakeholders + vesting details.
4. Created a page for users to be able to withdraw if they are whitelisted otherwise only org admin should be able to withdraw.
   For testing purposes, we recommend to use Testnet .



## Getting Started

### Installation & Testing

- Clone the repository on your local machine

```
git clone https://github.com/Varun-Patkar/ETHPROOF-Advanced-Varun-Ass1.git
```

- Install all node dependencies

```
npm install
```

- Deploy the test blockchain using hardhat

```
npx hardhat node
```

- Deploy the contract on the blockchain using the deploy.js script

```
npx hardhat run scripts/deploy.js --network localhost
```

- Finally, Start the next.js development live server

```
npm run dev
```

## Help

- You may get the error 'Nonce too high'. This can be readily fixed by going to Metamask (or your other wallet) and clearing activity and nonce data.



## License

This project is licensed under the MIT License - see the LICENSE file for details
