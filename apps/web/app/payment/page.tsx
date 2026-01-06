"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/lib/orderStore";

export default function PaymentPage() {
  const router = useRouter();
  const { currentOrder, setPaymentInfo } = useOrderStore();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    if (!currentOrder) {
      router.push("/estimator");
    }
  }, [currentOrder, router]);

  const handlePayment = async () => {
    if (!currentOrder) return;

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock payment ID
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Update order with payment info
    setPaymentInfo(currentOrder.id, paymentMethod, paymentId);

    // Store order confirmation for success page (includes full details for email)
    sessionStorage.setItem("orderConfirmation", JSON.stringify({
      orderId: currentOrder.id,
      paymentId,
      total: currentOrder.total,
      email: currentOrder.shipping.email,
      customerName: currentOrder.shipping.name,
      items: currentOrder.items.map(item => ({
        fileName: item.fileName,
        process: item.process,
        material: item.material,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: {
        address: currentOrder.shipping.address,
        city: currentOrder.shipping.city,
        state: currentOrder.shipping.state,
        zip: currentOrder.shipping.zip,
        country: currentOrder.shipping.country,
      },
    }));

    // Clear order preview
    sessionStorage.removeItem("orderPreview");

    setProcessing(false);
    router.push("/order-success");
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment</h1>
        <p className="text-slate-600 mb-8">Complete your order securely</p>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold text-slate-900">Order Total</span>
            <span className="text-2xl font-bold text-accent-600">
              ₹{currentOrder.total.toFixed(2)}
            </span>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Select Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  paymentMethod === "card"
                    ? "border-accent-600 bg-accent-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1">💳</div>
                <span className="text-sm font-medium">Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod("upi")}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  paymentMethod === "upi"
                    ? "border-accent-600 bg-accent-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1">📱</div>
                <span className="text-sm font-medium">UPI</span>
              </button>
              <button
                onClick={() => setPaymentMethod("netbanking")}
                className={`rounded-lg border-2 p-4 text-center transition-colors ${
                  paymentMethod === "netbanking"
                    ? "border-accent-600 bg-accent-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-2xl mb-1">🏦</div>
                <span className="text-sm font-medium">Net Banking</span>
              </button>
            </div>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      number: e.target.value.replace(/\D/g, "").slice(0, 16),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value.slice(0, 5) })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="***"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          {/* UPI Payment */}
          {paymentMethod === "upi" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="yourname@upi"
              />
              <p className="mt-2 text-xs text-slate-500">
                Or scan QR code with any UPI app (GPay, PhonePe, Paytm)
              </p>
            </div>
          )}

          {/* Net Banking */}
          {paymentMethod === "netbanking" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Bank</label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
                <option value="pnb">Punjab National Bank</option>
              </select>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-slate-100 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Order Details</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Order ID: {currentOrder.id}</p>
            <p>Items: {currentOrder.items.length}</p>
            <p>Shipping to: {currentOrder.shipping.city}, {currentOrder.shipping.state}</p>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className={`w-full rounded-lg py-4 text-lg font-semibold transition-colors ${
            processing
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-accent-600 text-white hover:bg-accent-700"
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing Payment...
            </span>
          ) : (
            `Pay ₹${currentOrder.total.toFixed(2)}`
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>🔒</span>
          <span>Secured by 256-bit SSL encryption</span>
        </div>

        <button
          onClick={() => router.push("/checkout")}
          className="mt-4 w-full text-center text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Checkout
        </button>
      </div>
    </div>
  );
}
