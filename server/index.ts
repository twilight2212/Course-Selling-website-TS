import express from 'express';
import mongoose from 'mongoose';
import  cors from 'cors';
import adminRouter from "./routes/admin";
import userRoute from "./routes/user";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/admin", adminRouter);
app.use("/users", userRoute);

//connect to mongodb
//PLEASE DON'T MISUSE & REPLACE IT WITH YOUR OWN URL
mongoose.connect('mongodb+srv://snehaljaiswal2212:rwnAWKhrSYweu59q@cluster0.da8qxz7.mongodb.net/courses', { dbName: "courses" });
// mongoose.connect('mongodb://0.0.0.0:27017/courses', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" });
//mongoose.connect('mongodb://localhost:27017/courses', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" });

app.listen(3000, () => {console.log('listening to port 3000')})