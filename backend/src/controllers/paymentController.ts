import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "../config/env";
import Product from "../models/productModel";
import User from "../models/userModel";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { cartItems, shippingAddress } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //Validate cart Items
    if (!cartItems || cartItems.length == 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Calculate total from server-side (don't trust client-ever).
    let subtotal = 0;
    const validatedItems = [];

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

      validatedItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    const shipping = 10.0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    if (total <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid total order" });
    }

    // find or create the strip customer
    let customer;
    if (user.stripeCustomerId) {
      //find the customer
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      //create the customer
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          clerkId: user.clerkId,
          userId: user._id.toString(),
        },
      });

      // add the stripe customer ID to the user object in the DB
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    }

    // Create paymenr intent

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        clerkId: user.clerkId,
        userId: user._id.toString(),
        orderItems: JSON.stringify(validatedItems),
        shippingAddress: JSON.stringify(shippingAddress),
        totalPrice: total.toFixed(2),
      },

      // in the webhook section, we use this metadata
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent: ", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
};
