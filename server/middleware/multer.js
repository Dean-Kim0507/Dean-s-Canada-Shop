const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
// aws.config.loadFromPath(__dirname + '/../config/s3.js');
const awsConfig = require('../config/s3')
const s3 = new aws.S3(awsConfig);
const upload =
	multer({
		storage: multerS3({
			s3: s3,
			bucket: 'dean-website/products',
			acl: 'public-read',
			key: function (req, file, cb) {
				// console.log('file', file)
				cb(null, Date.now() + '.' + file.originalname.split('.').pop());
			}
		})
	}, 'NONE');


async function deleteImg(req, res, next) {

	//Extract the image name
	let imgName = req.body.img.split('/').pop();

	const params = {
		Bucket: 'dean-website/products',
		Key: imgName
	}
	s3.deleteObject(params, function (err, data) {
		if (err) {
			console.log('Image delete error')
			console.log(err)
			return res.status(403).send(err)
		} else {
			console.log('Delete success')
		}
	})
	next()

}
module.exports = {
	upload,
	deleteImg
}