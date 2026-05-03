const express = require("express");
const crypto = require("crypto");
const Users = require("./user.model");

const app = express.Router();

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => ({
    salt,
    passwordHash: crypto.scryptSync(password, salt, 64).toString("hex"),
});

const isPasswordValid = (password, user) => {
    if (!password || !user?.passwordHash || !user?.passwordSalt) {
        return false;
    }

    const suppliedHash = crypto.scryptSync(password, user.passwordSalt, 64);
    const storedHash = Buffer.from(user.passwordHash, "hex");

    return storedHash.length === suppliedHash.length && crypto.timingSafeEqual(storedHash, suppliedHash);
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Login user with mobile number and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       404:
 *         description: Error logging in
 */
app.post("/login",async(req,res)=>{
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).send({ message: "Mobile and password are required" });
    }

    try {
      let user = await Users.findOne({ mobile });
  
      if (!user || !isPasswordValid(password, user)) {
        return res.status(401).send({ message: "Invalid mobile number or password" });
      }

        res.send({
          token: `${user.id}`,
        });
    } catch (e) {
      res.status(404).send(e.message);
    }
})

/**
 * @swagger
 * /auth/singleuser:
 *   post:
 *     summary: Get single user details
 *     description: Get user information by user ID/token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "60d5ec49c1234567890abcde"
 *     responses:
 *       200:
 *         description: User details retrieved
 *       404:
 *         description: User not found
 */
app.post("/singleuser",async(req,res)=>{
    const {id} = req.body;
    try {
        let user = await Users.findById({"_id":id}).select("-passwordHash -passwordSalt");
        if(user?.id){
            res.send(user);
        }else{
            res.status(404).send({message:"Please enter correct token "}) 
        }
    } catch (error) {
        res.status(404).send({message:"Please enter correct token "})
    }
})

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User registration
 *     description: Create a new user account
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "secret123"
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: User with email already exists
 */
app.post("/signup",async(req,res)=>{
    const {name,email,mobile,password} = req.body;

    if (!name || !email || !mobile || !password) {
        return res.status(400).send({ message: "Name, email, mobile, and password are required" });
    }

    let existingUser = await Users.findOne({ $or: [{ email }, { mobile }] });
    if(existingUser){
        res.status(400).send({message:"Cannot create user with existing email or mobile"})
    }else{
        try {
            const { passwordHash, salt: passwordSalt } = hashPassword(password);
            let user = await Users.create({
                name,email,mobile,passwordHash,passwordSalt
            })
            res.send({token:`${user.id}`,message:"Signup Successfull"});
        } catch (e) {
            if (e.code === 11000) {
                return res.status(400).send({ message: "Email or mobile already exists" });
            }
            res.status(404).send(e.message);
        }
    }
   
})

module.exports = app;
