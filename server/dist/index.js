"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const admin_1 = __importDefault(require("./routes/admin"));
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/admin", admin_1.default);
app.use("/users", user_1.default);
//connect to mongodb
//PLEASE DON'T MISUSE & REPLACE IT WITH YOUR OWN URL
mongoose_1.default.connect('mongodb+srv://snehaljaiswal2212:rwnAWKhrSYweu59q@cluster0.da8qxz7.mongodb.net/courses', { dbName: "courses" });
// mongoose.connect('mongodb://0.0.0.0:27017/courses', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" });
//mongoose.connect('mongodb://localhost:27017/courses', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" });
app.listen(3000, () => { console.log('listening to port 3000'); });
