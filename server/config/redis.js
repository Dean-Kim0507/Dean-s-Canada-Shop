const redis = require("redis");

const redis_client = redis.createClient({
	host: "redis-server",
	port: 6379
})

redis_client.on('error', err => {
	console.log('Error ' + err);
});

const cachingAllData = (user) => {
	//Make objects to be stored to Redis
	const userData = {
		_id: user._id,
		isAdmin: user.role === 1 ? false : true,
		isAuth: true,
		email: user.email,
		name: user.name,
		lastname: user.lastname,
		role: user.role,
		image: user.image,
	}
	const cartData = {
		cart: user.cart,
		history: user.history,
	}
	const tokenData = {
		token: user.token,
		tokenExp: user.tokenExp,
	}
	//Store to Redis
	redis_client.hmset(
		'data', 'userData', JSON.stringify(userData),
		'cartData', JSON.stringify(cartData),
		'tokenData', JSON.stringify(tokenData)
	);
}

const cachingCartData = (userInfo) => {
	const cartData = {
		cart: userInfo.cart,
		history: userInfo.history,
	}
	redis_client.hmset(
		'data', 'cartData', JSON.stringify(cartData)
	);
}

const cachingTokenData = (user) => {
	const tokenData = {
		token: user.token,
		tokenExp: user.tokenExp,
	}
	redis_client.hmset(
		'data', 'tokenData', JSON.stringify(tokenData)
	);
}


module.exports = { redis_client, cachingAllData, cachingCartData, cachingTokenData }