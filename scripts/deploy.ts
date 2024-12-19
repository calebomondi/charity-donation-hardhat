import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const Lock = await ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(1893456000);
  await lock.deploymentTransaction()?.wait();
  
  console.log(`Contract deployed to: ${await lock.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });