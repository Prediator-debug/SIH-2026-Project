from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.routes import auth, dashboard, products, inspections, scan, reports, ecommerce, analytics, offline
from core.config import settings

app = FastAPI(
    title="Legal Metrology Compliance & Inspection Platform API",
    description="AI-Based Platform API for Legal Metrology Officers",
    version="1.0.0",
)

# Configure CORS (reads CORS_ORIGINS from environment variables)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Response Headers Middleware (SIH 2026 Section 26 Hardening)
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Include Routers (Specific/Static routes before generic /{id} parameterized routes)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(reports.router, prefix="/api/inspections", tags=["Evidence & Reports"])
app.include_router(offline.router, prefix="/api/inspections", tags=["Offline Sync"])
app.include_router(scan.router, prefix="/api/inspections", tags=["AI Scan"])
app.include_router(inspections.router, prefix="/api/inspections", tags=["Inspections"])
app.include_router(ecommerce.router, prefix="/api/ecommerce", tags=["E-Commerce Cross-Validation"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Risk & Analytics"])



@app.get("/")
def read_root():
    return {"status": "ok", "message": "Legal Metrology Platform API is running."}

