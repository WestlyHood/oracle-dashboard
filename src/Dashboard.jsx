import { useEffect, useState } from "react";

const API_URL = "https://ai-price-oracle.onrender.com/price"; // backend endpoint
const ETHERSCAN_BASE = "https://sepolia.etherscan.io/tx/"; // explorer for Sepolia

export default function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setPrices(data);

        if (data.length > 0) {
          const latestTs = Math.max(...data.map((p) => p.timestamp));
          setLastUpdated(new Date(latestTs * 1000).toLocaleTimeString());
        }
      } catch (err) {
        console.error("Error fetching prices:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          ⚡Ritual Price Oracle Dashboard
        </h1>

        {lastUpdated && (
          <p className="text-center text-gray-400 mb-10 flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span>
              Last update:{" "}
              <span className="font-mono text-purple-300">{lastUpdated}</span>
            </span>
          </p>
        )}

        {/* 🔥 Center the card grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-20 w-fit">
            {prices.length > 0 ? (
              prices.map((p) => {
                const currentPrice = p.priceE8 / 1e8;
                let predictionLabel = null;

                if (p.prediction5m && p.prediction5m !== "Not enough data yet") {
                  const predicted = Number(p.prediction5m);
                  const isUp = predicted > currentPrice;
                  predictionLabel = (
                    <span
                      className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                        isUp ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      ⏳ 5m Prediction: {predicted.toFixed(2)} {isUp ? "↑" : "↓"}
                    </span>
                  );
                } else {
                  predictionLabel = (
                    <span className="inline-block mt-3 px-3 py-1 rounded-full text-sm bg-gray-700/50 text-gray-400 italic">
                      ⏳ Waiting for more data...
                    </span>
                  );
                }

                return (
                  <div
                    key={`${p.base}/${p.quote}`}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 min-w-[280px] sm:min-w-[320px] text-center transition transform hover:scale-105 hover:shadow-2xl"
                  >
                    <h2 className="text-xl font-semibold text-gray-100 mb-3">
                      {p.base}/{p.quote}
                    </h2>
                    <p className="text-3xl font-extrabold text-purple-300 drop-shadow-sm mb-2">
                      {currentPrice.toFixed(2)}
                    </p>
                    <p className="text-gray-400">
                      Confidence:{" "}
                      <span
                        className={`font-semibold ${
                          p.confidenceBP > 9500 ? "text-green-400" : "text-yellow-400"
                        }`}
                      >
                        {(p.confidenceBP / 100).toFixed(2)}%
                      </span>
                      <br />
                      Time:{" "}
                      <span className="font-mono">
                        {new Date(p.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </p>
                    {predictionLabel}

                    {p.txHash && (
                      <a
                        href={`${ETHERSCAN_BASE}${p.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-5 text-sm text-blue-400 hover:underline truncate"
                      >
                        🔗 View Tx: {p.txHash.slice(0, 8)}...{p.txHash.slice(-6)}
                      </a>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center w-full text-lg">
                🔄 Fetching oracle data... please wait
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
