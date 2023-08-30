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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/me", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.headers["user"];
    const user = yield db_1.User.findOne({ username });
    if (!user) {
        res.status(403).json({ message: "User doesn't exists" });
        return;
    }
    res.json({
        username: username
    });
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const inputs = req.body;
    const user = yield db_1.User.findOne({ username: inputs.username });
    if (user) {
        res.status(403).json({ message: 'User already exists' });
    }
    else {
        const newUser = new db_1.User({ usernam: inputs.username, password: inputs.password });
        yield newUser.save();
        const token = jsonwebtoken_1.default.sign({ username: inputs.username, role: 'user' }, auth_1.SECRET, { expiresIn: '1h' });
        res.json({ message: 'User created successfully', token });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.headers;
    const user = yield db_1.User.findOne({ username, password });
    if (user) {
        const token = jsonwebtoken_1.default.sign({ username, role: 'user' }, auth_1.SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    }
    else {
        res.status(403).json({ message: 'Invalid username or password' });
    }
}));
router.get("/courses", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield db_1.Course.find({ published: true });
    res.json({ courses });
}));
router.post("/courses/:courseId", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course_id = req.params.courseId;
    const course = yield db_1.Course.findById(req.params.courseId);
    if (course) {
        const username = req.headers["user"];
        const user = yield db_1.User.findOne({ username });
        if (user) {
            const courseid = new mongoose_1.default.Types.ObjectId(course_id);
            const user_course = user.purchasedCourses.find(id => id == courseid);
            console.log(user_course);
            if (user_course) {
                res.status(403).json({ message: 'You have already enrolled in this course!' });
                return;
            }
            user.purchasedCourses.push(course._id);
            yield user.save();
            res.json({ message: 'Course purchased successfully' });
        }
        else {
            res.status(403).json({ message: 'User not found' });
        }
    }
    else {
        res.status(404).json({ message: 'Course not found' });
    }
}));
router.get("/course/:courseId", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield db_1.Course.findById(req.params.courseId);
    if (course) {
        res.json({ course });
    }
    else {
        res.status(403).json({ message: 'Course not found' });
    }
}));
router.get("/purchasedCourses", auth_2.authenticateJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.headers["user"];
    const user = yield db_1.User.findOne({ username });
    if (user) {
        res.json({ purchasedCourses: user.purchasedCourses || [] });
    }
    else {
        res.status(403).json({ message: 'User not found' });
    }
}));
exports.default = router;
