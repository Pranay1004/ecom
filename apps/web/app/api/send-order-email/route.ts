import { NextRequest, NextResponse } from "next/server";

// Email sending endpoint - simulates sending order confirmation emails
// In production, integrate with SendGrid, Resend, AWS SES, etc.

interface OrderEmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderTotal: number;
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

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@eshant3d.com";

export async function POST(request: NextRequest) {
  try {
    const body: OrderEmailRequest = await request.json();

    // Customer email content
    const customerEmailContent = `
Dear ${body.customerName},

Thank you for your order! Here are your order details:

Order ID: ${body.orderId}
Total: ₹${body.orderTotal.toFixed(2)}

Items:
${body.items.map((item) => `- ${item.fileName} (${item.process.toUpperCase()}, ${item.material.toUpperCase()}) x${item.quantity} = ₹${item.price.toFixed(2)}`).join("\n")}

Shipping Address:
${body.shippingAddress.address}
${body.shippingAddress.city}, ${body.shippingAddress.state} ${body.shippingAddress.zip}
${body.shippingAddress.country}

What's next?
1. Our team will review your order and begin production
2. You'll receive updates at each stage via email
3. Estimated delivery: 5-7 business days

Questions? Reply to this email or contact support@eshant3d.com

Thank you for choosing Eshant 3D!
    `.trim();

    // Admin email content
    const adminEmailContent = `
NEW ORDER RECEIVED

Order ID: ${body.orderId}
Customer: ${body.customerName} (${body.customerEmail})
Total: ₹${body.orderTotal.toFixed(2)}

Items:
${body.items.map((item) => `- ${item.fileName}
  Process: ${item.process.toUpperCase()}
  Material: ${item.material.toUpperCase()}
  Quantity: ${item.quantity}
  Price: ₹${item.price.toFixed(2)}`).join("\n\n")}

Shipping Address:
${body.shippingAddress.address}
${body.shippingAddress.city}, ${body.shippingAddress.state} ${body.shippingAddress.zip}
${body.shippingAddress.country}

Action Required: Review and begin production.
    `.trim();

    // In production, send actual emails using a service like:
    // - SendGrid: await sgMail.send({ to, from, subject, text })
    // - Resend: await resend.emails.send({ to, from, subject, text })
    // - AWS SES: await ses.sendEmail(params).promise()

    console.log("=== CUSTOMER EMAIL ===");
    console.log(`To: ${body.customerEmail}`);
    console.log(`Subject: Order Confirmation - ${body.orderId}`);
    console.log(customerEmailContent);
    console.log("\n=== ADMIN EMAIL ===");
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: New Order - ${body.orderId}`);
    console.log(adminEmailContent);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: "Order confirmation emails sent",
      sentTo: {
        customer: body.customerEmail,
        admin: ADMIN_EMAIL,
      },
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
