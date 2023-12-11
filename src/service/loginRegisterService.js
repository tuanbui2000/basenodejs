import bcrypt from "bcryptjs"
import { Op } from "sequelize";
import db from "../models/index"
import { getGroupWithRoles } from "./JWTService"
import { createJWT } from "../middleware/JWTAction"
require('dotenv').config()

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
    let hashPassword = bcrypt.hashSync(userPassword, salt)
    return hashPassword
}


const checkEmailExist = async (userEmail) => {
    let user = await db.User.findOne({
        where: { email: userEmail }
    })
    if (user) {
        return true
    }
    return false
}
const checkPhoneExist = async (userPhone) => {
    let user = await db.User.findOne({
        where: { phone: userPhone }
    })
    if (user) {
        return true
    }
    return false
}

const registerNewUser = async (rawUserData) => {

    try {


        //check user are exist
        let isEmailExist = await checkEmailExist(rawUserData.email)
        if (isEmailExist === true) {
            return {
                EM: "Email already exist",
                EC: 1
            }

        }
        let isPhoneExist = await checkPhoneExist(rawUserData.phone)
        if (isPhoneExist === true) {
            return {
                EM: "Phone number already exist",
                EC: 1
            }
        }

        //hash user password 
        let hashPassword = hashUserPassword(rawUserData.password)
        //create new user


        await db.User.create({
            email: rawUserData.email,
            phone: rawUserData.phone,
            username: rawUserData.username,
            password: hashPassword,
            groupId: 4
        })
    } catch (error) {
        console.log(error);
        return {
            EM: "somethings wrong in service",
            EC: 2
        }
    }

    return {
        EM: " User created successfully",
        EC: 0
    }
}


const checkPassword = (inputPassword, hashPassword) => {
    return bcrypt.compareSync(inputPassword, hashPassword);

}


const handleUserLogin = async (rawData) => {
    try {


        // console.log("check raw data", rawData)
        let user = await db.User.findOne({
            where: {
                [Op.or]: [
                    { email: rawData.valueLogin },
                    { phone: rawData.valueLogin }
                ]
            }
        })


        if (user) {
            let isCorrectPassword = checkPassword(rawData.password, user.password)
            if (isCorrectPassword === true) {

                let groupWithRoles = await getGroupWithRoles(user)

                let payload = {
                    email: user.email,
                    groupWithRoles,

                    username: user.username
                }
                let token = createJWT(payload)

                return {
                    EM: "Login successfully",
                    EC: 0,
                    DT: {
                        access_token: token,
                        groupWithRoles,
                        email: user.email,
                        username: user.username

                    }
                }
            }
        }
        console.log("User not found: ", rawData.valueLogin, "password: ", rawData.password);
        return {
            EM: "Phone number/email or password isn't correct",
            EC: 1,
            DT: ""
        }

    } catch (error) {
        console.log(error);
        return {
            EM: "somethings wrong in service",
            EC: 2,
            DT: ''
        }
    }

}

module.exports = {
    registerNewUser,
    handleUserLogin,
    hashUserPassword,
    checkEmailExist,
    checkPhoneExist

} 