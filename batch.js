const { ethers } = require('ethers');
const fs = require('fs').promises; 


const rpc = "https://opbnb-mainnet-rpc.bnbchain.org"


// 私钥
const privateKey = '';
const sendValue = ethers.utils.parseEther("0.00001"); // -----替换为你要转账的金额-------



// 从文件中读取地址
async function readAddressesFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const addresses = content.trim().split(/\r?\n/);
    console.log("address----", addresses);

    const trimmedAddresses = addresses.map((address) => address.trim());
    return trimmedAddresses;
  } catch (error) {
    console.error('Error reading addresses from file:', error.message);
    throw error;
  }
}


// 连接rpc
const provider = new ethers.providers.JsonRpcProvider(rpc);
const wallet = new ethers.Wallet(privateKey, provider);


// 获取当前账户的 nonce
async function getCurrentNonce(wallet) {
  try {
    const nonce = await wallet.getTransactionCount("pending");
    console.log("Nonce:", nonce);
    return nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error.message);
    throw error;
  }
}

// 获取当前主网 gas 价格
async function getGasPrice() {
  const gasPrice = await provider.getGasPrice();
  return gasPrice;
}

// 获取链上实时 gasLimit
async function getGasLimit(to, value) {
  try {
   
    const gasLimit = await wallet.estimateGas({
      to,
      value,
    });

    return gasLimit.toNumber();
  } catch (error) {
    console.error('Error estimating gas limit:', error.message);
    throw error;
  }
}

// 转账交易
async function sendTransaction(to, nonce, gasPrice, gasLimit, sendValue) {
  const transaction = {
    to,
    value: sendValue,
    nonce,
    gasPrice,
    gasLimit,
  };

  try {
    const tx = await wallet.sendTransaction(transaction);
    console.log(`Transaction with nonce ${nonce} hash:`, tx.hash);
  } catch (error) {
    console.error(`Error in transaction with nonce ${nonce}:`, error.message);
    debugger
    throw error;
  }
}

// 批量分发
async function batch() {
  // 从文件中读取地址
  const toAddress = await readAddressesFromFile('toAddresses.txt');

  const gasPrice = await getGasPrice();
  const currentNonce = await getCurrentNonce(wallet);
  console.log(`currentGasPrice --- : ${gasPrice}`);

  // 使用 for...of 循环确保每个 sendTransaction 调用都被等待
  for (const [index, to] of toAddress.entries()) {
    if (!to) continue;
    const sendValueInEther = ethers.utils.formatUnits(sendValue, 'ether');
    console.log(`send --- ${to} , value --- ${sendValueInEther}`);
    
    const gasLimit = await getGasLimit(to, sendValue);
    await sendTransaction(to, currentNonce + index, gasPrice, gasLimit, sendValue);
  }

}

batch();