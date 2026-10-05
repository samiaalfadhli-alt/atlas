// يبني صفحة تعريفية ثابتة لمعاينة Vercel.
// تطبيق WhatsApp Hub يحتاج خادم Node دائم (اتصال WebSocket + تخزين ملفات) ولا يعمل على Serverless.
import { mkdirSync, copyFileSync } from "node:fs";
mkdirSync("dist", { recursive: true });
copyFileSync("landing/index.html", "dist/index.html");
console.log("Landing page built -> dist/index.html");
