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
  BoltIcon,
  DocumentIcon,
  ShieldCheckIcon,
} from "@/components/icons";

const highlights: LegalHighlight[] = [
  {
    icon: <KeyIcon />,
    title: "You hold the keys",
    description:
      "E-Lander is non-custodial. Nothing moves without your wallet's signature.",
  },
  {
    icon: <BoltIcon />,
    title: "Transactions are final",
    description:
      "Check every address, amount and network. Sent tokens cannot be recalled.",
  },
  {
    icon: <ShieldCheckIcon />,
    title: "Alchemist or Seeker access",
    description:
      "On Mainnet, tools unlock with an Alchemist NFT (held or staked) or a Seeker Genesis Token.",
  },
  {
    icon: <DocumentIcon />,
    title: "Network fees only",
    description:
      "E-Lander takes no share of what you send. You pay Solana network costs.",
  },
];

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    content: (
      <p>
        These terms apply to your use of the E-Lander app, on the web or on a Solana Seeker
        device (the &ldquo;Service&rdquo;). By connecting a wallet or using any tool, you
        agree to these terms and to our{" "}
        <Link href={PathConstant.PRIVACY_POLICY}>Privacy Policy</Link>. If you do not agree,
        do not use the Service.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <ul>
        <li>You must be at least 18 years old, or the age of majority where you live.</li>
        <li>
          You must not be subject to sanctions, and you must not use the Service from a place
          where using it is prohibited.
        </li>
        <li>
          You are responsible for following the laws that apply to you, including those on
          token distributions, securities and taxes.
        </li>
      </ul>
    ),
  },
  {
    id: "service",
    title: "What E-Lander is",
    content: (
      <>
        <p>
          E-Lander is a <strong>non-custodial</strong> interface for working with tokens and
          NFTs on the Solana blockchain. It does not hold your assets, cannot move them
          without your signature, and cannot reverse a transaction. The current tools are:
        </p>
        <ul>
          <li>
            <strong>Airdrop:</strong> send one token (SOL, SPL or Token-2022) to many
            addresses, entered by hand or uploaded as a CSV.
          </li>
          <li>
            <strong>Bulk Transfer:</strong> send several tokens to one address in a single
            transaction.
          </li>
          <li>
            <strong>Snapshot:</strong> list the holders of an NFT collection and download the
            list as a CSV.
          </li>
          <li>
            <strong>Profile:</strong> view your balances, your E-Lander Alchemist NFTs (held
            and staked) and your E-Lander Points.
          </li>
        </ul>
        <p>We may add, change, pause or remove tools at any time.</p>
      </>
    ),
  },
  {
    id: "wallets",
    title: "Wallets and signing",
    content: (
      <>
        <p>
          You use the Service through a third-party wallet that you control, such as Phantom,
          Solflare, Backpack, Ledger or the Seeker wallet. You alone are responsible for your
          private keys, your seed phrase and every transaction you approve. E-Lander will
          never ask for your seed phrase or private key.
        </p>
        <p>
          To connect, the app asks you to sign the message{" "}
          <em>&ldquo;{AppConstant.STEALTH_SIGNING_MESSAGE}&rdquo;</em>. This signature is free
          and is not a transaction. It is used on your device to derive your Airdrop wallet
          (see <a href="#airdrop">Airdrop</a>). Only sign this message on the E-Lander app.
        </p>
        <p>
          If you switch to another account inside your wallet, E-Lander disconnects you and
          asks you to connect and sign again with the new account.
        </p>
      </>
    ),
  },
  {
    id: "access",
    title: "Access to tools",
    content: (
      <>
        <p>
          On <strong>Solana Mainnet</strong>, Airdrop, Bulk Transfer and Snapshot are
          available to wallets that hold at least one of the following:
        </p>
        <ul>
          <li>
            an <strong>E-Lander Alchemist NFT</strong>, held in the wallet or staked through
            E-Lander staking; or
          </li>
          <li>
            a <strong>Seeker Genesis Token</strong>, issued by Solana Mobile to Seeker device
            owners.
          </li>
        </ul>
        <p>
          On <strong>Devnet</strong>, all tools are open for testing. Tokens on Devnet have
          no value.
        </p>
        <p>
          The app checks access from public on-chain data through your RPC provider. If the
          RPC provider is unavailable, the check may fail and the tools stay locked until it
          succeeds. Access is a convenience of the interface, not a right. We may change the
          access criteria at any time. Alchemist NFTs are bought from third-party
          marketplaces, such as Magic Eden, under their own terms.
        </p>
      </>
    ),
  },
  {
    id: "airdrop",
    title: "How Airdrop works",
    content: (
      <>
        <p>An airdrop runs in two stages:</p>
        <ol>
          <li>
            <strong>Funding.</strong> You sign one transaction that moves the total airdrop
            amount and the estimated network costs from your wallet to your{" "}
            <strong>Airdrop wallet</strong>. This is a separate wallet whose key is derived in
            your browser from your wallet address and your connection signature.
          </li>
          <li>
            <strong>Distribution.</strong> The app then sends from the Airdrop wallet to each
            recipient, one transaction at a time, without further prompts.
          </li>
        </ol>
        <p>
          Keep the page open until the airdrop is complete. If it stops partway, for example
          because you close the page, lose connection, the network rejects a transaction or a
          balance runs short, the remaining tokens and SOL stay in your Airdrop wallet.
          Signing the same message with the same wallet derives the same Airdrop wallet.
          E-Lander has no access to it and cannot recover funds on your behalf.
        </p>
        <p>
          Before you confirm, check the token, the amounts, every recipient address and the
          network. Tokens sent to a wrong address cannot be recovered.
        </p>
      </>
    ),
  },
  {
    id: "transfer-snapshot",
    title: "Bulk Transfer and Snapshot",
    content: (
      <>
        <p>
          <strong>Bulk Transfer</strong> puts every selected token into one transaction. If the
          recipient has no account for a token yet, the app creates one, and you pay its
          rent.
          Solana limits how large a transaction can be, so you may need to send fewer tokens
          at a time.
        </p>
        <p>
          <strong>Snapshot</strong> builds its holder list from your RPC provider&apos;s
          digital asset (DAS) data and Magic Eden statistics. Results depend on those sources
          and may be incomplete or out of date. Check a snapshot before you use it to decide
          who receives anything.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees",
    content: (
      <>
        <p>
          The fees shown before you confirm are estimates of Solana network costs:
          transaction fees, priority fees and the rent for any token accounts created. For an
          airdrop, these costs are sent to your Airdrop wallet together with the tokens. Any
          amount not used stays in that wallet.
        </p>
        <p>
          E-Lander does not take a share of the tokens you send. Network fees are paid to the
          Solana network, are charged even when a transaction fails, and cannot be refunded.
        </p>
      </>
    ),
  },
  {
    id: "responsibilities",
    title: "Your responsibilities",
    content: (
      <>
        <p>You agree that you will not use the Service to:</p>
        <ul>
          <li>send spam, phishing or unsolicited tokens meant to mislead recipients;</li>
          <li>defraud anyone or distribute tokens in breach of the law;</li>
          <li>avoid sanctions or launder funds;</li>
          <li>interfere with or attack the Service, its users or the networks it uses.</li>
        </ul>
        <p>
          You are solely responsible for the lists, addresses and amounts you submit, and for
          any obligations that come with distributing tokens.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Networks and third-party services",
    content: (
      <p>
        The Service relies on services E-Lander does not control: the Solana network, RPC
        providers, wallets, Magic Eden, GeckoTerminal, IPFS gateways and token metadata
        hosts. If you add a custom RPC URL, you choose that provider and accept its terms and
        reliability. We are not responsible for outages, wrong data or losses caused by these
        services. Token prices are shown for information only and may be inaccurate.
      </p>
    ),
  },
  {
    id: "risks",
    title: "Risks",
    content: (
      <ul>
        <li>Blockchain transactions are final and cannot be reversed.</li>
        <li>
          Network congestion, outages or software bugs can delay transactions, make them fail
          or charge fees without completing them.
        </li>
        <li>Token and NFT values can change sharply, including to zero.</li>
        <li>
          Anyone with access to your device or browser storage may be able to use your
          connected session or derive your Airdrop wallet.
        </li>
        <li>Laws on digital assets differ between countries and may change.</li>
      </ul>
    ),
  },
  {
    id: "no-advice",
    title: "No advice",
    content: (
      <p>
        Nothing in the Service is financial, investment, legal or tax advice. You make your
        own decisions about the tokens you hold, send or receive.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    content: (
      <p>
        The E-Lander name, logo, interface and content belong to E-Lander. You may use the
        Service for its intended purpose. You may not copy, resell or imitate it in a way
        that could mislead others. Lists and files you create remain yours.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    content: (
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
        warranties of any kind, whether express or implied. These include warranties of
        accuracy, availability, fitness for a particular purpose and non-infringement.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <p>
        To the fullest extent allowed by law, E-Lander is not liable for any indirect,
        incidental, special or consequential loss. This includes lost tokens, lost profits
        or lost data, caused by your use of the Service, by transactions you sign, or by
        third-party services or networks.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and termination",
    content: (
      <p>
        We may update these terms. The date at the top shows the latest version, and using
        the Service after an update means you accept it. We may limit or end access to the
        Service at any time, for example to comply with law or to protect users.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions about these terms? Reach E-Lander on X at{" "}
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
  kind: "terms",
  title: "Terms of Service",
  description:
    "The terms for using E-Lander's Solana tools: Airdrop, Bulk Transfer, Snapshot and Profile.",
  icon: <DocumentIcon className="w-6 h-6" />,
  intro: (
    <p>
      Please read these terms before using E-Lander. They explain what the Service does,
      what you are responsible for, and the risks of sending tokens on Solana.
    </p>
  ),
  highlights,
  sections,
};

export const metadata: Metadata = {
  title: `${content.title} | E-Lander`,
  description: content.description,
};

const TermsPage = () => <LegalDocument content={content} />;

export default TermsPage;
