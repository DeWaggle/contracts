const  hre = require('hardhat')
const xrpl = require("xrpl");

const { address: jobManagerAddr, abi: jobManagerAbi} =  require('../xrpl/CoopHiveOnChainJobCreator.json')
const { address: tokenAddr, abi: tokenAbi} = require('../xrpl/CoopHiveToken.json')
async function main() {
  const accounts = await hre.ethers.getSigners()
  // the private key of the person with tokens
  //const privateKey = process.env.WEB3_PRIVATE_KEY
  /*
  if(!privateKey) {
    console.error(`WEB3_PRIVATE_KEY env variable is required`)
    process.exit(1)
  }*/
  // it's annoying to not be able to use argv but hardhat complains about it
  const message = process.env.MESSAGE || 'Hello World!'
  //const wallet = new ethers.Wallet(privateKey).connect(ethers.provider)

  const token = new hre.ethers.Contract(tokenAddr, tokenAbi)

  const manager = new hre.ethers.Contract(jobManagerAddr, jobManagerAbi)
  console.log('manager', jobManagerAbi)

  // this is a deloyed version of ExampleClient.sol
  // this is be replaced by whatever client contract
  // has been deployed
  console.log('process', process.env.CLIENT_ADDR)
  const client = await hre.ethers.getContractAt("Client", process.env.CLIENT_ADDR)
  
  // how many tokens do jobs currently cost?
  console.log('manager addr', await manager.getAddress())
  const requiredDeposit = await manager.connect(accounts[0]).getRequiredDeposit()
  // what is the address of the solver who we approve tokens to be spent by?
  const solverAddress = await manager.connect(accounts[0]).getControllerAddress()

  console.log(`requiredDeposit: ${Number(requiredDeposit)}`)

  const paytokensTx = await token.connect(accounts[0]).approve(solverAddress, requiredDeposit)
  await paytokensTx.wait()

  console.log(`tokens approved: ${paytokensTx.hash}`)

  const runjobTx = await client.connect(accounts[0]).runCowsay(message, {gasLimit: 1000000})
  const receipt = await runjobTx.wait()
  if(!receipt) throw new Error(`no receipt`)

  console.log(`submitted job: ${runjobTx.hash}`)
  
  let jobID = 0

  receipt.logs.forEach((log) => {
    const logs = client.interface.parseLog(log)
    if(!logs) return
    jobID = Number(logs.args[0])
  })

  console.log(`Job ID: ${jobID}`)
  console.log('--------------------------------------------')
  console.log(`Waiting for job to be completed...`)

  let result = ''

  while(!result) {
    result = await client.getJobResult(jobID)
    if(!result) {
      await bluebird.delay(1000)
    }
    console.log(`waiting for job result: ${new Date().toLocaleString()}`)
  }

  console.log(`Job result: ${result}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});