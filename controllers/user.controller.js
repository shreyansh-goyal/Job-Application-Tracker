const User = require('../db/models/user.schema');

const createUser = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        const user = await User.create({name, email, password});
        console.log("User created: ", user);
        res.status(201).json(user);
    }catch(err){
        console.error("Error creating user: ", err);
        res.status(400).json({error: err.message});
    } 
}

module.exports = {
    createUser
}