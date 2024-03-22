
const {
    client,
    createTables,
    seeProducts,
    seeProduct,
    createUser,
    createCart,
    seeCart,
    createCartProduct,
    seeCartProducts,
    addProductToCart,
    deleteProductFromCart,
    changeQuantity,
    updateUser,
    deleteUser,
    seeUsers,
    createProduct,
    updateProduct,
    deleteProduct,
    authenticate,
    findUserWithToken
  } = require("./db");
  
  const express = require("express");
  const app = express();
  
  app.use(express.json());
  app.use(require("morgan")("dev"));
  

  const path = require('path');
  app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')));
  app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets'))); 
  

  const isLoggedIn = async (req, res, next) => {
    try {
      req.user = await findUserWithToken(req.headers.authorization);
      next();
    } catch (ex) {
      next(ex);
    }
  };
  
  const isAdmin = async (req, res, next) => {
    console.log("IsAdmin",req.user);
    if (!req.user.is_admin){
      res.status(400).send("Not admin");
    }
    next();
  };
 
  app.get("/api/products", async (req, res, next) => {
    try {
      res.send(await seeProducts());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/products/:productId", async (req, res, next) => {
    try {
      res.send(await seeProduct(req.params.productId));
    } catch (ex) {
      next(ex);
    }
  });
  
  
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      res.send(await createUser(req.body));
    } catch (ex) {
      next(ex);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      res.send(await authenticate(req.body));
    } catch (ex) {
      next(ex);
    }
  });

  app.get("/api/auth/me", isLoggedIn, (req, res, next) => {
    try {
      res.send(req.user);
    } catch (ex) {
      next(ex);
    }
  });

  app.get("/api/users/:id/cart", isLoggedIn, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.send(await seeCart(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/users/:id/cart/cartProducts", isLoggedIn, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      const cartId = await seeCart(req.params.id);
      const cartProducts = await seeCartProducts(cartId.id);
      res.status(201).send(cartProducts);
    } catch (ex) {
      next(ex);
    }
  });
  

  app.post("/api/users/:id/cart/cartProducts", isLoggedIn, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      const cartId = await seeCart(req.params.id);
      res.send(await addProductToCart({
        cart_id: cartId.id,
        product_id: req.body.product_id,
        quantity: req.body.quantity,
      }));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.put("/api/users/:id/cart/cartProducts/:cartProductId", isLoggedIn, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      const cartId = await seeCart(req.params.id);
      res.send(await changeQuantity({
        cart_id: cartId.id,
        product_id: req.params.cartProductId,
        quantity: req.body.quantity,
      }));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete("/api/users/:id/cart/cartProducts/:cartProductId", isLoggedIn, async (req, res, next) => {
      try {
        if (req.params.user_id !== req.user.id) {
          const error = Error("not authorized");
          error.status = 401;
          throw error;
        }
        const cartId = await seeCart(req.params.id);
        await deleteProductFromCart({ cart_id: cartId.id, product_id: req.params.cartProductId });
        res.sendStatus(204);
      } catch (ex) {
        next(ex);
      }
    }
  );
  

  app.put("/api/users/:id", isLoggedIn, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.status(201).send(await updateUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone_number: req.body.phone_number,
        id: req.params.id
      }));
    } catch (ex) {
      next(ex);
    }
  });
  
  
  app.delete("/api/users/:id", isLoggedIn, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      await deleteUser(req.params.id);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });

  app.get("/api/users/:id/products", isLoggedIn, isAdmin, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.send(await seeProducts());
    } catch (ex) {
      next(ex);
    }
  });

  app.post("/api/users/:id/products", isLoggedIn, isAdmin, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.status(201).send(await createProduct({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        inventory: req.body.inventory
      }));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.put("/api/users/:id/products/:productId", isLoggedIn, isAdmin, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.status(201).send(await updateProduct({
        id: req.params.productId,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        inventory: req.body.inventory
      }));
    } catch (ex) {
      next(ex);
    }
  });
  

  app.delete("/api/users/:id/products/:productId", isLoggedIn, isAdmin, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      await deleteProduct(req.params.productId);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });
  

  app.get("/api/users/:id/users", isLoggedIn, isAdmin, async (req, res, next) => {
    try {
      if (req.params.id !== req.user.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.send(await seeUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  const init = async () => {
    await client.connect();
    console.log("connected to database");
    await createTables();
    console.log("tables created");
    const [jack, lily, mark, Chesse, Milk, Apple] = await Promise.all([
      createUser({ email: "Neo@gmail.com", password: "admin123", is_admin: true}),
      createUser({ email: "Jorden@yahoo.com", password: "420smoker123"}),
      createUser({ email: "pinapple@hotmail.com", password: "fruits123"}),
      createProduct({
        name: "Milk",
        price: 5.99,
        description: "Whole Milk",
        inventory: 10,
      }),
      createProduct({
        name: "Chesse",
        price: 3.99,
        description: "Brie chesse",
        inventory: 3,
      }),
      createProduct({
        name: "Apple",
        price: 1.99,
        description: "Fiji Apple",
        inventory: 5,
      }),
    ]);
    const users = await seeUsers();
    console.log("Users: ", users);
    const products = await seeProducts();
    console.log("Products: ", products);
    const carts = await Promise.all([
      createCart({ user_id: Neo.id }),
      createCart({ user_id: Jorden.id }),
      createCart({ user_id: pinapple.id }),
    ]);
    console.log("Carts: ", carts);
  
    const productsInCart = await Promise.all([
      createCartProduct({
        cart_id: carts[0].id,
        product_id: Milk.id,
        quantity: 2,
      }),
      createCartProduct({
        cart_id: carts[0].id,
        product_id: Chesse.id,
        quantity: 1,
      }),
      createCartProduct({
        cart_id: carts[1].id,
        product_id: Apple.id,
        quantity: 2,
      }),
      createCartProduct({
        cart_id: carts[1].id,
        product_id: Apple.id,
        quantity: 4,
      }),
      createCartProduct({
        cart_id: carts[2].id,
        product_id: Apple.id,
        quantity: 4,
      }),
    ]);
  
    console.log(productsInCart);
  
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  };
  
  init();