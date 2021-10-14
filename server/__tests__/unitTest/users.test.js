const usersCon = require('../../controllers/users');
const userModel = require('../../models/User');
const httpMocks = require('node-mocks-http');
const redis = require("redis-mock"), client = redis.createClient();
const userInfo_db = require('../data/userInfo_db.json')
const userInfo_back = require('../data/userInfo_back.json')
const userInfo_login = require('../data/userInfo_login.json')
const redisFunc = require('../../config/redis')

//Model functions mocking
userModel.save = jest.fn();
userModel.findOne = jest.fn();
userModel.comparePassword = jest.fn();
userModel.generateToken = jest.fn();

let req, res, next;

beforeEach(() => {
	req = httpMocks.createRequest();
	res = httpMocks.createResponse();
	next = jest.fn();
	jest.useFakeTimers()
})

//Create Function Test
describe("Test the auth in the user controllers", () => {

	//Is the auth function?
	it("should have the auth funtcion", () => {
		expect(typeof usersCon.auth).toBe("function")
	})
	//Does the auth return the correct result with status code?
	it("should return brief user info and 200 response code", async () => {
		req.user = userInfo_db;
		usersCon.auth(req, res, next);
		expect(res.statusCode).toBe(200);
		//is end message called?
		expect(res._isEndCalled()).toBeTruthy();
		//is correct result sent?
		expect(res._getJSONData()).toStrictEqual(userInfo_back);
	})
	//Can the auth handle errors?
	it("should handle errors", async () => {
		const errMsg = "Cannot read property '_id' of undefined"
		usersCon.auth(req, res, next);
		expect(next).toBeCalledWith(errMsg);
	})
})


describe("register test", () => {
	it("should have a regiser funtcion", () => {
		expect(typeof usersCon.register).toBe("function")
	})

	it("should return success: true and 200 response code", async () => {

		await userModel.save.mockReturnValue(res.status(200).json({
			success: true
		}))
		usersCon.register(req, res, next);
		expect(res.statusCode).toBe(200);
		expect(res._getJSONData()).toStrictEqual({ success: true })
	})

	it("should handle errors", async () => {
		res.json({ success: false, err: "err" })
		// await userModel.save.mockReturnValue(errResult)
		usersCon.register(req, res, next);
		expect(res._getJSONData()).toStrictEqual({ success: false, err: "err" })
	})
})

//Login test
describe("Login Test", () => {
	it("should have a login funtcion", async () => {
		expect(typeof usersCon.login).toBe("function")
	})

	// it("should call user.findOne()", async () => {
	// 	req.body = userInfo_login;
	// 	await usersCon.login(req, res);
	// 	expect(userModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
	// })

	it("should return json body and reponse code 200", async () => {
		req.body = userInfo_back
		const returnPromise1 = Promise.resolve(null, userInfo_back)
		const returnPromise2 = Promise.resolve(null, true);
		const returnPromise3 = Promise.resolve(null, userInfo_back)
		await userModel.findOne.mockReturnValue(returnPromise1);
		await userModel.comparePassword.mockReturnValue(returnPromise2);
		await userModel.generateToken.mockReturnValue(returnPromise3);
		await usersCon.login(req, res);
		expect(res.statusCode).toBe(200);
		// expect(res._getJSONData()).toStrictEqual(userInfo_db);
		// expect(res._isEndCalled()).toBeTruthy();
	})
})