import { ethers } from './ethers-5.6.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');
connectButton.onclick = connect;
balanceButton.onclick = getBalance;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;

console.log(ethers);

async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('I see a metamask!');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    connectButton.innerHTML = 'CONNECTED';
  } else {
    connectButton.innerHTML = 'Please install Metamask!';
  }
}

async function getBalance() {
  if (typeof window.ethereum != 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

// Fund function
async function fund() {
  const ethAmount = document.getElementById('ethAmount').value;
  console.log(`Funding with ${ethAmount} ETH`);
  if (typeof window.ethereum !== 'undefined') {
    // provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // signer / wallet / someone with some gas
    const signer = provider.getSigner();
    // contract that we are interacting with ABI & Address
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done!');
    } catch (error) {
      console.log(error);
    }
  }
}

async function withdraw() {
  if (typeof window.ethereum != 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Withdraw successful');
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
