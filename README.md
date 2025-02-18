🏗 Scaffold-ETH 2 - Foundry Edition (Monad Devnet Ready)

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Foundry, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

> **Note for Windows users**. Foundryup is not currently supported by Powershell or Cmd, and has issues with Git Bash. You will need to use [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) as your terminal.

## Quickstart

To get started with Scaffold-ETH 2 Foundry Edition, follow the steps below:

1. Clone this repo & install dependencies

```bash
git clone https://github.com/scaffold-eth/se-2-foundry-monad.git
cd se-2-foundry-monad
yarn install
```

2. Run a local network in the first terminal:

```bash
yarn chain
```

3. On a second terminal, deploy the test contract:

```bash
yarn deploy
```

4. On a third terminal, start your NextJS app:

```bash
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

## Deploying to Live Networks

### Deploying your Frontend

To deploy your frontend, you need to set the following environment variables in `packages/nextjs/.env.local`:

```
NEXT_PUBLIC_MONAD_RPC_URL=
NEXT_PUBLIC_MONAD_BLOCKSCOUT_URL=
```

You can also copy the .env.example file and rename it to .env.local.

Before deploying, do not forget to change the target network in `packages/nextjs/scaffold.config.ts` to `monadDevnet`.

```typescript
  targetNetworks: [monadDevnet],
```

Then run `yarn vercel` to deploy your frontend to vercel. You need to have a vercel account.

### Setting Up Your Deployer Account

<details>
<summary>Option 1: Generate new account</summary>

```
yarn generate
```

This creates a `scaffold-eth-custom` [keystore](https://book.getfoundry.sh/reference/cli/cast/wallet#cast-wallet) in `~/.foundry/keystores/scaffold-eth-custom` account.

Update `.env` in `packages/foundry`:

```
ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom
```

</details>

<details>
<summary>Option 2: Import existing private key</summary>

```
yarn account:import
```

This imports your key as `scaffold-eth-custom`.

Update `.env`:

```
ETH_KEYSTORE_ACCOUNT=scaffold-eth-custom
```

</details>

View your account status:

```
yarn account
```

This will ask for your [keystore](https://book.getfoundry.sh/reference/cli/cast/wallet#cast-wallet) account password set in `packages/foundry/.env`.

### Deployment Commands

Before deploying, you need to create an .env file under `packages/foundry` and set the following variables:

```
MONAD_DEVNET_RPC_KEY=
MONAD_DEVNET_RPC_URL=
MONAD_DEVNET_VERIFIER_URL=
```

You may also copy the .env.example file and rename it to .env.

<details>
<summary>Understanding deployment scripts structure</summary>

Scaffold-ETH 2 uses two types of deployment scripts in `packages/foundry/script`:

1. `Deploy.s.sol`: Main deployment script that runs all contracts sequentially
2. Individual scripts (e.g., `DeployYourContract.s.sol`): Deploy specific contracts

Each script inherits from `ScaffoldETHDeploy` which handles:

- Deployer account setup and funding
- Contract verification preparation
- Exporting ABIs and addresses to the frontend
</details>

<details>
<summary>Basic deploy commands</summary>

1. Deploy all contracts (uses `Deploy.s.sol`):

```
yarn deploy
```

2. Deploy specific contract:

```bash
yarn deploy --file DeployYourContract.s.sol
```

3. Deploy to a network:

```
yarn deploy --network <network-name> --file <file-name>
```

For Monad Devnet, you can use:

```
yarn deploy --network monadDevnet
```

To verify the contract, you can use:

```
yarn verify --network monadDevnet
```

To do both right after one another, you can use:

```
yarn deploy --network monadDevnet && yarn verify --network monadDevnet
```

If you don't provide a file name, it will default to `Deploy.s.sol`.

</details>

<details>
<summary>Environment-specific behavior</summary>

**Local Development (`yarn chain`)**:

- No password needed for deployment if `ETH_KEYSTORE_ACCOUNT=scaffold-eth-default` is set in `.env` file.
- Uses Anvil's Account #9 as default keystore account

**Live Networks**:

- Requires custom keystore setup (see "Setting Up Your Deployer Account" above)
- Will prompt for keystore password
</details>

<details>
<summary>Creating new deployments</summary>

1. Create your contract in `packages/foundry/contracts`
2. Create deployment script in `packages/foundry/script` (use existing scripts as templates)
3. Add to main `Deploy.s.sol` if needed
4. Deploy using commands above
</details>

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.

## Thanks to the Scaffold-ETH 2 Team

Thanks to the Scaffold-ETH 2 Team for the amazing project and the great documentation.
<3

## Support

If you have any questions or need help, please dm me on tg, my handle is: `portdev`