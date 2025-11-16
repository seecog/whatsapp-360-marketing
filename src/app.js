import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupSwagger } from './swagger.js'
import { verifyUser } from './middleware/authMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Setup Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(cors({
    origin: ["http://localhost:3002", "http://localhost:5173","https://bulk-whatsapp-manager-backend.onrender.com"],
    credentials: true
}))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

app.use((req, res, next) => {
    console.log(`Received ${req.method} request with body:`, req.body);
    console.log(`Received ${req.method} request with params:`, req.params);
    next();
});

import userRoutes from './routes/user.routes.js'
import { waRouter } from './routes/wa.routes.js'
import businessRouter from "./routes/business.routes.js"
import { customerRouter } from './routes/customer.routes.js'
import { templateRouter } from './routes/template.routes.js'
import { campaignRouter } from './routes/campaign.routes.js'
import { employeeRouter } from './routes/employee.routes.js'
import { testRouter } from './routes/test.routes.js'
import { departmentRouter } from './routes/department.routes.js'
import { servicesRouter } from './routes/services.routes.js'
import { designationsRoutes } from './routes/designations.routes.js'
import {leaveTypesRoutes} from './routes/leaveTypes.routes.js';
import {leaveRequestsRoutes} from './routes/leaveRequests.routes.js';

// Frontend routes - MUST come before static middleware
app.get("/", (req, res) => res.redirect("/login"));

// Clear storage route
app.get("/clear-storage", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Clearing Storage...</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .message { color: #28a745; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="message">Clearing localStorage and redirecting to login...</div>
            <script>
                localStorage.clear();
                sessionStorage.clear();
                setTimeout(() => {
                    window.location.replace('/login');
                }, 1000);
            </script>
        </body>
        </html>
    `);
});
app.get("/login", (req, res) => res.render("login", { title: "Login" }));
app.get("/register", (req, res) => res.render("register", { title: "Register" }));
app.get("/dashboard", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("dashboard", { title: "Dashboard", user });
});
app.get("/customers", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("customers", { title: "Customers", user });
});
app.get("/business", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("business", { title: "Business", user });
});
app.get("/templates", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("templates", { title: "Templates", user });
});
app.get("/campaigns", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("campaigns", { title: "Campaigns", user });
});
app.get("/employees", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("employees", { title: "Employee Management", user });
});

// Static files - serve after routes to avoid conflicts
app.use(express.static("public"))

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/business', businessRouter)

// health
app.get("/api/v1/health", (req, res) => res.json({ ok: true,message : "hello world 2" }));

// sample hello world
app.get("/api/v1/hello", (req, res) => res.json({ message: "Hello, world!" }));

// docs
setupSwagger(app)

// webhook (public)
app.use("/api/v1", waRouter);

// protected business routes
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/templates", templateRouter);
app.use("/api/v1/campaigns", campaignRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1", testRouter); // optional


app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/services", servicesRouter);
app.use('/api/v1/designations', designationsRoutes);

app.use('/api/leave-types', leaveTypesRoutes);
app.use('/api/leave-requests', leaveRequestsRoutes);


export {app}