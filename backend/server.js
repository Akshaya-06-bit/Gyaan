require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth",     require("./routes/auth"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/ai",       require("./routes/ai"));
app.use("/api/courses",  require("./routes/courses"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/matching", require("./routes/matching"));
app.use("/api/resources", require("./routes/resources"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/seed", require("./routes/seed"));
app.use("/api/ngo", require("./routes/ngo"));
app.use("/api", require("./routes/adminAliases"));
app.use("/api/ai-engine", require("./routes/aiEngine"));
app.use("/api/mentor", require("./routes/mentor"));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
