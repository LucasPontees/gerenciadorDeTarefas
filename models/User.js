import { DataTypes } from "sequelize";

import db from '../db/conn.js'

const User = db.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

export default User;