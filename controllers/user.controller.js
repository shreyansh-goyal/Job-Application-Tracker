const User = require('../db/models/user.schema');

const createUser = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({error:"All fields are required"});
        }
        else if(password.length < 6){
            return res.status(400).json({error:"Password must be at least 6 characters"});
        }

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({error:"User already exists"});
        }

        const user = await User.create({name, email, password});
        res.status(201).json(user);
    }catch(err){
        console.error("Error creating user: ", err);
        res.status(400).json({error: err.message});
    } 
}

module.exports = {
    createUser
}