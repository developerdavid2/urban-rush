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
  const session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const { cartItems, shippingAddress } = req.body;
      const user = req.user;

      if (!user) {
        throw new Error("Unauthorized");
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      if (!shippingAddress) {
        throw new Error("Shipping address is required");
      }

      // 1. Validate products & calculate total
      let subtotal = 0;
      const validatedItems = [];

      for (const item of cartItems) {
        const product = await Product.findById(item.product._id).session(
          session
        );

        if (!product) {
          throw new Error(`Product ${item.product.name} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        validatedItems.push({
          product,
          quantity: item.quantity,
        });

        subtotal += product.price * item.quantity;
      }

      const shipping = 10.0;
      const tax = subtotal * 0.08;
      const total = subtotal + shipping + tax;

      // 2. Decrement stock immediately (prevents overselling during checkout)
      for (const item of validatedItems) {
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.product._id,
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        if (!updated) {
          throw new Error(
            `Insufficient stock for ${item.product.name} (race condition)`
          );
        }
      }

      // 3. Find or create Stripe customer
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
        await User.findByIdAndUpdate(
          user._id,
          { stripeCustomerId: customerId },
          { session }
        );
      }

      // 4. Create Order with PENDING status
      const orderItems = validatedItems.map((item) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || "",
      }));

      const [order] = await Order.create(
        [
          {
            userId: user._id,
            clerkId: user.clerkId,
            items: orderItems,
            totalAmount: total,
            shippingAddress: {
              fullName: shippingAddress.fullName,
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.state,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              phoneNumber: shippingAddress.phoneNumber,
            },
            paymentStatus: "pending",
            orderStatus: "pending",
          },
        ],
        { session }
      );

      // 5. Create PaymentIntent with orderId in metadata
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "usd",
        customer: customerId,
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order._id.toString(),
          userId: user._id.toString(),
          clerkId: user.clerkId,
        },
        description: `Order #${order._id} for ${user.name} - $${total.toFixed(
          2
        )}`,
      });

      // 6. Update order with paymentIntentId
      order.paymentIntentId = paymentIntent.id;
      await order.save({ session });

      // 7. Clear cart
      await Cart.findOneAndUpdate(
        { userId: user._id },
        { $set: { items: [] } },
        { session }
      );

      return {
        clientSecret: paymentIntent.client_secret,
        orderId: order._id.toString(),
      };
    });

    res.status(200).json({
      success: true,
      clientSecret: result.clientSecret,
      orderId: result.orderId,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);

    // Provide specific error messages
    const statusCode =
      error.message === "Unauthorized"
        ? 401
        : error.message === "Cart is empty" ||
          error.message === "Shipping address is required"
        ? 400
        : error.message.includes("not found")
        ? 404
        : error.message.includes("Insufficient stock")
        ? 400
        : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create payment intent",
    });
  } finally {
    session.endSession();
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

    try {
      const order = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (!order) {
        console.error(`Order not found for PaymentIntent: ${paymentIntent.id}`);
        return res.status(200).json({ received: true });
      }

      // Prevent duplicate processing
      if (order.paymentStatus === "paid") {
        return res.status(200).json({ received: true });
      }

      // Update order to PAID
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save();
    } catch (error: any) {
      console.error("Error processing payment_intent.succeeded:", error);
      return res.status(200).json({ received: true, error: error.message });
    }
  }

  // Handle failed payment
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const order = await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: "failed" },
        { new: true }
      );

      if (order) {
        console.error(` Order ${order._id} payment failed`);
      }
    } catch (error: any) {
      console.error("Error processing payment_intent.payment_failed:", error);
    }
  }

  // Handle cancelled payment intent
  if (event.type === "payment_intent.canceled") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const order = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (order && order.paymentStatus === "pending") {
        // Optionally restore stock when payment is explicitly cancelled
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(
              item.productId,
              { $inc: { stock: item.quantity } },
              { session }
            );
          }

          order.orderStatus = "cancelled";
          order.cancelledAt = new Date();
          await order.save({ session });
        });
        session.endSession();

        console.log(` Order ${order._id} cancelled, stock restored`);
      }
    } catch (error: any) {
      console.error("Error processing payment_intent.canceled:", error);
    }
  }

  return res.status(200).json({ received: true });
};

export const cleanupStaleOrders = async () => {
  const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const staleOrders = await Order.find({
        paymentStatus: "pending",
        orderStatus: "pending",
        createdAt: { $lt: ONE_HOUR_AGO },
      }).session(session);

      console.log(`Found ${staleOrders.length} stale orders to cleanup`);

      for (const order of staleOrders) {
        // Restore stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }

        // Mark as cancelled
        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
        await order.save({ session });

        console.log(`🧹 Cleaned up stale order ${order._id}`);
      }
    });
  } catch (error) {
    console.error("Error cleaning up stale orders:", error);
    throw error;
  } finally {
    session.endSession();
  }
};
