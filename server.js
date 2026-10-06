// خادم Next.js مخصّص — نقطة الدخول (main) لاستضافة GoDaddy Node.js
// يقرأ المنفذ من PORT الذي توفّره المنصة. يعمل بعد "next build".
import { createServer } from "node:http"
import next from "next"

const port = parseInt(process.env.PORT || "3000", 10)
const app = next({ dev: false })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Atlas ready on http://0.0.0.0:${port}`)
  })
})
