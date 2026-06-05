from fastapi import APIRouter

from app.api.routes import auth, categories, dashboard, health, tickets, users

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(categories.router)
api_router.include_router(tickets.router)
api_router.include_router(dashboard.router)
