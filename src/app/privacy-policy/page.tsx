import type { Metadata } from "next";
import Link from "next/link";

import { AppConstant, PathConstant } from "@/const";
import LegalDocument, {
  type LegalContent,
  type LegalHighlight,
  type LegalSection,
} from "@/components/legal/LegalDocument";
import {
  KeyIcon,
  EyeOffIcon,
  DocumentIcon,
  ShieldCheckIcon,
} from "@/components/icons";

const highlights: LegalHighlight[] = [
  {
    icon: <KeyIcon />,
    title: "Non-custodial",
    description:
      "We never see or store your private key or seed phrase. Every transaction is signed by your own wallet.",
  },
  {
    icon: <EyeOffIcon />,
    title: "No account, no KYC",
    description: "We never ask for your name, email, phone number or identity documents.",
  },
  {
    icon: <ShieldCheckIcon />,
    title: "Signature stays on device",
    description:
      "Your connection signature is kept in your browser and never sent to our servers or analytics.",
  },
  {
    icon: <DocumentIcon />,
    title: "No selling, no ads",
    description:
      "Analytics use a pseudonymous ID derived from your wallet, not the address itself.",
  },
];

const sections: LegalSection[] = [
  {
    id: "information",
    title: "Information we process",
    content: (
      <>
        <p>
          <strong>Your public wallet address.</strong> When you connect a wallet, the app
          uses its address to read your SOL and token balances, your E-Lander Alchemist NFTs
          (held or staked) and whether you hold a Seeker Genesis Token. These reads go to the
          Solana RPC endpoint you are connected to. Your address is also sent to the E-Lander
          backend to load your E-Lander Points on the Profile page. Wallet addresses and their
          activity are public on the Solana blockchain.
        </p>
        <p>
          <strong>Your connection signature.</strong> To connect, the app asks your wallet to
          sign the message{" "}
          <em>&ldquo;{AppConstant.STEALTH_SIGNING_MESSAGE}&rdquo;</em>. Signing it is free and
          does not send a transaction. The signature is stored in your browser and is used,
          on your device only, to derive the temporary wallet that the Airdrop tool sends
          from (see the{" "}
          <Link href={`${PathConstant.TERMS}#airdrop`}>Terms of Service</Link>). It is never
          sent to our servers or to analytics.
        </p>
        <p>
          <strong>What you enter into the tools.</strong> Recipient lists (typed or uploaded
          as CSV), amounts, recipient addresses and NFT collection addresses are processed in
          your browser. When you send tokens, the recipients and amounts become part of a
          public Solana transaction. Snapshot results are built in your browser and
          downloaded to your device as a CSV file.
        </p>
        <p>
          <strong>Usage analytics.</strong> We record events such as pages and tools opened,
          button and external link clicks, wallet connection success or failure, and the
          start, success or failure of an airdrop or bulk transfer. These events can include
          the token symbol, total amount, number of recipients or tokens, and error messages.
          Each event carries:
        </p>
        <ul>
          <li>a pseudonymous ID created by one-way hashing your wallet address;</li>
          <li>whether you use the web app or the Solana Seeker app;</li>
          <li>your browser language and the region taken from that language setting;</li>
          <li>your SOL balance.</li>
        </ul>
        <p>
          Google, which provides Firebase Analytics, may also collect standard technical data
          such as IP address and device and browser type, under its own privacy policy.
        </p>
      </>
    ),
  },
  {
    id: "browser-storage",
    title: "What is stored in your browser",
    content: (
      <>
        <p>The app keeps the following in your browser&apos;s local storage:</p>
        <ul>
          <li>your wallet address, wallet name and connection signature;</li>
          <li>
            cached balances, NFT lists and token prices, so pages load faster;
          </li>
          <li>your selected network (Mainnet or Devnet) and any custom RPC URLs you add.</li>
        </ul>
        <p>
          Disconnecting your wallet in E-Lander clears the wallet address, signature and
          cached wallet data. Your network settings stay until you remove them or clear the
          site&apos;s data in your browser.
        </p>
        <p>
          Google Analytics also sets its own cookies in your browser to count visits and
          sessions.
        </p>
        <p>
          Anyone who can access your browser storage could read your connection signature and
          derive your Airdrop wallet. Keep your device secure, and disconnect on shared
          devices.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    content: (
      <>
        <p>
          The app talks to the services below directly from your browser. Each receives the
          data needed for its request, plus your IP address, and handles it under its own
          policy.
        </p>
        <ul>
          <li>
            <strong>Solana RPC providers:</strong> the default mainnet endpoint run for
            E-Lander, Solana&apos;s public endpoint on Devnet, or a custom RPC URL you enter.
            They receive your wallet address, the accounts being read and the transactions
            you send.
          </li>
          <li>
            <strong>Your wallet</strong> (for example Phantom, Solflare, Backpack, Ledger or
            the Seeker wallet). It shows you each signature request and transaction.
          </li>
          <li>
            <strong>Magic Eden:</strong> the name or symbol of the collection you look up in
            Snapshot, to find it and fetch its holder statistics.
          </li>
          <li>
            <strong>GeckoTerminal:</strong> the token mint addresses in your wallet, to show
            USD prices.
          </li>
          <li>
            <strong>jsDelivr and GitHub:</strong> the public Solana token list and token
            logos.
          </li>
          <li>
            <strong>IPFS gateways and token metadata hosts:</strong> NFT and token images and
            metadata files.
          </li>
          <li>
            <strong>Firebase / Google Analytics:</strong> the usage events described above.
          </li>
          <li>
            <strong>E-Lander backend:</strong> your wallet address, to return your E-Lander
            Points.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "blockchain",
    title: "Public blockchain data",
    content: (
      <p>
        Transactions you send through E-Lander are recorded on the Solana blockchain. They
        are public, permanent and cannot be changed or deleted by E-Lander or anyone else.
        This includes your wallet address, the recipients, the tokens and the amounts.
      </p>
    ),
  },
  {
    id: "use",
    title: "How we use information",
    content: (
      <ul>
        <li>to run the tools you use and show your balances, NFTs and access status;</li>
        <li>to show your E-Lander Points;</li>
        <li>to understand which tools are used, find errors and improve the app.</li>
      </ul>
    ),
  },
  {
    id: "retention",
    title: "Retention",
    content: (
      <p>
        Browser data stays on your device until you disconnect or clear it. Analytics events
        are kept according to our Google Analytics retention settings. We cannot remove data
        that has been written to the blockchain.
      </p>
    ),
  },
  {
    id: "choices",
    title: "Your choices",
    content: (
      <ul>
        <li>Disconnect your wallet in E-Lander to clear your wallet data from the browser.</li>
        <li>Clear this site&apos;s data in your browser settings at any time.</li>
        <li>Block analytics with your browser&apos;s privacy settings or an extension.</li>
        <li>Connect through a custom RPC provider of your choice.</li>
      </ul>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <p>
        E-Lander is not intended for anyone under 18 or under the age of majority where they
        live. We do not knowingly process information about children.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <p>
        We may update this policy as the app changes. The date at the top shows the latest
        version. If you keep using E-Lander after an update, the updated policy applies.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions about this policy? Reach E-Lander on X at{" "}
        <a href={AppConstant.ELANDER_X_URL} target="_blank" rel="noopener noreferrer">
          @elander_nft
        </a>{" "}
        or visit{" "}
        <a href={AppConstant.ELANDER_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
          e-lander.xyz
        </a>
        .
      </p>
    ),
  },
];

const content: LegalContent = {
  kind: "privacy",
  title: "Privacy Policy",
  description:
    "How E-Lander handles your wallet address, connection signature, analytics events and the third-party services the app talks to.",
  icon: <ShieldCheckIcon className="w-6 h-6" />,
  intro: (
    <p>
      This policy explains what information E-Lander handles when you use the E-Lander
      app, on the web or on a Solana Seeker device, and how it is used.
    </p>
  ),
  highlights,
  sections,
};

export const metadata: Metadata = {
  title: `${content.title} | E-Lander`,
  description: content.description,
};

const PrivacyPolicyPage = () => <LegalDocument content={content} />;

export default PrivacyPolicyPage;
