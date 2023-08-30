import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Admin, Course } from '../db';
import { SECRET } from '../middleware/auth';
import { authenticateJwt } from '../middleware/auth';

const router = express.Router();

router.get("/me", authenticateJwt, async (req, res) => {
    const username = req.headers["user"];
    const admin = await Admin.findOne({username});
    if(!admin){
        res.status(403).json({message: "Admin doesn't exists"});
        return
    }
    res.json({
        username: username
    })
})

router.post("/signup", async (req, res) => {
    const {username, password} = req.body;

    const admin = await Admin.findOne({username});
    // function callback1(admin: typeof Admin){
        if(admin){
            console.log(admin);
            return res.status(403).json({message: 'Admin already exists'});
        } else{
            const obj = {username: username, password: password};
            const newAdmin = new Admin(obj);
            newAdmin.save();
            
            const token = jwt.sign({username, role: 'admin'}, SECRET, { expiresIn: '1h' });
            res.status(200).json({message: 'Admin created successfully', token});
        }
    // }

    // Admin.findOne({username}).then(callback1);
})

router.post("/login", async (req, res) => {
    const {username, password} = req.headers;
    const admin = await Admin.findOne({username, password});
    if(admin){
        console.log(admin);
        const token = jwt.sign({username, role: 'admin'}, SECRET, { expiresIn: '1h' });

        res.json({message: 'Logged in successfully', token});
    } else{
        res.status(403).json({message: 'Invalid username or password'});
    }
});

//create types for body
router.post("/courses", authenticateJwt, async (req, res) => {
    const course = new Course(req.body);
    await course.save();
    //console.log(course._id);
    const username = req.headers["user"];
    const admin = await Admin.findOne({username});
    if(admin) {
        admin.createdCourses.push(course._id);
        await admin.save();
        //console.log(admin);
    } else{
        res.status(403).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Course created successfully', courseId: course.id });
})

router.put("/courses/:courseId", authenticateJwt, async (req, res) => {
    const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {new: true});
    if(course){
        res.json({message: 'Course updated successfully'});
    } else{
        res.status(404).json({ message: 'Course not found' });
    }
});

router.get("/courses/", authenticateJwt, async (req, res) => {
    const courses = await Course.find({});
    res.json({courses});
})

router.get("/course/:courseId", authenticateJwt, async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    res.json({ course });
})

router.delete("/deletecourse/:courseId", authenticateJwt, async(req, res) => {
    const course = await Course.findByIdAndDelete(req.params.courseId);
    console.log(Course);
    if(course) {
        const username = req.headers["user"];
        const admin = await Admin.findOne({username});
        if(admin){
            const adminCourseIds = admin.createdCourses;
            const ObjectId = mongoose.Types.ObjectId;
            const course_Id = new ObjectId(req.params.courseId);
            const index = adminCourseIds.indexOf(course_Id);
            if(index > -1){
                admin.createdCourses.splice(index, 1);
                await admin.save();
            }
        } else{
            res.status(403).json({ message: 'Admin not found' });
        }
        // const user = await User.findOne({username: req.user.username});
        // if(user){
        //     const userCourseIds = user.purchasedCourses;
        //     const index = userCourseIds.indexOf(req.params.courseId);
        //     if(index > -1){
        //         user.purchasedCourses.splice(index, 1);
        //         await user.save();
        //     }
        // } else{
        //     res.status(403).json({ message: 'User not found' });
        // }
        res.json({message: 'Course deleted!!'})
    } else{
        res.status(404).json({ message: 'Course not found' });
    }
})

router.get('/createdCourses', authenticateJwt, async(req, res) => {
    const username = req.headers["user"];
    const admin = await Admin.findOne({username});

    if(admin) {
        res.json({createdCourses: admin.createdCourses || []});
    } else {
        res.status(403).json({ message: 'Admin not found' });
    }
})

export default router
