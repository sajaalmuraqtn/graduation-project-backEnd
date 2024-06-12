import CartModel from "../../../../DB/model/cart.model.js";
import ProductModel from "../../../../DB/model/product.model.js";

export const createCart = async (req, res, next) => {
    const products = req.body; // new product that we want to add
    const product = await ProductModel.findById(products.productId); // product information from product model

    if (!product) {
        return next(new Error("Product not found", { cause: 404 }));
    }

    let price = product.finalPrice;
    let quantity = 1; // Default quantity is 1

    // Check if quantity is provided and is a valid number
    if (products.quantity && !isNaN(products.quantity)) {
        quantity = parseInt(products.quantity);
        price =price* quantity;
    }

    // Create cart item object
    const cartItem = {
        productId: product._id,
        quantity: quantity,
        price: price,
        mainImage: product.mainImage,
        productName: product.name,
        productSlug: product.slug
    };

    const cart = await CartModel.findOne({ userId: req.user._id });

    if (!cart) {
        const newCart = await CartModel.create({
            userId: req.user._id,
            products: [cartItem], // Store cart item in an array
            totalPrice: price
        });
        return res.status(201).json({ message: 'success', cart: newCart });
    }

    let matched = false;

    // Check if the product already exists in the cart
    for (let index = 0; index < cart.products.length; index++) {
        if (cart.products[index].productId == products.productId) {
            cart.products[index].quantity = quantity;
            cart.products[index].price =price
            matched = true;
            break;
        }
    }

    // If the product is not found in the cart, add it
    if (!matched) {
        cart.products.push(cartItem);
    }

    // Recalculate total price
    let totalPrice = 0;
    for (let index = 0; index < cart.products.length; index++) {
        totalPrice += cart.products[index].price;
    }
    cart.totalPrice = totalPrice;

    await cart.save();
    return res.status(201).json({ message: 'success', cart });
}


export const removeItem = async (req, res, next) => {
    const { productId } = req.body;
    const cart = await CartModel.findOneAndUpdate({ userId: req.user._id }, {
        $pull:
        {
            products: { productId }
        },
    }, { new: true });
    let totalPrice = 0;
    for (let index = 0; index < cart.products.length; index++) {
        totalPrice = totalPrice + cart.products[index].price;
    }
    cart.totalPrice = totalPrice;
    await cart.save();

    return res.status(201).json({ message: 'success', cart });
}

export const clearCart = async (req, res, next) => {
    const cart = await CartModel.findOneAndUpdate({ userId: req.user._id }, { products: [] });
     cart.totalPrice = 0;
    await cart.save();

    return res.status(200).json({ message: 'success', cart });
}

export const getCart = async (req, res, next) => {
    const cart = await CartModel.findOne({ userId: req.user._id });
    if (!cart) {
        return next(new Error("you do not have a cart yet", { cause: 404 }));
    }
    return res.status(201).json({ message: 'success', cart });
}


