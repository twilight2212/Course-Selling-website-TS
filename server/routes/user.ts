import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { User, Admin, Course } from '../db';
import { SECRET } from '../middleware/auth';
import { authenticateJwt } from '../middleware/auth';

const router = express.Router();

router.get("/me", authenticateJwt, async (req, res) => {
    const username = req.headers["user"];
    const user = await User.findOne({username});
    if(!user){
        res.status(403).json({message: "User doesn't exists"});
        return;
    }
    res.json({
        username: username
    })
})

interface UserDetails {
    username: string;
    password: string;
}

router.post("/signup", async (req, res) => {
    const inputs: UserDetails = req.body;
    const user = await User.findOne({username: inputs.username});
    if(user){
        res.status(403).json({ message: 'User already exists' });
    } else{
        const newUser = new User({usernam: inputs.username, password: inputs.password});
        await newUser.save();
        const token = jwt.sign({username: inputs.username, role: 'user'}, SECRET, {expiresIn: '1h'});
        res.json({message: 'User created successfully', token});
    }
});

router.post("/login", async (req, res) => {
    const {username, password} = req.headers;
    const user = await User.findOne({username, password});
    if(user){
        const token = jwt.sign({username, role: 'user'}, SECRET, {expiresIn: '1h'});
        res.json({message: 'Logged in successfully', token});
    } else{
        res.status(403).json({message: 'Invalid username or password'});
    }
});

router.get("/courses", authenticateJwt, async (req, res) => {
    const courses = await Course.find({published: true});
    res.json({courses});
});

router.post("/courses/:courseId", authenticateJwt, async (req, res) => {
    const course_id = req.params.courseId;
    const course = await Course.findById(req.params.courseId);
    if(course){
        const username = req.headers["user"];
        const user = await User.findOne({username});
        if(user){
            const courseid = new mongoose.Types.ObjectId(course_id);
            const user_course = user.purchasedCourses.find(id => id == courseid);
            console.log(user_course);
            if(user_course){
                res.status(403).json({ message: 'You have already enrolled in this course!' });
                return;
            }
            user.purchasedCourses.push(course._id);
            await user.save();
            res.json({ message: 'Course purchased successfully' });
        } else{
            res.status(403).json({ message: 'User not found' });
        }
    } else{
        res.status(404).json({ message: 'Course not found' });
    }
});

router.get("/course/:courseId", authenticateJwt, async (req, res) => {
    const course = await Course.findById(req.params.courseId);

    if(course) {
        res.json({course});
    } else {
        res.status(403).json({message: 'Course not found'});
    }
})

router.get("/purchasedCourses", authenticateJwt, async (req, res) => {
    const username = req.headers["user"];
    const user = await User.findOne({ username});
    if(user){
        res.json({ purchasedCourses: user.purchasedCourses || [] });
    } else {
        res.status(403).json({ message: 'User not found' });
    }
})

export default router;
