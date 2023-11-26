const { ethers } = require('ethers');


// RPC information

// eth rpc
// const rpc = 'https://mainnet.infura.io/v3/71c6aaa25cd745f4a9122632cde79935';

// linea rpc
// const rpc = 'https://linea-mainnet.infura.io/v3/71c6aaa25cd745f4a9122632cde79935';

// optimism rpc
// const rpc = 'https://optimism-mainnet.infura.io/v3/71c6aaa25cd745f4a9122632cde79935';

// arbitrum rpc
const rpc = 'https://arbitrum-mainnet.infura.io/v3/71c6aaa25cd745f4a9122632cde79935';

// polygon rpc
// const rpc = 'https://polygon-mainnet.infura.io/v3/71c6aaa25cd745f4a9122632cde79935';




// 地址
const toAddress = '';
// 私钥
const privateKey = '';


// 连接rpc
const provider = new ethers.providers.JsonRpcProvider(rpc);
const wallet = new ethers.Wallet(privateKey, provider);



// 自定义十六进制数据
const hexData = "0x646174613a2c7b2270223a22666169722d3230222c226f70223a226d696e74222c227469636b223a2266616972222c22616d74223a2231303030227d"; // 替换为你想要的十六进制数据

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
async function getGasLimit() {
  const gasLimit = await provider.estimateGas({
    to: toAddress,

    value: ethers.utils.parseEther("0"),
    data: hexData,
  });

  return gasLimit.toNumber();
}

// 转账交易
async function sendTransaction(nonce) {
  const currentGasPrice = await getGasPrice(); // 获取实时 gasPrice
  const increasedGasPrice = currentGasPrice.mul(110).div(100); // 在当前 gasPrice 上增加10%
  const gasLimit = await getGasLimit(); 

  console.log(`currentGasPrice --- ${currentGasPrice}   giveGas--- ${increasedGasPrice}`);

  const transaction = {
    to: toAddress,
    value: ethers.utils.parseEther("0"), // 替换为你要转账的金额
    data: hexData, 
    nonce: nonce, 
    gasPrice: increasedGasPrice, 
    gasLimit: gasLimit, 
  };

  try {
    const tx = await wallet.sendTransaction(transaction);
    console.log(`Transaction with nonce ${nonce} hash:`, tx.hash);
  } catch (error) {
    console.error(`Error in transaction with nonce ${nonce}:`, error.message);
  }
}

// 定义重复次数
const repeatCount = 2; // 你想要打多少张，这里就设置多少

async function sendTransactions() {
  const currentNonce = await getCurrentNonce(wallet);

  for (let i = 0; i < repeatCount; i++) {
    const gasPrice = await getGasPrice(); // 获取实时 gas 价格
    await sendTransaction(currentNonce + i, gasPrice);
  }
}

sendTransactions();
