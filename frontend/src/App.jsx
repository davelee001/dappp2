import { useState, useEffect } from "react";
import {
  isConnected,
  getAddress,
  signTransaction,
  requestAccess
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

// Contract & Network config
const CONTRACT_ID = "CAGUUCTNZRAYWO2VHD3VY7LH5MGB2BXKM2QQCD3Q6HVWSPOIGK3GF35B";
const RPC_URL = "https://soroban-testnet.stellar.org";
const networkPassphrase = StellarSdk.Networks.TESTNET;

const server = new StellarSdk.rpc.Server(RPC_URL);
const contract = new StellarSdk.Contract(CONTRACT_ID);

function App() {
  // Application state
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if Freighter exists
  useEffect(() => {
    async function init() {
      const installed = await isConnected();
      setFreighterInstalled(installed);
      loadMessages();
    }
    init();
  }, []);

  // Read messages from contract (read-only)
  async function loadMessages() {
    try {
      setError("");
      const dummy = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
      const sourceAccount = await server.getAccount(dummy);

      // Get messages
      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(contract.call("get_messages"))
        .setTimeout(30)
        .build();

      const simulated = await server.simulateTransaction(tx);

      if (simulated.result) {
        const decoded = StellarSdk.scValToNative(simulated.result.retval);
        setMessages(decoded || []);
        setTotalMessages(decoded?.length || 0);
      } else {
        // Demo data if contract not deployed yet
        setMessages([
          { user: "GABC...XYZ", content: "Hello from Soroban! (Demo)" }
        ]);
        setTotalMessages(1);
      }

    try {
      setError("");
      const installed = await isConnected();
      if (!installed) {
        setError("Please install Freighter wallet extension first!");
        window.open("https://www.freighter.app/", "_blank");
        return;
      }

      const access = await requestAccess();
      if (!access) {
        setError("Wallet access denied");
        return;
      }

      const result = await getAddress();
      setWalletAddress(result.address || result);
      setSuccess("Wallet connected successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    }
    const installed = await isConnected();
    if (!installed) {
      alert("Install Freighter wallet first");
      return;
    }) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const account = await server.getAccount(walletAddress);

      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(
          contract.call(
            "add_message",
            StellarSdk.nativeToScVal(walletAddress, { type: "address" }),
            StellarSdk.nativeToScVal(message, { type: "string" })
          )
        )
        .setTimeout(180)
        .build();

      const prepared = await server.prepareTransaction(tx);
      const signedXDR = await signTransaction(prepared.toXDR(), {
        networkPassphrase
      });

      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        networkPassphrase
      );

      const result = await server.sendTransaction(signedTx);
      
      if (result.status === "PENDING" || result.status === "SUCCESS") {
        setSuccess("Message added successfully!");
        setMessage("");
        setTimeout(() => {
       error && (
        <div style={{ 
          padding: "12px", 
          marginBottom: "16px", 
          backgroundColor: "#fee", 
          color: "#c00", 
          borderRadius: "8px",
          border: "1px solid #fcc"
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: "12px", 
          marginBottom: "16px", 
          backgroundColor: "#efe", 
          color: "#080", 
          borderRadius: "8px",
          border: "1px solid #cfc"
        }}>
          {success}
        </div>
      )}

      {!walletAddress ? (
        <button onClick={connectWallet}>
          {freighterInstalled ? "Connect Wallet" : "Install Freighter"}
        </button>
      ) : (
        <p>Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</p>
      )}

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        maxLength="200"
        onKeyPress={(e) => e.key === 'Enter' && !loading && addMessage()}
      />

      <button onClick={addMessage} disabled={loading || !walletAddress}>
        {loading ? "Adding..." : "Add Message"}
      </button>

      <h3>Messages ({totalMessages})</h3>

      {messages.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
          No messages yet. Be the first to sign the guestbook!
        </p>
      ) : (
        messages.map((m, i) => (
          <div key={i} style={{ 
            marginBottom: "16px", 
            padding: "16px", 
            backgroundColor: "var(--background-card)", 
            borderRadius: "8px",
            border: "1px solid var(--border-color)"
          }}>
            <b style={{ color: "var(--primary-color)" }}>
              {m.user?.slice(0, 8)}...{m.user?.slice(-8) || "Anonymous"}
            </b>
            <p style={{ marginTop: "8px" }}>{m.content}</p>
          </div>
        ))
      atch (error) {
      console.error("Write error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Stellar Guestbook</h2>

      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {walletAddress}</p>
      )}

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write message"
      />

      <button onClick={addMessage} disabled={loading}>
        Add Message
      </button>

      <h3>Messages ({totalMessages})</h3>

      {messages.map((m, i) => (
        <div key={i}>
          <b>{m.user}</b>
          <p>{m.content}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
