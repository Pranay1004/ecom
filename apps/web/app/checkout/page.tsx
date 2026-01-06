"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, ShippingInfo, OrderItem } from "@/lib/orderStore";

interface OrderPreview {
  fileName: string;
  process: string;
  material: string;
  tolerance: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  fileHash: string;
  volume: number;
  boundingBox: { x: number; y: number; z: number };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { createOrder } = useOrderStore();
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = sessionStorage.getItem("orderPreview");
    if (saved) {
      setOrderPreview(JSON.parse(saved));
    } else {
      router.push("/estimator");
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!shipping.name.trim()) newErrors.name = "Name is required";
    if (!shipping.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(shipping.email)) newErrors.email = "Invalid email";
    if (!shipping.phone.trim()) newErrors.phone = "Phone is required";
    if (!shipping.address.trim()) newErrors.address = "Address is required";
    if (!shipping.city.trim()) newErrors.city = "City is required";
    if (!shipping.state.trim()) newErrors.state = "State is required";
    if (!shipping.zip.trim()) newErrors.zip = "ZIP code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!validateForm() || !orderPreview) return;

    const item: OrderItem = {
      fileName: orderPreview.fileName,
      process: orderPreview.process,
      material: orderPreview.material,
      tolerance: orderPreview.tolerance,
      quantity: orderPreview.quantity,
      unitPrice: orderPreview.unitPrice,
      totalPrice: orderPreview.subtotal,
      fileHash: orderPreview.fileHash,
    };

    const order = createOrder([item], shipping);
    sessionStorage.setItem("currentOrderId", order.id);
    router.push("/payment");
  };

  if (!orderPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Checkout</h1>
        <p className="text-slate-600 mb-8">Review your order and enter shipping details</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Shipping Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    errors.name ? "border-red-500" : "border-slate-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.email ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.phone ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    errors.address ? "border-red-500" : "border-slate-300"
                  }`}
                  rows={2}
                  placeholder="123 Main St, Apt 4"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.city ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Mumbai"
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.state ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="Maharashtra"
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={shipping.zip}
                    onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      errors.zip ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder="400001"
                  />
                  {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <select
                    value={shipping.country}
                    onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-slate-900 truncate">{orderPreview.fileName}</p>
              <div className="mt-2 text-sm text-slate-600 space-y-1">
                <p>Process: {orderPreview.process?.toUpperCase()}</p>
                <p>Material: {orderPreview.material?.toUpperCase()}</p>
                <p>Tolerance: {orderPreview.tolerance}</p>
                <p>Quantity: {orderPreview.quantity}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">₹{orderPreview.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="font-medium">
                  {orderPreview.shipping === 0 ? "FREE" : `₹${orderPreview.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">GST (18%)</span>
                <span className="font-medium">₹{orderPreview.tax.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-accent-600">₹{orderPreview.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="mt-6 w-full rounded-lg bg-accent-600 py-3 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
            >
              Proceed to Payment
            </button>

            <button
              onClick={() => router.push("/estimator")}
              className="mt-2 w-full rounded-lg border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ← Back to Estimator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
