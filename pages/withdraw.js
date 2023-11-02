// import required modules
// the essential modules to interact with frontend are below imported.
// ethers is the core module that makes RPC calls using any wallet provider like Metamask which is esssential to interact with Smart Contract
import { ethers } from "ethers";
// A single Web3 / Ethereum provider solution for all Wallets
import Web3Modal from "web3modal";
// yet another module used to provide rpc details by default from the wallet connected
import WalletConnectProvider from "@walletconnect/web3-provider";
// react hooks for setting and changing states of variables
import { useEffect, useState } from "react";
import contractABI from "../artifacts/contracts/Vesting.sol/Vesting.json";
import { useRouter } from "next/router";
export default function Withdraw() {
	const router = useRouter();
	// env variables are initalised
	// contractAddress is deployed smart contract addressed
	const contractAddress = process.env.CONTRACT_ADDRESS;
	// application binary interface is something that defines structure of smart contract deployed.
	const abi = contractABI.abi;

	const [formData, setFormData] = useState({});

	// hooks for required variables
	const [provider, setProvider] = useState();
	const [organization, setOrganization] = useState();
	const [orgNames, setOrgNames] = useState();
	const [shareholderVested, setShareholderVested] = useState(0);
	const [shareholderBalance, setShareholderBalance] = useState(0);
	const [whitelisted, setWhitelisted] = useState(false);

	const [loader, setLoader] = useState(false);

	const handleInput = (e) => {
		const fieldName = e.target.id;
		const fieldValue = e.target.value;
		setFormData((prevState) => ({
			...prevState,
			[fieldName]: fieldValue,
		}));
	};

	const submitForm = async (e) => {
		setLoader(true);
		e.preventDefault();
		const orgName = formData.orgName;
		const web3ModalVar = new Web3Modal({
			cacheProvider: true,
			providerOptions: {
				walletconnect: {
					package: WalletConnectProvider,
				},
			},
		});
		const instanceVar = await web3ModalVar.connect();
		const providerVar = new ethers.providers.Web3Provider(instanceVar);
		const signer = providerVar.getSigner();
		const stakeholderAddress = await signer.getAddress();
		// initalize smartcontract with the essentials detials.
		const smartContract = new ethers.Contract(contractAddress, abi, provider);
		const contractWithSigner = smartContract.connect(signer);
		const response = await contractWithSigner.getOrganizationByOrgName(orgName);
		console.log(response);
		if (response[6].includes(stakeholderAddress)) {
			var organization1 = {};
			const [
				address,
				name,
				tokenName,
				tokenSymbol,
				releaseTime,
				whitelistedAddresses,
				shareholderAddresses,
				stakeholdersCategories,
				stakeholdersVestedAmounts,
			] = response;
			organization1.address = address;
			organization1.name = name;
			organization1.tokenName = tokenName;
			organization1.tokenSymbol = tokenSymbol;
			organization1.releaseTime = releaseTime;
			organization1.whitelistedAddresses = whitelistedAddresses;
			organization1.shareholderAddresses = shareholderAddresses;
			organization1.stakeholdersCategories = stakeholdersCategories;
			organization1.stakeholdersVestedAmounts = stakeholdersVestedAmounts;
			organization1.releaseTime = new Date(releaseTime.toNumber() * 1000);
			var tmp = [];
			for (let i = 0; i < organization1.stakeholdersVestedAmounts.length; i++) {
				tmp.push(organization1.stakeholdersVestedAmounts[i].toNumber());
			}
			organization1.stakeholdersVestedAmounts = tmp;
			setOrganization(organization1);
			const index =
				organization1.shareholderAddresses.indexOf(stakeholderAddress);
			setShareholderVested(organization1.stakeholdersVestedAmounts[index]);
			setWhitelisted(organization1.whitelistedAddresses[index]);
		} else {
			alert("You are not a stakeholder of this organization");
		}
		setLoader(false);
	};

	const withdrawTokens = async (e) => {
		setLoader(true);
		e.preventDefault();
		if (whitelisted) {
			if (Date.now() < organization.releaseTime) {
				alert("Tokens are not yet vested");
			} else {
				const web3ModalVar = new Web3Modal({
					cacheProvider: true,
					providerOptions: {
						walletconnect: {
							package: WalletConnectProvider,
						},
					},
				});
				const instanceVar = await web3ModalVar.connect();
				const providerVar = new ethers.providers.Web3Provider(instanceVar);
				const signer = providerVar.getSigner();
				const stakeholderAddress = await signer.getAddress();
				// initalize smartcontract with the essentials detials.
				const smartContract = new ethers.Contract(
					contractAddress,
					abi,
					provider
				);
				const contractWithSigner = smartContract.connect(signer);
				const response = await contractWithSigner.withdrawTokens(
					stakeholderAddress,
					organization.address
				);
				alert("Tokens withdrawn successfully");
				const resp = await contractWithSigner.getShareholderBalance(
					stakeholderAddress,
					organization.address
				);
				setShareholderBalance(resp.toNumber());
			}
		} else {
			alert("You are not whitelisted by the organization.");
		}
		setLoader(false);
	};

	async function initWallet() {
		try {
			// check if any wallet provider is installed. i.e metamask xdcpay etc
			if (typeof window.ethereum === "undefined") {
				console.log("Please install wallet.");
				alert("Please install wallet.");
				return;
			} else {
				// raise a request for the provider to connect the account to our website
				const web3ModalVar = new Web3Modal({
					cacheProvider: true,
					providerOptions: {
						walletconnect: {
							package: WalletConnectProvider,
						},
					},
				});

				const instanceVar = await web3ModalVar.connect();
				const providerVar = new ethers.providers.Web3Provider(instanceVar);
				setProvider(providerVar);
				const signer = providerVar.getSigner();
				const orgAddress = await signer.getAddress();
				// initalize smartcontract with the essentials detials.
				const smartContract = new ethers.Contract(
					contractAddress,
					abi,
					provider
				);
				const contractWithSigner = smartContract.connect(signer);
				const response = await contractWithSigner.getOrgNames();
				setOrgNames(response);
				return;
			}
		} catch (error) {
			console.log(error);
			return;
		}
	}

	const updateBalance = async () => {
		if (organization) {
			const web3ModalVar = new Web3Modal({
				cacheProvider: true,
				providerOptions: {
					walletconnect: {
						package: WalletConnectProvider,
					},
				},
			});
			const instanceVar = await web3ModalVar.connect();
			const providerVar = new ethers.providers.Web3Provider(instanceVar);
			const signer = providerVar.getSigner();
			const stakeholderAddress = await signer.getAddress();
			// initalize smartcontract with the essentials detials.
			const smartContract = new ethers.Contract(contractAddress, abi, provider);
			const contractWithSigner = smartContract.connect(signer);
			const resp = await contractWithSigner.getShareholderBalance(
				stakeholderAddress,
				organization.address
			);
			setShareholderBalance(resp.toNumber());
		}
	};

	useEffect(() => {
		initWallet();
		const web3ModalVar = new Web3Modal({
			cacheProvider: true,
			providerOptions: {
				walletconnect: {
					package: WalletConnectProvider,
				},
			},
		});
	}, []);
	useEffect(() => {
		updateBalance();
	}, [organization]);
	return (
		<>
			<link
				rel="stylesheet"
				href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
			/>
			<div className="m-6 space-y-4">
				<h1 className="text-blue-700 text-5xl font-bold text-center m-10">
					<a href="/">Vesting Scheduler</a>
				</h1>
			</div>
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-blue-700 text-4xl font-bold text-center m-10">
					Withdraw Tokens
				</h1>
			</div>
			{organization ? (
				<>
					<div className="flex flex-col items-center justify-center">
						<h1 className="text-blue-700 text-3xl font-bold text-center m-10">
							Current {organization.tokenSymbol} Balance : {shareholderBalance}{" "}
							{organization.tokenSymbol}
						</h1>
					</div>
					{shareholderBalance > 0 ? (
						<div className="flex flex-col items-center justify-center">
							<h1 className="text-blue-700 text-5xl font-bold text-center m-10">
								You have already withdrawn your tokens.
							</h1>
						</div>
					) : (
						<>
							<div className="flex flex-col items-center justify-center">
								<h1 className="text-blue-700 text-3xl font-bold text-center m-10">
									Your Vested Amount : {shareholderVested}{" "}
									{organization.tokenSymbol}
								</h1>
							</div>
							<div className="flex flex-col items-center justify-center">
								<h1 className="text-blue-700 text-3xl font-bold text-center m-10">
									Release Time :{" "}
									{organization.releaseTime?.toLocaleString("en-GB", {
										timeZone: "IST",
										hour12: true,
									})}
								</h1>
							</div>
							<div className="flex flex-col items-center justify-center">
								<h1 className="text-blue-700 text-3xl font-bold text-center m-10">
									Whitelisted:{" "}
									{whitelisted ? (
										<i class="fas fa-check-circle text-green-500"></i>
									) : (
										<i class="fas fa-xmark text-red-500"></i>
									)}
								</h1>
							</div>
							<div className="flex flex-col items-center justify-center">
								<button
									class="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded justify-center my-5 w-3/12"
									type="button"
									onClick={withdrawTokens}
								>
									{loader ? (
										<svg
											className="animate-spin m-1 h-5 w-5 text-white"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75 text-gray-700"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
									) : (
										<span>Withdraw</span>
									)}
								</button>
							</div>
						</>
					)}
				</>
			) : (
				<form class="w-full" method="post">
					<div class="flex flex-wrap -mx-3 mb-6">
						<div class="w-full md:w-1/4 px-3"></div>
						<div class="w-full md:w-1/4 px-3">
							<label
								class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
								for="orgName"
							>
								Select your Organization
							</label>
							<div class="relative">
								<select
									class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
									id="orgName"
									onChange={handleInput}
								>
									{orgNames ? (
										orgNames.map((orgName, index) => {
											if (index == 0) {
												return (
													<>
														<option value="null" selected disabled hidden>
															Select
														</option>
														<option value={orgName}>{orgName}</option>
													</>
												);
											}
											return <option value={index}>{orgName}</option>;
										})
									) : (
										<option value="null" selected disabled hidden>
											No Organizations Exist
										</option>
									)}
								</select>
								<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
									<svg
										class="fill-current h-4 w-4"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
									>
										<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
									</svg>
								</div>
							</div>
						</div>
						<div class="w-full md:w-1/4 px-3">
							<button
								class="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded justify-center my-5 w-full"
								type="button"
								onClick={submitForm}
							>
								{loader ? (
									<svg
										className="animate-spin m-1 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75 text-gray-700"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								) : (
									<span>Submit</span>
								)}
							</button>
						</div>
						<div class="w-full md:w-1/4 px-3"></div>
					</div>
				</form>
			)}
		</>
	);
}
