"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 8080,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    DB_URL: process.env.DB_URL || "mongodb://localhost:27017/yourdb",
};
//# sourceMappingURL=env.js.map