const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');

module.exports.registerUser = (req, res) => {
    if (!req.body.email.includes("@")) {
        return res.status(400).send({ message: 'Email invalid' });
    } else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters' });
    } else if (!req.body.username) {
        return res.status(400).send({ message: 'Username is required' });
    } else {
        let newUser = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            username: req.body.username,
            isAdmin: req.body.isAdmin || false, // Default to false if not provided
        });
        return newUser.save()
            .then((result) => res.status(201).send({
                message: 'User registered successfully',
                user: result
            }))
            .catch(error => errorHandler(error, req, res));
    }
}

module.exports.loginUser = (req, res) => {
    if (req.body.email.includes('@')) {
        return User.findOne({ email: req.body.email }).then(result => {
            if (result == null) {
                return res.status(404).send({ message: 'No email found' });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

                if (isPasswordCorrect) {
                    return res.status(200).send({
                        message: 'User logged in successfully',
                        access: auth.createAccessToken(result),
                        user: {  // Include user details
                            _id: result._id,
                            isAdmin: result.isAdmin
                        }
                    });
                } else {
                    return res.status(401).send({ message: 'Incorrect email or password' });
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    } else {
        return res.status(400).send({ message: 'Invalid email format' });
    }
}


module.exports.getProfile = (req, res) => {
    return User.findById(req.user.id).then(result => {
        result.password = "";
        return res.status(200).send(result);
    })
    .catch(error => errorHandler(error, req, res));
};
