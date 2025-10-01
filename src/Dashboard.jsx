import { useEffect, useState } from "react";

const API_URL = "https://ai-price-oracle.onrender.com/price"; // backend endpoint

const PAIRS = [
  { base: "ETH", quote: "USD" },
  { base: "BTC", quote: "USD" },
  { base: "ETH", quote: "BNB" },
];

export default function Dashboard() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setPrices(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching prices:", err);
        setLoading(false);
      }
    };

    // fetch immediately on load
    fetchPrices();

    // refresh every 10s
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const getPriceForPair = (base, quote) =>
    prices.find((p) => p.base === base && p.quote === quote);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          AI Oracle Dashboard
        </h1>

        {loading && (
          <p className="text-center text-gray-500 mb-6">
            ⏳ Fetching latest prices...
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIRS.map((pair) => {
            const p = getPriceForPair(pair.base, pair.quote);

            if (!p) {
              return (
                <div
                  key={`${pair.base}/${pair.quote}`}
                  className="bg-white rounded-2xl shadow-lg p-6 text-center"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {pair.base}/{pair.quote}
                  </h2>
                  <p className="text-gray-500">No data yet</p>
                </div>
              );
            }

            const currentPrice = p.priceE8 / 1e8;

            let predictionLabel;
            if (p.prediction5m && p.prediction5m !== "Not enough data yet") {
              const predicted = Number(p.prediction5m);
              const isUp = predicted > currentPrice;
              predictionLabel = (
                <p
                  className={`font-medium mt-2 ${
                    isUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ⏳ 5m Prediction: {predicted.toFixed(2)}{" "}
                  {isUp ? "↑" : "↓"}
                </p>
              );
            } else {
              predictionLabel = (
                <p className="text-gray-400 mt-2">
                  ⏳ 5m Prediction: Waiting for more data...
                </p>
              );
            }

            return (
              <div
                key={`${pair.base}/${pair.quote}`}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {pair.base}/{pair.quote}
                </h2>
                <p className="text-2xl font-bold">{currentPrice.toFixed(2)}</p>
                <p className="text-gray-600">
                  Confidence: {(p.confidenceBP / 100).toFixed(2)}% <br />
                  Time: {new Date(p.timestamp * 1000).toLocaleTimeString()}
                </p>
                {predictionLabel}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
