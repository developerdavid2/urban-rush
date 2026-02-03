import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "../config/env";
import Product from "../models/productModel";
import User from "../models/userModel";
import Order from "../models/orderModel";
import Cart from "../models/cartModel";
import mongoose from "mongoose";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { cartItems, shippingAddress } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    // 1. Validate products & stock
    let subtotal = 0;
    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product.name} not found`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
      subtotal += product.price * item.quantity;
    }

    const shipping = 10.0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // 2. Find or create Stripe customer
    let customerId: string;
    if (user.stripeCustomerId) {
      customerId = user.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          clerkId: user.clerkId,
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    // 3. Create PaymentIntent with shipping address in metadata (as JSON string)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user._id.toString(),
        clerkId: user.clerkId,
        totalPrice: total.toFixed(2),
        shippingAddress: JSON.stringify(shippingAddress),
      },
      description: `Order for ${user.name} - $${total.toFixed(2)}`,
    });

    // 4. Return client secret
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment intent",
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  if (!sig || Array.isArray(sig)) {
    return res.status(400).send("Missing or invalid Stripe signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const {
        userId,
        totalPrice,
        shippingAddress: shippingAddressStr,
      } = paymentIntent.metadata;

      if (!userId) {
        console.error("No userId in metadata");
        return res.json({ received: true });
      }

      // Prevent duplicate processing
      const existingOrder = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (existingOrder) {
        console.log("Order already exists for payment:", paymentIntent.id);
        return res.json({ received: true });
      }

      if (!shippingAddressStr) {
        console.error("No shipping address in metadata");
        return res.json({ received: true });
      }

      let shippingAddress;
      try {
        shippingAddress = JSON.parse(shippingAddressStr);
      } catch (parseError) {
        console.error("Failed to parse shipping address:", parseError);
        return res.json({ received: true });
      }

      const user = await User.findById(userId);
      if (!user) {
        console.error("User not found:", userId);
        return res.json({ received: true });
      }

      const cart = await Cart.findOne({ userId }).populate({
        path: "items.productId",
        select: "name price images stock",
      });

      if (!cart || cart.items.length === 0) {
        console.error("Cart not found or empty for payment:", paymentIntent.id);
        return res.json({ received: true });
      }

      interface PopulatedCartItem {
        productId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          price: number;
          images: string[];
          stock: number;
        };
        quantity: number;
      }

      const populatedItems = cart.items as unknown as PopulatedCartItem[];

      const validItems = populatedItems.filter(
        (item) => item.productId !== null
      );

      if (validItems.length === 0) {
        console.error("No valid products in cart");
        return res.json({ received: true });
      }

      const orderItems = validItems.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        image: item.productId.images[0] || "",
      }));

      const order = await Order.create({
        userId,
        clerkId: user.clerkId,
        items: orderItems,
        totalAmount: parseFloat(totalPrice),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          street: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phoneNumber: shippingAddress.phoneNumber,
        },
        paymentStatus: "paid",
        orderStatus: "pending",
        paymentIntentId: paymentIntent.id,
      });

      for (const item of validItems) {
        await Product.findByIdAndUpdate(item.productId._id, {
          $inc: { stock: -item.quantity },
        });
      }

      await Cart.findByIdAndUpdate(cart._id, { items: [] });
    } catch (error) {
      console.error("Error creating order from webhook:", error);
    }
  }

  res.json({ received: true });
};
