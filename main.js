// Add imports here

//We will use this to generate random input to generate a private key.
const BIP39 = require("bip39")

//To generate a private key from the hex seed, we will to use the ethereumjs-wallet library
const hdkey = require('ethereumjs-wallet/hdkey')

//With the private key, we can generate the public key. Import the ethereumjs wallet and derive the public key
const Wallet = require('ethereumjs-wallet')

//Deriving an Ethereum address from a public key requires an additional hashing algorithm.
const keccak256 = require('js-sha3').keccak256;

//You can sign transactions in the browser with the ethereumjs-tx library.
const EthereumTx = require('ethereumjs-tx')

var isValid = BIP39.validateMnemonic("Enter your mnemonic here")
// This will return false


// Add functions here

// Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
function generateMnemonic(){
    return BIP39.generateMnemonic()
}

//With this mnemonic, you can generate a seed from which to generate a private key. Add the following line to main.js
function generateSeed(mnemonic){
    return BIP39.mnemonicToSeed(mnemonic)
}

function generatePrivKey(mnemonic){
    const seed = generateSeed(mnemonic)
    return hdkey.fromMasterSeed(seed).derivePath(`m/44'/60'/0'/0/0`).getWallet().getPrivateKey()
}

function derivePubKey(privKey){
    const wallet = Wallet.fromPrivateKey(privKey)    
    return wallet.getPublicKey()
}

function deriveEthAddress(pubKey){
    const address = keccak256(pubKey) // keccak256 hash of  publicKey
    // Get the last 20 bytes of the public key
    return "0x" + address.substring(address.length - 40, address.length)    
}

//Taking the keccak-256 hash of the public key will return 32 bytes which you need to trim down to the last 20 bytes (40 characters in hex) to get the address
function deriveEthAddress(pubKey){
    const address = keccak256(pubKey) // keccak256 hash of  publicKey
    // Get the last 20 bytes of the public key
    return "0x" + address.substring(address.length - 40, address.length)    
}

//Nodes that are verifying transactions in the network will use the signature to determine the address of the signatory, cryptographically verifying that every transaction from this account is coming from someone who has access to the corresponding private key.
function signTx(privKey, txData){
    const tx = new EthereumTx(txData)
    tx.sign(privKey)
    return tx
}

//You can recover the sender address from the signed transaction with the following method
function getSignerAddress(signedTx){
    return "0x" + signedTx.getSenderAddress().toString('hex')
}


/*

Do not edit code below this line.

*/

var mnemonicVue = new Vue({
    el:"#app",
    data: {  
        mnemonic: "",
        privKey: "",
        pubKey: "",
        ETHaddress: "",
        sampleTransaction: {
            nonce: '0x00',
            gasPrice: '0x09184e72a000', 
            gasLimit: '0x2710',
            to: '0x31c1c0fec59ceb9cbe6ec474c31c1dc5b66555b6', 
            value: '0x10', 
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
            chainId: 3
        },
        signedSample: {},
        recoveredAddress: ""
    },
    methods:{
        generateNew: function(){
            this.mnemonic = generateMnemonic()
        },
        signSampleTx: function(){
            this.signedSample = signTx(this.privKey, this.sampleTransaction)
            console.log("signed Sample", this.signedSample)
        }
    },
    watch: {
        mnemonic: function(val){
            this.privKey = generatePrivKey(val)
        },
        privKey: function(val){
            this.pubKey = derivePubKey(val)
        },
        pubKey: function(val){
            this.ETHaddress = deriveEthAddress(val)
            this.recoveredAddress = ""
        },
        signedSample: function(val){
            this.recoveredAddress = getSignerAddress(val)
        }
    }
})
