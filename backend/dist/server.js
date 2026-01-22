"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const env_1 = require("./config/env");
const db_1 = __importDefault(require("./config/db"));
const express_2 = require("@clerk/express");
const express_3 = require("inngest/express");
const inngest_1 = require("./config/inngest");
const product_route_1 = __importDefault(require("./routes/product.route"));
const order_route_1 = __importDefault(require("./routes/order.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const review_route_1 = __importDefault(require("./routes/review.route"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: env_1.ENV.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)()); // req.auth will be available
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json({ limit: "10mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/inngest", (0, express_3.serve)({ client: inngest_1.inngest, functions: inngest_1.functions }));
// ROUTES
app.use("/api/v1/users", user_route_1.default);
app.use("/api/v1/products", product_route_1.default);
app.use("/api/v1/orders", order_route_1.default);
app.use("/api/v1/reviews", review_route_1.default);
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        environment: env_1.ENV.NODE_ENV,
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});
// Mount API routes
// app.use("/api", apiRouter);
// Start server
const PORT = env_1.ENV.PORT || 8080;
const server = http_1.default.createServer(app);
const startServer = async () => {
    await (0, db_1.default)();
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} (${env_1.ENV.NODE_ENV})`);
    });
};
startServer();
//# sourceMappingURL=server.js.map