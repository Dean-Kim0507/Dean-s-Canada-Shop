const express = require('express');
const router = express.Router();
const { cache } = require('../middleware/auth');
const { upload, deleteImg } = require('../middleware/multer')
const productCon = require('../controllers/product')
//=================================
//             Product
//=================================

//======Multer=======
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}_${file.originalname}`)
//     }
// })

// let upload = multer({ storage: storage }).single("file")


// upload(Receive: image file / Return: success(boolean), file path and file name)
// router.post('/image', (req, res) => {

//     upload(req, res, err => {
//         if (err) {
//             return req.json({ success: false, err })
//         }
//         return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
//     })

// })


//======Multer S3=======
//upload(Receive: image file / Return: success(boolean), file location and file original name)
router.post('/image', upload.single('file'), productCon.image)

//upload(Receive: image file / Return: success(boolean))
router.post('/deleteimg', deleteImg, productCon.deleteimg)

//Upload Product (Receive: Product info / Return: success true)
// Store produt info to the DB or Push feedback to the exist product collections
router.post('/', cache(1), productCon.newProduct)

//Return all products info in the product collection (Receive : product info, searcherm and filter info / Returns: Success(boolean) with product info(recently viewed)))
router.post('/products', productCon.products)

// Search (a) product(s) by id (Receive: type(array: over two products, feedback:return feedback only, single: a product info ), product id / Return: product info or feedback(s) )
//id=123123123,324234234,324234234  type=array
router.get('/products_by_id', productCon.products_by_id)

module.exports = router;
