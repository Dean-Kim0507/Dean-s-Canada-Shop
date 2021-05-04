const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require("../models/Product");
const { User } = require("../models/User");

//=================================
//             Product
//=================================


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})

var upload = multer({ storage: storage }).single("file")

router.post('/image', (req, res) => {

    //가져온 이미지를 저장을 해주면 된다.
    upload(req, res, err => {
        if (err) {
            return req.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })

})




router.post('/', (req, res) => {

    //받아온 정보들을 DB에 넣어 준다.
    const product = new Product(req.body)

    product.save((err) => {
        if (err) return res.status(400).json({ success: false, err })
        return res.status(200).json({ success: true })
    })

})



router.post('/products', (req, res) => {


    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    // product collection에 들어 있는 모든 상품 정보를 가져오기 
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let term = req.body.searchTerm
    let viewed = req.body.viewed;


    let findArgs = {};

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {

            console.log('key', key)
            //Object[] ->[]안에는 변수가 들어가고 이로인해 Object 안에 있는 property 호출
            //ex. args = { price: { '$gte': 200, '$lte': 249 } }
            if (key === "price") {
                findArgs[key] = {
                    //Greater than equal
                    $gte: req.body.filters[key][0],
                    //Less than equal
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }
            console.log('findArgs ', findArgs)
        }
    }


    if (term) {
        Product.find(findArgs)
            .find({ $text: { $search: term } }) //text 에 있는 search 기능
            .populate("writer") //writer collection 도 가져오기
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, productInfo) => {
                if (err) return res.status(400).json({ success: false, err })
                return res.status(200).json({
                    success: true, productInfo,
                    postSize: productInfo.length
                })
            })
    } else if (viewed) {
        console.log('user id: ', req.body.user)
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, productInfo) => {
                if (err) return res.status(400).json({ success: false, err })

                User.findOne({ _id: req.body.user._id }
                    , (err, userInfo) => {
                        if (err) return res.status(400).json({ success: false, err })

                        Product.find({ _id: userInfo.recentlyViewed })
                            .populate("writer")
                            .sort([[sortBy, order]])
                            .skip(0)
                            .limit(4)
                            .exec((err, recentProductInfo) => {
                                if (err) return res.status(400).json({ success: false, err })
                                return res.status(200).json({
                                    success: true,
                                    productInfo,
                                    recentProductInfo,
                                    postSize: productInfo.length
                                })
                            })
                    }
                )
            })
    } else {
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, productInfo) => {
                if (err) return res.status(400).json({ success: false, err })
                return res.status(200).json({
                    success: true, productInfo,
                    postSize: productInfo.length
                })
            })
    }

})


//id=123123123,324234234,324234234  type=array
router.get('/products_by_id', (req, res) => {
    //When you use post method, use req.body, When use query, use query.
    let type = req.query.type
    let productIds = req.query.id
    let userId = req.query.userid;

    if (type === "array") {
        //id=123123123,324234234,324234234 이거를 
        //productIds = ['123123123', '324234234', '324234234'] 이런식으로 바꿔주기
        let ids = req.query.id.split(',')
        productIds = ids.map(item => {
            return item
        })

    }

    //productId를 이용해서 DB에서  productId와 같은 상품의 정보를 가져온다.

    Product.find({ _id: { $in: productIds } }) //$in -> array where
        .populate('writer')
        .exec((err, product) => {
            if (err) return res.status(400).send(err)
            User.findOneAndUpdate(
                { _id: req.query.userid },
                { $addToSet: { 'recentlyViewed': productIds } },
                { new: true },
                (err, user) => {
                    if (err) return res.status(400).json({ success: false, err })
                    return res.status(200).send(product)
                }
            )

        })
})






module.exports = router;
