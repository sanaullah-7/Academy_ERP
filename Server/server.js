import "dotenv/config";
import express from "express";
import mongoose  from "mongoose";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("API is running");
});

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("DB Connected Sucessfully")
    } catch (error) {
        console.log("BD Error:", error.message)
        // critical error! Exit with 1 because the app cannot run without a database connection.
        // DB nahi mila toh 'exit(1)' kiya kyunki iske bagair app chalne ka faida nahi.
        process.exit(1)
    }
}
connectDB();

app.listen(PORT, () => {
    console.log(`Server successfully started on: http://localhost:${PORT}`);
})
