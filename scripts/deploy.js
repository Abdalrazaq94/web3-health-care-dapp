async function main() {
  console.log("🚀 Starting deployment to Sepolia testnet...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Get the contract factory
  const HealthcareSystem = await ethers.getContractFactory("HealthcareSystem");
  console.log("📝 Contract factory created");
  console.log("📦 Deploying HealthcareSystem contract...");
  console.log("⏳ Please wait, this may take 30-60 seconds...");
  
  // Deploy the contract
  const healthcareSystem = await HealthcareSystem.deploy();
  
  // Wait for deployment to complete
  await healthcareSystem.waitForDeployment();
  
  // Get the deployed contract address
  const address = await healthcareSystem.getAddress();
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DEPLOYMENT SUCCESSFUL!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📍 Contract Address:");
  console.log("   " + address);
  console.log("");
  console.log("🔍 View on Etherscan:");
  console.log("   https://sepolia.etherscan.io/address/" + address);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 SAVE THIS ADDRESS - You'll need it for frontend!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("🎉 Next Steps:");
  console.log("   1. Copy the contract address above");
  console.log("   2. Save it in a safe place");
  console.log("   3. Use it to connect your frontend");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed!");
    console.error(error);
    process.exit(1);
  });
