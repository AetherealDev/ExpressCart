const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
    // find all tags
    // be sure to include its associated Product data
    Tag.findAll({
        include: [
            {
                model: Product,
                attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
                through: ProductTag,
            },
        ],
    })
        .then((tagData) => res.json(tagData))
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id', (req, res) => {
    // find a single tag by its `id`
    // be sure to include its associated Product data
    Tag.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: Product,
                attributes: ['id', 'product_name', 'price', 'stock', 'category_id'],
                through: ProductTag,
            },
        ],
    })
        .then((tagData) => {
            if (!tagData) {
                return res.status(404).json({ message: 'No tag found with this id!' });
            }
            res.json(tagData);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/', (req, res) => {
    // create a new tag
    Tag.create(req.body)
        .then((tag) => res.status(201).json(tag))
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
});

router.put('/:id', (req, res) => {
    // update a tag's name by its `id` value
    Tag.update(req.body, {
        where: {
            id: req.params.id,
        },
    })
        .then((tag) => {
            if (!tag[0]) {
                return res.status(404).json({ message: 'No tag found with this id!' });
            }
            res.json(tag);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
});

router.delete('/:id', (req, res) => {
    // delete a tag by its `id` value
    Tag.destroy({
        where: {
            id: req.params.id,
        },
    })
        .then((deletedTag) => {
            if (!deletedTag) {
                return res.status(404).json({ message: 'No tag found with this id!' });
            }
            res.json({ message: 'Tag deleted successfully!' });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

module.exports = router;
