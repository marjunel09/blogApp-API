const jwt = require("jsonwebtoken");
const secret = "InventoryManagement"

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		username: user.username,
		isAdmin: user.isAdmin,
	};

	return jwt.sign(data, secret, {});
};

module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);

	let token = req.headers.authorization;

	if (typeof token === "undefined") {
		return res.status(400).send({auth: "Failed. No Token"});
	} else {
		console.log(token);
		token = token.slice(7, token.length);
		console.log(token);

		jwt.verify(
			token,
			secret,
			function (err, decodedToken) {
				if (err) {
					return res.status(403).send({
						auth: "Failed",
						message: err.message,
					});
				} else {
					console.log("result from verify method:");
					console.log(decodedToken);

					req.user = {
						id: decodedToken.id,
						email: decodedToken.email,
						username: decodedToken.username,
						isAdmin: decodedToken.isAdmin,
					};

					next();
				}
			}
		);
	}
};

module.exports.verifyAdmin = (req, res, next) => {

	if(req.user.isAdmin) {

		next();

	} else {

		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}

module.exports.errorHandler = (err, req, res, next) => {
    console.error(err);

    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err); // Pass the error to the default Express error handler
    }

    const statusCode = err.status || 500;
    const errorMessage = err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || "SERVER ERROR",
            details: err.details || null,
        },
    });
};
