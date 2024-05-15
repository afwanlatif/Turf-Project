const { RecordStatus } = require("../constants/index");
const { UserSchema } = require("../models/user.model");

// Add user
exports.addUser = (userData, actionBy, encryptPassword) => {
    return new Promise((resolve, reject) => {
        const user = new UserSchema({ ...userData, createdBy: actionBy, password: encryptPassword });
        user
            .save()
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};


// get all users
/**
 *
 * @param {Object} filters
 * @param {Object} options with a type {select:string , lean: boolean}
 * @returns
 */
exports.getUsers = (filters, options) => {
    return new Promise((resolve, reject) => {
        UserSchema.find(filters)
            .select(options?.select)
            .lean(options ? options.lean ?? false : false)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// delete user
exports.deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        UserSchema.findByIdAndUpdate(userId, { recStatus: RecordStatus.inactive })

            .then((user) => {
                resolve(user);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// update user
exports.updateUser = (userId, userData, actionBy) => {
    return new Promise(async (resolve, reject) => {
        try {
            let params = {
                ...userData,
                updatedBy: actionBy,
                updatedAt: new Date(),
            };
            await UserSchema.findOneAndUpdate({ _id: userId }, params);
            resolve();
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
};
