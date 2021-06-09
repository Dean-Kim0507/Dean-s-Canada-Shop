const express = require('express');
const { now } = require('moment');
const router = express.Router();
const multer = require('multer');
const { Product } = require("../models/Product");
const { User } = require("../models/User");
const { auth } = require('../middleware/auth');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const { upload, deleteImg } = require('../middleware/multer')
const s3config = require('../config/s3')

//=================================
//             Product
//=================================


// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}_${file.originalname}`)
//     }
// })

// var upload = multer({ storage: storage }).single("file")

// router.post('/image', (req, res) => {

//     upload(req, res, err => {
//         if (err) {
//             return req.json({ success: false, err })
//         }
//         return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
//     })

// })

router.post('/image', upload.single('file'), (req, res) => {

    return res.json({ success: true, filePath: req.file.location, fileName: res.req.file.originalname })

})

router.post('/deleteimg', deleteImg, (req, res) => {

    return res.json({ success: true })

})



router.post('/', auth, (req, res) => {

    let type = req.body.type;
    if (type == 'NewProduct') {
        //Just Put all info into the DB
        const product = new Product(req.body)

        product.save((err) => {
            if (err) return res.status(400).json({ success: false, err })
            return res.status(200).json({ success: true })
        })
    } else {
        Product.findOneAndUpdate(
            { _id: req.body.productId },
            {
                $push: {
                    feedback: {
                        writer: req.user,
                        rating: req.body.stars,
                        text: req.body.feedback,
                        date: Date.now()
                    }
                }
            },
            { new: true },
            (err, product) => {
                if (err) return res.status(400).json({ success: false, err })
                if (product) res.status(200).send({ success: true, })
            }

        )
    }


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
        }
    }

    if (term) {
        //Search Function
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
        //Provide recent viewed posts and recent posts
    } else if (viewed) {
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, productInfo) => {
                if (err) return res.status(400).json({ success: false, err })
                if (req.body.user._id) {
                    // To get rescent views
                    User.findOne({ _id: req.body.user._id })
                        .exec((err, userInfo) => {
                            if (err) return res.status(400).json({ success: false, err })

                            // To search recently views, make a parameter
                            let recentlyViews = [];

                            //Make parameter to retrieve recently views
                            recentlyViews = userInfo.recentlyViewed.map(item => {
                                return item.id
                            })

                            Product.find({ _id: recentlyViews })
                                .populate("writer")
                                .exec((err, recentProductInfo) => {
                                    if (err) return res.status(400).json({ success: false, err })
                                    //Add clicked date to recentProductInfo
                                    recentProductInfo.forEach((posts, index) => {
                                        userInfo.recentlyViewed.forEach((rp, i) => {
                                            if (posts._id == rp.id) {
                                                recentProductInfo[index].date = rp.date
                                            }
                                        })
                                    })

                                    //Accending sorting
                                    recentProductInfo.sort(function (a, b) {
                                        return b['date'] - a['date'];
                                    });
                                    let recentProducts = [];
                                    //return only four recent viewed posts
                                    recentProductInfo.forEach((posts, index) => {
                                        if (index < 4) {
                                            recentProducts.push(posts)
                                        }
                                    })

                                    return res.status(200).json({
                                        success: true,
                                        productInfo,
                                        recentProductInfo: recentProducts,
                                        postSize: productInfo.length
                                    })
                                })
                        }
                        )
                }
                else {
                    return res.status(200).json({
                        success: true,
                        productInfo,
                        recentProductInfo: null,
                        postSize: productInfo.length
                    })
                }

            })
        //Filters
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


    if (type === "array") {
        //id=123123123,324234234,324234234 -> productIds = ['123123123', '324234234', '324234234'] 
        //Products information in Cart page
        let ids = req.query.id.split(',')
        productIds = ids.map(item => {
            return item
        })
        //When post several products to the client
        Product.find({ _id: { $in: productIds } })
            .populate('writer')
            .exec((err, product) => {
                if (err) return res.status(200).json({ success: false, err })
                return res.status(200).send(product)
            })
    }
    //A product information in Feedback page
    else if (type === "feedback") {
        Product.find({ _id: productIds })
            .populate('writer')
            .exec((err, product) => {
                if (err) return res.status(200).json({ success: false, err })
                return res.status(200).send(product)
            })
    }
    //A product information in detail page
    else {
        Product.findOneAndUpdate(
            { _id: { $in: productIds } },
            {
                $inc: {
                    'views': 1
                }
            },
            { new: true },
            (err, product) => {
                if (err) return res.status(400).send(err)
                if (type == 'single') {
                    if (req.query.userid != 'undefined') {
                        User.findOne({ _id: req.query.userid },
                            (err, userInfo) => {
                                let duplicate = false;
                                userInfo.recentlyViewed.forEach((item) => {
                                    if (item.id === productIds) {
                                        duplicate = true;
                                    }
                                })
                                if (duplicate) {
                                    //If user click the post thet user has seen, the date will just be updated
                                    User.findOneAndUpdate(
                                        { _id: req.query.userid, 'recentlyViewed.id': productIds },
                                        {
                                            $set: {
                                                'recentlyViewed.$.date': Date.now()
                                            }
                                        },
                                        { new: true },
                                        (err, userInfo) => {
                                            if (err) return res.status(200).json({ success: false, err })
                                            res.status(200).send(product)
                                        })
                                }
                                else {
                                    //If user click the post, 
                                    User.findOneAndUpdate(
                                        { _id: req.query.userid },
                                        {
                                            $push: {
                                                'recentlyViewed': { id: productIds, date: Date.now() }
                                            }
                                        },
                                        { new: true },
                                        (err, userInfo) => {
                                            if (err) return res.status(200).json({ success: false, err })
                                            res.status(200).send(product)
                                        })
                                }
                            })
                    }
                    else res.status(200).send(product)
                }
                else res.status(200).send(product)

            }).populate('writer')
    }
})


module.exports = router;
