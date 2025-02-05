const express = require('express')
const User = require('../model/userSchema')
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config()


// sign up post 
router.post('/signup', async(req,res)=>{
    console.log("heeeeeelo")
    const {userName, password} = req.body
    try{
        const newUser = await User.create({userName, password})
        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET, {expiresIn: "1 Hr"})
        res.json({ message: "User created successfully", token});
    } catch (error) {
        res.status(400).json({ error: "Username already exists" });
    }
})

// login post 
router.post('/login', async (req,res)=>{
    const {userName} = req.body
    try{
        const found = await User.findOne({ userName });
    if(!found){
        return res.status(401).json(`${userName} doesn't exist or invalid credentials`)
    }

    const token = jwt.sign({ id: found._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Welcome!", token });
    } catch(e){
        res.status(500).json({error: "Internal Error"})
    }
})

module.exports = router;