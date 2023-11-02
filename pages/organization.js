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

export default function Organization() {
  const router = useRouter();
  // env variables are initalised
  // contractAddress is deployed smart contract addressed
  const contractAddress = process.env.CONTRACT_ADDRESS;
  // application binary interface is something that defines structure of smart contract deployed.
  const abi = contractABI.abi;

  // hooks for required variables
  const [provider, setProvider] = useState();
  const [organization, setOrganization] = useState({});
  const [registerFlag, setRegisterFlag] = useState(true);
  const [counter, setCounter] = useState(1);

  const [formData, setFormData] = useState({
    i: counter,
    shareholderAddress0: "",
    shareholderCategory0: undefined,
    shareholderVestedAmount0: 0,
    whitelist0: false,
  });
  const [loader, setLoader] = useState(false);

  const handleInput = (e) => {
    const fieldName = e.target.id;
    const fieldValue = e.target.value;
    if (fieldName.includes("whitelist")) {
      if (Object.keys(formData).includes(fieldName)) {
        if (formData[fieldName]) {
          setFormData((prevState) => ({
            ...prevState,
            [fieldName]: false,
          }));
        } else {
          setFormData((prevState) => ({
            ...prevState,
            [fieldName]: true,
          }));
        }
      } else {
        setFormData((prevState) => ({
          ...prevState,
          [fieldName]: true,
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [fieldName]: fieldValue,
      }));
    }
  };

  const displayOrganization = async () => {
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
    const orgAddress = await signer.getAddress();
    const smartContract = new ethers.Contract(contractAddress, abi, provider);
    const contractWithSigner = smartContract.connect(signer);
    const response = await contractWithSigner.getOrganizationByAddress(
      orgAddress
    );
    var organization1 = { address: orgAddress };
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
      myBalance,
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
    organization1.myBalance = myBalance;
    organization1.releaseTime = new Date(releaseTime.toNumber() * 1000);
    var tmp = [];
    for (let i = 0; i < organization1.stakeholdersVestedAmounts.length; i++) {
      tmp.push(organization1.stakeholdersVestedAmounts[i].toNumber());
    }
    organization1.stakeholdersVestedAmounts = tmp;
    setOrganization(organization1);
  };

  const submitForm = async (e) => {
    setLoader(true);
    e.preventDefault();
    //Proces data and create organization
    const name = formData.name;
    const tokenName = formData.tokenName;
    const tokenSymbol = formData.tokenSymbol;
    const vestingPeriod =
      parseInt(formData.durationDays) * 86400 +
      parseInt(formData.durationHours) * 3600 +
      parseInt(formData.durationMinutes) * 60;
    let shareholderAddresses = [];
    let shareholderCategories = [];
    let shareholderVestedAmounts = [];
    let whitelist = [];
    for (let i = 0; i < parseInt(formData.i); i++) {
      shareholderAddresses.push(formData["shareholderAddress" + i]);
      shareholderCategories.push(parseInt(formData["shareholderCategory" + i]));
      shareholderVestedAmounts.push(
        parseInt(formData["shareholderVestedAmount" + i])
      );
      whitelist.push(formData["whitelist" + i] == true);
    }
    const signer = provider.getSigner();
    const orgAddress = await signer.getAddress();
    const l = parseInt(formData.i);
    if (
      orgAddress &&
      name &&
      tokenName &&
      tokenSymbol &&
      vestingPeriod &&
      shareholderAddresses.length == l &&
      shareholderCategories.length == l &&
      shareholderVestedAmounts.length == l &&
      whitelist.length == l
    ) {
      const signer = provider.getSigner();
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);
      const writeNumTX = await contractWithSigner.createOrganization(
        orgAddress,
        name,
        tokenName,
        vestingPeriod,
        tokenSymbol,
        whitelist,
        shareholderAddresses,
        shareholderCategories,
        shareholderVestedAmounts
      );
      const response = await writeNumTX.wait();
      console.log(await response);
      router.reload();
    } else {
      alert("Please Fill All Fields");
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
        const response = await contractWithSigner.getOrganizationAddresses();
        setRegisterFlag(!response.includes(orgAddress));
        if (response.includes(orgAddress)) {
          displayOrganization();
        }
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  useEffect(() => {
    initWallet();
  }, []);
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="m-6 space-y-4">
        <h1 className="text-blue-700 text-5xl font-bold text-center m-10">
          Vesting Scheduler </h1>
        {registerFlag ? (
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-blue-700 text-3xl font-bold text-center m-10"> Create Organization</h1>
            <form class="w-full" method="post">
              <div class="flex flex-wrap -mx-3 mb-6">
                <div class="w-full px-3">
                  <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="name" >
                    Organization Name</label>
                  <input
                    class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="name" type="text" placeholder="ABC Corp." onChange={handleInput} /></div></div>
              <div class="flex flex-wrap -mx-3 mb-6">
                <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    for="tokenName"
                  >
                    Token Name
                  </label>
                  <input
                    class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    id="tokenName"
                    type="text"
                    placeholder="Ethereum"
                    onChange={handleInput}
                  />
                </div>
                <div class="w-full md:w-1/2 px-3">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    for="tokenSymbol"
                  >
                    Token Symbol
                  </label>
                  <input
                    class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="tokenSymbol"
                    type="text"
                    onChange={handleInput}
                    placeholder="ETH"
                  />
                </div>
              </div>
              <div class="flex flex-wrap -mx-3 mb-2">
                <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    for="durationDays"
                  >
                    Duration of Vesting (in days; put 0 if less than 1 day)
                  </label>
                  <input
                    class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    id="durationDays"
                    type="number"
                    placeholder="xxxx days"
                    onChange={handleInput}
                  />
                </div>
                <div class="w-full md:w-1/3 px-3">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    for="grid-last-name"
                  >
                    Duration of Vesting (Hours)
                  </label>
                  <input
                    class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="durationHours"
                    type="number"
                    placeholder="0 hours - 24 hours"
                    onChange={handleInput}
                  />
                </div>
                <div class="w-full md:w-1/3 px-3">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    for="durationMinutes"
                  >
                    Duration of Vesting (Minutes)
                  </label>
                  <input
                    class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="durationMinutes"
                    type="number"
                    placeholder="0 minutes - 60 minutes"
                    onChange={handleInput}
                  />
                </div>
              </div>
              <h1 className="text-blue-700 text-3xl font-bold text-center m-10">
                Shareholder Details
              </h1>
              <div className="grid grid-cols-2 gap-48">
                <button
                  class="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded justify-center my-5"
                  type="button"
                  onClick={() => {
                    const formData1 = { ...formData };
                    formData1["shareholderAddress" + counter] = "";
                    formData1["shareholderCategory" + counter] = undefined;
                    formData1["shareholderVestedAmount" + counter] = 0;
                    formData1["whitelist" + counter] = false;
                    setFormData(formData1);
                    setFormData((prevState) => ({
                      ...prevState,
                      i: counter + 1,
                    }));
                    setCounter(counter + 1);
                  }}
                >
                  Add Shareholder
                  <i class="fa-sharp fa-solid fa-plus mx-2 my-1"></i>
                </button>
                <button
                  class="flex bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded justify-center my-5"
                  type="button"
                  onClick={() => {
                    if (counter > 1) {
                      const formData1 = { ...formData };
                      delete formData1["shareholderAddress" + (counter - 1)];
                      delete formData1["shareholderCategory" + (counter - 1)];
                      delete formData1[
                        "shareholderVestedAmount" + (counter - 1)
                      ];
                      delete formData1["whitelist" + (counter - 1)];
                      setFormData(formData1);
                      setFormData((prevState) => ({
                        ...prevState,
                        i: counter - 1,
                      }));
                      setCounter(counter - 1);
                    } else {
                      alert("At least one shareholder required.");
                    }
                  }}
                >
                  Remove Last Shareholder
                  <i class="fa-solid fa-trash mx-2 my-1"></i>
                </button>
              </div>
              {Array.from({ length: counter }, (_, i) => (
                <div class="flex flex-wrap -mx-3 mb-2">
                  <div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      for={"whitelist" + i}
                    >
                      Shareholder {i + 1} - Whitelist (Tick to whitelist)
                    </label>
                    <input
                      class="w-full"
                      id={"whitelist" + i}
                      type="checkbox"
                      onClick={handleInput}
                    />
                  </div>
                  <div class="w-full md:w-1/4 px-3 mb-6 md:mb-0">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      for={"shareholderAddress" + i}
                    >
                      Shareholder {i + 1} - Address
                    </label>
                    <input
                      class="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                      id={"shareholderAddress" + i}
                      type="text"
                      placeholder="0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      onChange={handleInput}
                    />
                  </div>
                  <div class="w-full md:w-1/4 px-3">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      for={"shareholderCategory" + i}
                    >
                      Shareholder {i + 1} - Category
                    </label>
                    <div class="relative">
                      <select
                        class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id={"shareholderCategory" + i}
                        onChange={handleInput}
                      >
                        <option value="none" selected disabled hidden>
                          Select
                        </option>
                        <option value="0">Founder</option>
                        <option value="1">Community</option>
                        <option value="2">Investor</option>
                        <option value="3">Pre-Sale Buyers</option>
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
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      for={"shareholderVestedAmount" + i}
                    >
                      Shareholder {i + 1} - Vested Amount
                    </label>
                    <input
                      class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      id={"shareholderVestedAmount" + i}
                      type="number"
                      placeholder="0 - xxxxxxxxxxxxxx"
                      onChange={handleInput}
                    />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1">
                <button
                  class="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded justify-center my-5"
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
            </form>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-blue-700 text-5xl font-bold text-center m-10">
                Organization Details
              </h1>
              <h1 className="text-blue-700 text-3xl font-bold text-center m-4">
                Current Balance of {organization.tokenSymbol} :{" "}
                {organization.myBalance?.toNumber()}
              </h1>
            </div>
            <table class="text-center table-auto text-blue-700 text-3xl m-auto border-separate border-spacing-8">
              <thead>
                <tr class="text-4xl">
                  <th class="underline underline-offset-4">#</th>
                  <th class="underline underline-offset-4">Criteria</th>
                  <th class="underline underline-offset-4">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1.</td>
                  <td>Organization Name</td>
                  <td>{organization.name}</td>
                </tr>
                <tr>
                  <td>2.</td>
                  <td>Organization Address</td>
                  <td>{organization.address}</td>
                </tr>
                <tr>
                  <td>3.</td>
                  <td>Token Name</td>
                  <td>{organization.tokenName}</td>
                </tr>
                <tr>
                  <td>4.</td>
                  <td>Token Symbol</td>
                  <td>{organization.tokenSymbol}</td>
                </tr>
                <tr>
                  <td>5.</td>
                  <td>Token Release Time</td>
                  <td>
                    {organization.releaseTime?.toLocaleString("en-GB", {
                      timeZone: "IST",
                      hour12: true,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
            <hr class="w-48 h-1 mx-auto my-4 bg-blue-100 border-0 rounded md:my-10 dark:bg-blue-700" />
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-blue-700 text-5xl font-bold text-center m-10">
                Shareholder Details
              </h1>
            </div>
            <table class="text-center table-auto text-blue-700 text-3xl m-auto border-separate border-spacing-8">
              <thead>
                <tr class="text-4xl">
                  <th class="underline underline-offset-4">#</th>
                  <th class="underline underline-offset-4">
                    Shareholder Address
                  </th>
                  <th class="underline underline-offset-4">
                    Shareholder Category
                  </th>
                  <th class="underline underline-offset-4">
                    Shareholder Vested Amount
                  </th>
                  <th class="underline underline-offset-4">
                    Shareholder Whitelisted
                  </th>
                </tr>
              </thead>
              <tbody>
                {organization &&
                  Array.from(
                    { length: organization.shareholderAddresses?.length },
                    (_, i) => (
                      <tr>
                        <td>{i + 1}.</td>
                        <td>
                          {organization.shareholderAddresses[i]?.slice(0, 15)}
                          ...
                        </td>
                        <td>
                          {organization.stakeholdersCategories[i] == 0
                            ? "Founder"
                            : organization.stakeholdersCategories[i] == 1
                              ? "Community"
                              : organization.stakeholdersCategories[i] == 2
                                ? "Investor"
                                : organization.stakeholdersCategories[i] == 3
                                  ? "Pre-Sale Buyers"
                                  : "Error"}
                        </td>
                        <td>{organization.stakeholdersVestedAmounts[i]}</td>
                        <td>
                          {organization.whitelistedAddresses[i] ? (
                            <i class="fas fa-check-circle text-green-500"></i>
                          ) : (
                            <i class="fa-solid fa-xmark text-red-500"></i>
                          )}
                        </td>
                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}



