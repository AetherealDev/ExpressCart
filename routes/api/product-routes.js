const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');


// get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  Product.findAll({
    // attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
    include: [
      {
        model: Category,
        attributes: ["id", "category_name"],
      },
      {
        model: Tag,
        attributes: ["id", "tag_name"],
      },
    ],
  })
      .then((productData) => res.json(productData))
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data

  Product.findOne({
    where: { id: req.params.id },
    attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
    include: [
      {
        model: Category,
        attributes: ["id", "category_name"],
      },
      {
        model: Tag,
        attributes: ["id", "tag_name"],
      },
    ],
  })
      .then((productData) => res.json(productData))
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
      .then((product) => {
        // if there's product tags, we need to create pairings to bulk create in the ProductTag model
        if (req.body.tagIds.length) {
          // Create an array of objects containing product_id and tag_id pairs for bulk creation in ProductTag model
          const productTagIdArr = req.body.tagIds.map((tag_id) => {
            return {
              product_id: product.id,
              tag_id,
            };
          });
          return ProductTag.bulkCreate(productTagIdArr);
        }
        // if no product tags, just respond with the created product
        res.status(200).json(product);
      })
      .then((productTagIds) => res.status(200).json(productTagIds))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
      .then((product) => {
        if (req.body.tagIds && req.body.tagIds.length) {
          // Find all existing ProductTag entries for this product
          ProductTag.findAll({
            where: { product_id: req.params.id }
          })
              .then((productTags) => {
                // Create an array of existing tag_ids associated with the product
                const productTagIds = productTags.map(({ tag_id }) => tag_id);

                // Create an array of newProductTags with product_id and tag_id pairs for bulk creation in ProductTag model
                const newProductTags = req.body.tagIds
                    .filter((tag_id) => !productTagIds.includes(tag_id))
                    .map((tag_id) => {
                      return {
                        product_id: req.params.id,
                        tag_id,
                      };
                    });

                // Create an array of productTagIds to remove (not present in the updated request body)
                const productTagsToRemove = productTags
                    .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
                    .map(({ id }) => id);

                // Run both actions - Remove the old productTag entries and create new ones for the updated tags
                return Promise.all([
                  ProductTag.destroy({ where: { id: productTagsToRemove } }),
                  ProductTag.bulkCreate(newProductTags),
                ]);
              });
        }

        return res.json(product);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
      .then((deletedProduct) => {
        if (!deletedProduct) {
          return res.status(404).json({ message: "No product found with this id!" });
        }
        res.json({ message: "Product deleted successfully!" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
});

module.exports = router;
