"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/me", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.headers["user"];
    const admin = yield db_1.Admin.findOne({ username });
    if (!admin) {
        res.status(403).json({ message: "Admin doesn't exists" });
        return;
    }
    res.json({
        username: username
    });
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const admin = yield db_1.Admin.findOne({ username });
    // function callback1(admin: typeof Admin){
    if (admin) {
        console.log(admin);
        return res.status(403).json({ message: 'Admin already exists' });
    }
    else {
        const obj = { username: username, password: password };
        const newAdmin = new db_1.Admin(obj);
        newAdmin.save();
        const token = jsonwebtoken_1.default.sign({ username, role: 'admin' }, auth_1.SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Admin created successfully', token });
    }
    // }
    // Admin.findOne({username}).then(callback1);
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.headers;
    const admin = yield db_1.Admin.findOne({ username, password });
    if (admin) {
        console.log(admin);
        const token = jsonwebtoken_1.default.sign({ username, role: 'admin' }, auth_1.SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    }
    else {
        res.status(403).json({ message: 'Invalid username or password' });
    }
}));
//create types for body
router.post("/courses", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = new db_1.Course(req.body);
    yield course.save();
    //console.log(course._id);
    const username = req.headers["user"];
    const admin = yield db_1.Admin.findOne({ username });
    if (admin) {
        admin.createdCourses.push(course._id);
        yield admin.save();
        //console.log(admin);
    }
    else {
        res.status(403).json({ message: 'Admin not found' });
    }
    res.json({ message: 'Course created successfully', courseId: course.id });
}));
router.put("/courses/:courseId", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield db_1.Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
    if (course) {
        res.json({ message: 'Course updated successfully' });
    }
    else {
        res.status(404).json({ message: 'Course not found' });
    }
}));
router.get("/courses/", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield db_1.Course.find({});
    res.json({ courses });
}));
router.get("/course/:courseId", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield db_1.Course.findById(req.params.courseId);
    res.json({ course });
}));
router.delete("/deletecourse/:courseId", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield db_1.Course.findByIdAndDelete(req.params.courseId);
    console.log(db_1.Course);
    if (course) {
        const username = req.headers["user"];
        const admin = yield db_1.Admin.findOne({ username });
        if (admin) {
            const adminCourseIds = admin.createdCourses;
            const ObjectId = mongoose_1.default.Types.ObjectId;
            const course_Id = new ObjectId(req.params.courseId);
            const index = adminCourseIds.indexOf(course_Id);
            if (index > -1) {
                admin.createdCourses.splice(index, 1);
                yield admin.save();
            }
        }
        else {
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
        res.json({ message: 'Course deleted!!' });
    }
    else {
        res.status(404).json({ message: 'Course not found' });
    }
}));
router.get('/createdCourses', auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.headers["user"];
    const admin = yield db_1.Admin.findOne({ username });
    if (admin) {
        res.json({ createdCourses: admin.createdCourses || [] });
    }
    else {
        res.status(403).json({ message: 'Admin not found' });
    }
}));
exports.default = router;
