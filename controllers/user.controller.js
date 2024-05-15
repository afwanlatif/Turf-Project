const userdb = require("../database/user.db");
const { status, systemUser } = require("../constants");
const { message } = require('../constants/messages.constant');
const { updateFilters, FiltersMeta } = require('../helpers/filter.helper');
const { getSelectString, SelectMeta } = require("../helpers/dbselect.helper");
const { responseStructure: rs } = require("../helpers/response.helper");
const { getCleanObject, getPayload } = require('../helpers/index.helper');
const { encryptString, matchText, decryptString } = require("../helpers/security");
const { jwt_key } = require("../config/env.config");
const { encryption_key } = require("../config/env.config");
const jwt = require("jsonwebtoken");
const {
    isRequestBodyForAddRecordValid,
    isRequestBodyForUpdateRecordValid,
    getObjectWithValidFields
} = require("../helpers/validation.helper");
const { UserSchema } = require("../models/user.model");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   security:
 *     - bearerAuth: [] 
 *   schemas:
 *     User: 
 *       type: object
 *       required: 
 *         - fullName
 *         - gender
 *         - phoneNumber
 *         - email
 *         - password
 *       properties: 
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         fullName:
 *           type: string
 *           description: User name
 *         gender:
 *           type: string
 *           description: Gender of the user
 *         email:
 *           type: string
 *           description: Email of the user (unique for every user)
 *         password:
 *           type: string
 *           description: Encrypted password of the user
 *         phoneNumber:
 *           type: string
 *           description: Phone number of the user
 *         userType:
 *           type: string
 *           description: Type of user on the platform
 * 
 *       example: 
 *             _id: ua2uy6sd3ty6ua6sd675a76s5
 *             fullName: Mohammad Adnaniiii
 *             gender: Male
 *             email: mohammadadnan@gmail.com
 *             phoneNumber: "9874563524"
 *             password: broadstairs@123
 *             userType: user
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: email of the user
 *         password:
 *           type: string
 *           description: User password
 * 
 *   responses:
 *    UnauthorizedError:
 *     description: Access token is missing or invalid
 *     schema:
 *        status: number
 *        message: string
 *     example:
 *        status: 401
 *        message: Unauthorized access.
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The user managing API
 */

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Adds user to the portal
 *     tags: [User]
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       description: Required data to add a user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User' 
 *           example: 
 *             fullName: afwan bhaiji
 *             email: afwan@gmail.com
 *             password: broadstairs123
 *             phoneNumber: "9874563524"
 *             gender: Male
 *             userType: user
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError' 
 *       201:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example: 
 *               status: 201
 *               message: User added successfully
 */


