const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
    // find all categories
    // be sure to include its associated Products
    Category.findAll({
        include: [
            {
                model: Product,
                attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
            },
        ],
    })
        .then((categoryData) => res.json(categoryData))
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id', (req, res) => {
    // find one category by its `id` value
    // be sure to include its associated Products
    Category.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: Product,
                attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
            },
        ],
    })
        .then((categoryData) => {
            if (!categoryData) {
                return res.status(404).json({ message: 'No category found with this id!' });
            }
            res.json(categoryData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/', (req, res) => {
    // create a new category
    Category.create(req.body)
        .then((category) => res.status(201).json(category))
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
});

router.put('/:id', (req, res) => {
    // update a category by its `id` value
    Category.update(req.body, {
        where: {
            id: req.params.id,
        },
    })
        .then((category) => {
            if (!category[0]) {
                return res.status(404).json({ message: 'No category found with this id!' });
            }
            res.json(category);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
});

router.delete('/:id', (req, res) => {
    // delete a category by its `id` value
    Category.destroy({
        where: {
            id: req.params.id,
        },
    })
        .then((deletedCategory) => {
            if (!deletedCategory) {
                return res.status(404).json({ message: 'No category found with this id!' });
            }
            res.json({ message: 'Category deleted successfully!' });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;
