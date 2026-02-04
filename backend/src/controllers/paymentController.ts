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
    console.error("Missing or invalid Stripe signature");
    return res.status(400).send("Webhook Error: Missing or invalid signature");
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

  // Handle successful payment
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const {
          userId,
          totalPrice,
          shippingAddress: shippingAddressStr,
        } = paymentIntent.metadata;

        if (!userId) {
          console.error("No userId in metadata");
          return;
        }

        if (!shippingAddressStr) {
          console.error("No shipping address in metadata");
          return;
        }

        // Parse shipping address
        let shippingAddress;
        try {
          shippingAddress = JSON.parse(shippingAddressStr);
        } catch (parseError) {
          console.error("Failed to parse shipping address:", parseError);
          return;
        }

        // Prevent duplicate order
        const existingOrder = await Order.findOne({
          paymentIntentId: paymentIntent.id,
        }).session(session);

        if (existingOrder) {
          return;
        }

        const user = await User.findById(userId).session(session);
        if (!user) {
          console.error("User not found:", userId);
          return;
        }
        // Fetch cart
        const cart = await Cart.findOne({ userId })
          .populate({
            path: "items.productId",
            select: "name price images stock",
          })
          .session(session);

        if (!cart || cart.items.length === 0) {
          console.error("Cart not found or empty");
          return;
        }

        const orderItems = cart.items
          .filter((item) => item.productId != null)
          .map((item) => {
            const prod = item.productId as any;
            return {
              productId: prod._id,
              name: prod.name || "Unknown Product",
              price: prod.price || 0,
              quantity: item.quantity,
              image: prod.images?.[0] || "",
            };
          });

        if (orderItems.length === 0) {
          throw new Error("No valid items in cart");
        }

        for (const item of cart.items) {
          const updated = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              stock: { $gte: item.quantity },
            },
            { $inc: { stock: -item.quantity } },
            { session, new: true }
          );

          if (!updated) {
            throw new Error(
              `Insufficient stock for product ${item.productId} (expected ${item.quantity})`
            );
          }
        }

        const order = await Order.create(
          [
            {
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
              orderStatus: "processing",
              paymentIntentId: paymentIntent.id,
            },
          ],
          { session }
        );

        await Cart.findByIdAndUpdate(
          cart._id,
          { $set: { items: [] } },
          { session }
        );
      });
    } catch (error: any) {
      console.error("Webhook transaction failed:", error.message);
      throw error;
    } finally {
      session.endSession();
    }
  }

  return res.status(200).json({ received: true });
};