// Add user
exports.addUser = async (req, res) => {
    const jsonData = req.body;
    const decoded = getPayload(req);
    const encryptPassword = encryptString(req.body.password)

    const { isValid, missingFields, validFields } =
        isRequestBodyForAddRecordValid(jsonData, UserSchema.schema);
    if (!isValid) {
        return res
            .status(status.badRequest)
            .send(rs(status.badRequest, message.missingFields, { missingFields }));
    }

    const validObject = getObjectWithValidFields(jsonData, validFields);
    userdb
        .addUser(validObject, decoded.email, encryptPassword)
        .then((response) => {
            res
                .status(status.createdSuccess)
                .send(rs(status.createdSuccess, message.addUserSuccess, response));
        })
        .catch((error) => {
            console.log(error);
            res
                .status(status.failure)
                .send(rs(status.failure, message.addUserError, error));
        });
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users data
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Record status active ,inactive, all, by default it is active
 *       - in: query
 *         name: type
 *         description: user type
 *       - in: query
 *         name: gender
 *         description: Gender of the user
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               status: 200
 *               message: All users data fetched successfully
 */

// get all users
exports.getUsers = (req, res) => {
    let queryParams = req.query;
    updateFilters(queryParams, FiltersMeta.users);
    const selectString = getSelectString(SelectMeta.default, SelectMeta.users);
    userdb
        .getUsers(queryParams, { select: selectString })
        .then((users) => {
            res
                .status(status.success)
                .send(rs(status.success, message.getAllUsers, users));
        })
        .catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get single user data
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The ID of the user to fetch
 *         required: true
 *         schema:
 *           type: string
 *           example: 857698dn5gj6dnf0hdg4rhb
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               status: 200
 *               message: Single user data fetched successfully
 */

// Get single user data
exports.singleUser = (req, res) => {
    let userId = req.params.id;

    if (!userId) {
        return res
            .status(status.badRequest)
            .send(rs(status.badRequest, message.noUniqueId));
    }

    const selectString = getSelectString(SelectMeta.default, SelectMeta.users);
    userdb
        .getUsers({ _id: userId }, { select: selectString })
        .then((users) => {
            if (users.length > 0) {
                console.log(users);
                res
                    .status(status.success)
                    .send(rs(status.success, message.singleStudent, users[0]));
            } else {
                res
                    .status(status.success)
                    .send(rs(status.noRecords, message.noRecords));
            }
        })
        .catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user data
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The ID of the user to delete
 *         required: true
 *         schema:
 *           type: string
 *           example: 857698dn3gjd33nf0hd4gr7hb56
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               status: 200
 *               message: User delete successfully
 */

// delete user
exports.deleteUser = (req, res) => {
    let userId = req.params.id;
    if (!userId) {
        return res
            .status(status.badRequest)
            .send(rs(status.badRequest, message.noUniqueId));
    }
    userdb
        .deleteUser(userId)
        .then((response) => {
            res
                .status(status.success)
                .send(rs(status.success, message.deleteUser, response));
        })
        .catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: User update to the portal
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Required data has to be given to update user.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           example:
 *             _id: "65d59ce64af3df2c810a4e11"
 *             fullName: afwan bhaiji
 *             gender: Male
 *             email: afwan@gmail.com
 *             phoneNumber: "9874563524"
 *             password: broadstairs@123
 *             userType: user
 *     responses:
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/UnauthorizedError'
 *       '201':
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *             example:
 *               status: 200
 *               message: User update successfully
 */

// update user
exports.updateUser = async (req, res) => {
    const decoded = getPayload(req);
    const jsonData = req.body;
    const userId = jsonData._id;
    const { isValid, validFields } = isRequestBodyForUpdateRecordValid(
        jsonData,
        UserSchema.schema
    );
    if (!isValid) {
        return res
            .status(status.badRequest)
            .send(rs(status.badRequest, message.noUpdateFields));
    }
    const validObject = getObjectWithValidFields(jsonData, validFields);
    userdb
        .updateUser(userId, validObject, decoded.email)
        .then((response) => {
            res.status(status.success).send(rs(status.success, message.userUpdate));
        })
        .catch((error) => {
            res
                .status(status.failure)
                .send(rs(status.failure, message.internalServerError, error));
        });
};

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentic user for the portal
 *     tags: [User]
 *     requestBody:
 *       description: Required data has to be given to login user.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *           example:
 *             email: afwan121@gmail.com
 *             password: broadstairs123
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               status:
 *                  type: integer
 *               message:
 *                  type: string
 *               accessToken:
 *                  type: string
 *             example:
 *                  status: 200
 *                  message: User authenticated
 *                  accessToken: d4qu7wfe23r762537ra8fsj9dhfay5sd76as4f657a4s6d54as5d
 *
 */

// Login user

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const inputPassword = req.body.password;
    if (!email && !password) {
        return res
            .status(status.success)
            .send(rs(status.unauthorized, message.unauthorized));
    }
    try {
        const users = await userdb.getUsers({ email: email }, { lean: true }, inputPassword);
        if (users.length > 0) {
            const user = users[0];
            if (matchText(inputPassword, user.password)) {
                const accessToken = jwt.sign(
                    getCleanObject(user, SelectMeta.default, SelectMeta.users),
                    jwt_key,
                    {
                        expiresIn: "24hr",
                    }
                );

                const refreshToken = jwt.sign(
                    getCleanObject(user, SelectMeta.default, SelectMeta.users),
                    jwt_key,
                    {
                        expiresIn: "7d",
                    }
                );

                res.status(status.success).send(
                    rs(status.success, "User authenticated", {
                        accessToken,
                        refreshToken,
                    })
                );
            } else {
                res
                    .status(status.unauthorized)
                    .send(rs(status.unauthorized, "User not authenticated"));
            }
        } else {
            res.status(status.success).send(rs(status.noRecords, message.noRecords));
        }
    } catch (error) {
        console.log(error);
        res
            .status(status.failure)
            .send(rs(status.failure, message.addUserError, error));
    }
};


/**
 * @swagger
 * /refreshToken:
 *   post:
 *     summary: Get updated JWT token for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Success message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               status:
 *                  type: integer
 *               message:
 *                  type: string
 *               accessToken:
 *                  type: string
 *             example:
 *                  status: 200
 *                  message: User authenticated
 *                  accessToken: kaj7sgd0a8s76d76a4s56d4qu8wfe23r762537rafsjdhfay5sd76as4f65drguisdhkugft7a4s6d54as5d
 *
 */

// Login user
exports.refreshToken = async (req, res) => {
    const tokenString = req.get("Authorization");
    try {
        const parts = tokenString.split(" ");
        const token = parts[1];
        if (!token) {
            return res
                .status(status.success)
                .send(rs(status.unauthorized, message.unauthorized));
        }

        let user = jwt.verify(token, jwt_key);
        delete user.iat;
        delete user.exp;
        const accessToken = jwt.sign(user, jwt_key, {
            expiresIn: "24hr",
        });

        const refreshToken = jwt.sign(user, jwt_key, {
            expiresIn: "7d",
        });

        res.status(status.success).send(
            rs(status.success, "User authenticated", {
                accessToken,
                refreshToken,
            })
        );
    } catch (error) {
        res
            .status(status.failure)
            .send(rs(status.failure, message.internalServerError, error));
    }
};