const router = require('express').Router();
const upload = require('../middleware/upload');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { getProducts, addProduct, updateProduct, deleteProduct } = require('../controllers/productController');

router.get('/', verifyToken, getProducts);
router.post('/', verifyToken, isAdmin, upload.single('image'), addProduct);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
