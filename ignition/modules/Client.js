const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ONE_GWEI = 1_000_000_000n;
const controller = '0x99C3e5bB1F1531Fa514D3BE6b5f9568CB5B99698';
module.exports = buildModule("ClientModule", (m) => {
  const client = m.contract("Client", [controller])

  return { client };
});
