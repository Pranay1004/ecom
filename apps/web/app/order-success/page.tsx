"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderConfirmation {
  orderId: string;
  paymentId: string;
  total: number;
  email: string;
  customerName: string;
  items: Array<{
    fileName: string;
    process: string;
    material: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("orderConfirmation");
    if (saved) {
      const parsed = JSON.parse(saved);
      setConfirmation(parsed);
      // Clear after reading
      sessionStorage.removeItem("orderConfirmation");
      sessionStorage.removeItem("currentOrderId");

      // Send confirmation emails
      sendConfirmationEmails(parsed);
    } else {
      router.push("/estimator");
    }
  }, [router]);

  const sendConfirmationEmails = async (orderData: OrderConfirmation) => {
    try {
      const response = await fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          customerEmail: orderData.email,
          customerName: orderData.customerName,
          orderTotal: orderData.total,
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        setEmailError("Failed to send confirmation email");
      }
    } catch (err) {
      console.error("Email error:", err);
      setEmailError("Failed to send confirmation email");
    }
  };

  if (!confirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-lg px-4 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 mb-4">
          Thank you for your order. We&apos;ve sent a confirmation email to{" "}
          <strong>{confirmation.email}</strong>
        </p>

        {/* Email Status */}
        {emailSent && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm text-green-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmation emails sent to you and our team
          </div>
        )}
        {emailError && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm text-yellow-800">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {emailError} - Don&apos;t worry, your order is confirmed!
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 text-left mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Details</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Order ID</span>
              <span className="font-mono font-medium text-slate-900">{confirmation.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Payment ID</span>
              <span className="font-mono font-medium text-slate-900">{confirmation.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Amount Paid</span>
              <span className="font-bold text-green-600">₹{confirmation.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Paid
              </span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 rounded-xl p-6 text-left mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Our team will review your order and start production</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>You&apos;ll receive updates via email at each stage</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Estimated delivery: 5-7 business days</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/estimator"
            className="block w-full rounded-lg bg-accent-600 py-3 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
          >
            Create Another Order
          </Link>
          <Link
            href="/"
            className="block w-full rounded-lg border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Support */}
        <p className="mt-8 text-xs text-slate-500">
          Questions about your order?{" "}
          <a href="mailto:support@eshant3d.com" className="text-accent-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
