"""Yeamigo backend - FastAPI + MongoDB."""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt as pyjwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get("JWT_SECRET", "yeamigo-secret-key-change-in-prod")
JWT_ALG = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Helpers ----------
def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except Exception:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


def require_role(*roles: str):
    async def _check(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, "Forbidden")
        return user
    return _check


def order_ref() -> str:
    import random
    return f"YM-{random.randint(1000, 9999)}"


VALID_TRANSITIONS = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"preparing", "cancelled"},
    "preparing": {"ready", "cancelled"},
    "ready": {"assigned"},
    "assigned": {"en_route"},
    "en_route": {"delivered"},
    "delivered": set(),
    "cancelled": set(),
}


# ---------- Models ----------
class SignupReq(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # customer | rider | restaurant_owner | admin
    phone: Optional[str] = None
    # For restaurant_owner signup:
    restaurant_name: Optional[str] = None
    restaurant_address: Optional[str] = None
    cuisine_tags: Optional[List[str]] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class OrderItemIn(BaseModel):
    item_id: str
    name: str
    price_gbp: float
    quantity: int
    variant: Optional[str] = None
    instructions: Optional[str] = None


class PlaceOrderReq(BaseModel):
    restaurant_id: str
    items: List[OrderItemIn]
    delivery_address: str
    delivery_notes: Optional[str] = None


class ReviewReq(BaseModel):
    order_id: str
    food_rating: int
    delivery_rating: int
    comment: Optional[str] = None


class SupportReq(BaseModel):
    order_id: Optional[str] = None
    category: str
    description: str


class RiderLocReq(BaseModel):
    lat: float
    lng: float


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine_tags: Optional[List[str]] = None
    is_open: Optional[bool] = None
    avg_prep_mins: Optional[int] = None
    min_order_gbp: Optional[float] = None
    address: Optional[str] = None


class MenuItemReq(BaseModel):
    name: str
    description: Optional[str] = ""
    price_gbp: float
    category: str
    dietary_tags: List[str] = []
    allergens: List[str] = []
    image_url: Optional[str] = None
    is_available: bool = True


# ---------- Auth ----------
@api_router.post("/auth/signup")
async def signup(req: SignupReq):
    existing = await db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    if req.role not in ("customer", "rider", "restaurant_owner", "admin"):
        raise HTTPException(400, "Invalid role")

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": req.email.lower(),
        "password_hash": hash_pw(req.password),
        "full_name": req.full_name,
        "role": req.role,
        "phone": req.phone,
        "approved": True if req.role != "restaurant_owner" else False,
        "created_at": now_utc(),
    }
    await db.users.insert_one(user_doc)

    if req.role == "restaurant_owner":
        rid = str(uuid.uuid4())
        rest_doc = {
            "id": rid,
            "owner_id": user_id,
            "name": req.restaurant_name or f"{req.full_name}'s Restaurant",
            "description": "",
            "cuisine_tags": req.cuisine_tags or ["Other"],
            "address": req.restaurant_address or "",
            "city": "",
            "is_open": True,
            "avg_prep_mins": 20,
            "min_order_gbp": 0,
            "rating": 0,
            "hygiene_score": 5,
            "logo_url": None,
            "banner_url": None,
            "approved": False,
            "created_at": now_utc(),
        }
        await db.restaurants.insert_one(rest_doc)

    if req.role == "rider":
        await db.rider_locations.insert_one({
            "id": str(uuid.uuid4()),
            "rider_id": user_id,
            "lat": 51.5074,
            "lng": -0.1278,
            "is_online": False,
            "updated_at": now_utc(),
        })

    token = make_token(user_id, req.role)
    user_safe = {k: v for k, v in user_doc.items() if k != "password_hash"}
    return {"token": token, "user": user_safe}


@api_router.post("/auth/login")
async def login(req: LoginReq):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not verify_pw(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"], "email": user["email"], "full_name": user["full_name"],
            "role": user["role"], "phone": user.get("phone"),
            "approved": user.get("approved", True),
        },
    }


@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---------- Restaurants ----------
@api_router.get("/restaurants")
async def list_restaurants(city: Optional[str] = None, cuisine: Optional[str] = None):
    q: Dict[str, Any] = {"approved": True}
    if cuisine:
        q["cuisine_tags"] = cuisine
    items = await db.restaurants.find(q, {"_id": 0}).to_list(200)
    return items


@api_router.get("/restaurants/{rid}")
async def get_restaurant(rid: str):
    r = await db.restaurants.find_one({"id": rid}, {"_id": 0})
    if not r:
        raise HTTPException(404, "Not found")
    return r


@api_router.get("/restaurants/{rid}/menu")
async def get_menu(rid: str):
    items = await db.menu_items.find({"restaurant_id": rid}, {"_id": 0}).to_list(500)
    # Group by category
    cats: Dict[str, List[Any]] = {}
    for it in items:
        cats.setdefault(it["category"], []).append(it)
    return [{"category": k, "items": v} for k, v in cats.items()]


@api_router.get("/restaurants/owner/mine")
async def my_restaurant(user=Depends(require_role("restaurant_owner"))):
    r = await db.restaurants.find_one({"owner_id": user["id"]}, {"_id": 0})
    if not r:
        raise HTTPException(404, "No restaurant")
    return r


@api_router.patch("/restaurants/{rid}")
async def update_restaurant(rid: str, upd: RestaurantUpdate, user=Depends(get_current_user)):
    r = await db.restaurants.find_one({"id": rid})
    if not r:
        raise HTTPException(404, "Not found")
    if user["role"] != "admin" and r.get("owner_id") != user["id"]:
        raise HTTPException(403, "Forbidden")
    update = {k: v for k, v in upd.dict().items() if v is not None}
    if update:
        await db.restaurants.update_one({"id": rid}, {"$set": update})
    updated = await db.restaurants.find_one({"id": rid}, {"_id": 0})
    return updated


# ---------- Menu (restaurant owner) ----------
@api_router.post("/menu/items")
async def add_item(req: MenuItemReq, user=Depends(require_role("restaurant_owner"))):
    r = await db.restaurants.find_one({"owner_id": user["id"]})
    if not r:
        raise HTTPException(404, "No restaurant")
    doc = {
        "id": str(uuid.uuid4()),
        "restaurant_id": r["id"],
        "name": req.name,
        "description": req.description or "",
        "price_gbp": req.price_gbp,
        "category": req.category,
        "dietary_tags": req.dietary_tags,
        "allergens": req.allergens,
        "image_url": req.image_url,
        "is_available": req.is_available,
        "created_at": now_utc(),
    }
    await db.menu_items.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.patch("/menu/items/{item_id}")
async def update_item(item_id: str, req: MenuItemReq, user=Depends(require_role("restaurant_owner"))):
    item = await db.menu_items.find_one({"id": item_id})
    if not item:
        raise HTTPException(404, "Not found")
    r = await db.restaurants.find_one({"id": item["restaurant_id"]})
    if r["owner_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    await db.menu_items.update_one({"id": item_id}, {"$set": req.dict()})
    return await db.menu_items.find_one({"id": item_id}, {"_id": 0})


@api_router.delete("/menu/items/{item_id}")
async def delete_item(item_id: str, user=Depends(require_role("restaurant_owner"))):
    item = await db.menu_items.find_one({"id": item_id})
    if not item:
        raise HTTPException(404, "Not found")
    r = await db.restaurants.find_one({"id": item["restaurant_id"]})
    if r["owner_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    await db.menu_items.delete_one({"id": item_id})
    return {"ok": True}


# ---------- Orders ----------
async def add_status_log(order_id: str, status: str, actor_role: str, note: Optional[str] = None):
    await db.order_status_log.insert_one({
        "id": str(uuid.uuid4()),
        "order_id": order_id,
        "status": status,
        "actor_role": actor_role,
        "note": note,
        "created_at": now_utc(),
    })


async def notify(user_id: str, title: str, body: str, ntype: str, payload: Optional[Dict] = None):
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "body": body,
        "type": ntype,
        "read": False,
        "payload": payload or {},
        "created_at": now_utc(),
    })


@api_router.post("/orders")
async def place_order(req: PlaceOrderReq, user=Depends(require_role("customer"))):
    rest = await db.restaurants.find_one({"id": req.restaurant_id})
    if not rest:
        raise HTTPException(404, "Restaurant not found")
    if not rest.get("is_open"):
        raise HTTPException(400, "Restaurant is closed")

    subtotal = sum(it.price_gbp * it.quantity for it in req.items)
    delivery_fee = 49.0
    total = round(subtotal + delivery_fee, 2)
    oid = str(uuid.uuid4())
    order = {
        "id": oid,
        "order_ref": order_ref(),
        "customer_id": user["id"],
        "customer_name": user["full_name"],
        "restaurant_id": req.restaurant_id,
        "restaurant_name": rest["name"],
        "rider_id": None,
        "status": "pending",
        "items": [it.dict() for it in req.items],
        "subtotal_gbp": round(subtotal, 2),
        "delivery_fee": delivery_fee,
        "total_gbp": total,
        "delivery_address": req.delivery_address,
        "delivery_notes": req.delivery_notes,
        "prep_time_mins": None,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    await db.orders.insert_one(order)
    await add_status_log(oid, "pending", "customer")
    await notify(rest["owner_id"], "New Order", f"Order {order['order_ref']} received", "new_order", {"order_id": oid})
    order.pop("_id", None)
    return order


@api_router.get("/orders/mine")
async def my_orders(user=Depends(get_current_user)):
    role = user["role"]
    if role == "customer":
        q = {"customer_id": user["id"]}
    elif role == "rider":
        q = {"rider_id": user["id"]}
    elif role == "restaurant_owner":
        r = await db.restaurants.find_one({"owner_id": user["id"]})
        if not r:
            return []
        q = {"restaurant_id": r["id"]}
    elif role == "admin":
        q = {}
    else:
        raise HTTPException(403, "Forbidden")
    items = await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api_router.get("/orders/available")
async def available_for_riders(user=Depends(require_role("rider"))):
    items = await db.orders.find({"status": "ready", "rider_id": None}, {"_id": 0}).to_list(50)
    return items


@api_router.get("/orders/{oid}")
async def get_order(oid: str, user=Depends(get_current_user)):
    o = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Not found")
    role = user["role"]
    if role == "customer" and o["customer_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    if role == "rider" and o.get("rider_id") not in (user["id"], None):
        raise HTTPException(403, "Forbidden")
    if role == "restaurant_owner":
        r = await db.restaurants.find_one({"owner_id": user["id"]})
        if not r or o["restaurant_id"] != r["id"]:
            raise HTTPException(403, "Forbidden")
    return o


@api_router.patch("/orders/{oid}/status")
async def update_order_status(oid: str, upd: StatusUpdate, user=Depends(get_current_user)):
    o = await db.orders.find_one({"id": oid})
    if not o:
        raise HTTPException(404, "Not found")

    new_status = upd.status
    if new_status not in VALID_TRANSITIONS.get(o["status"], set()):
        raise HTTPException(400, f"Invalid transition {o['status']} → {new_status}")

    # Role-based permission
    role = user["role"]
    allowed = False
    if role == "customer" and new_status == "cancelled" and o["customer_id"] == user["id"]:
        allowed = True
    if role == "restaurant_owner":
        r = await db.restaurants.find_one({"owner_id": user["id"]})
        if r and r["id"] == o["restaurant_id"] and new_status in {"confirmed", "preparing", "ready", "cancelled"}:
            allowed = True
    if role == "rider" and new_status in {"en_route", "delivered"} and o.get("rider_id") == user["id"]:
        allowed = True
    if role == "admin":
        allowed = True
    if not allowed:
        raise HTTPException(403, "Forbidden")

    update = {"status": new_status, "updated_at": now_utc()}
    await db.orders.update_one({"id": oid}, {"$set": update})
    await add_status_log(oid, new_status, role, upd.note)

    # Notifications
    if new_status == "confirmed":
        await notify(o["customer_id"], "Order confirmed", f"Your order {o['order_ref']} is confirmed.", "order_update", {"order_id": oid})
    if new_status == "ready":
        await notify(o["customer_id"], "Order ready", "Your food is ready for pickup.", "order_update", {"order_id": oid})
    if new_status == "delivered":
        await notify(o["customer_id"], "Order delivered", "Enjoy your meal!", "order_update", {"order_id": oid})
    if new_status == "cancelled":
        await notify(o["customer_id"], "Order cancelled", f"Order {o['order_ref']} was cancelled.", "order_update", {"order_id": oid})

    return await db.orders.find_one({"id": oid}, {"_id": 0})


@api_router.post("/orders/{oid}/accept")
async def rider_accept(oid: str, user=Depends(require_role("rider"))):
    o = await db.orders.find_one({"id": oid})
    if not o:
        raise HTTPException(404, "Not found")
    if o["status"] != "ready" or o.get("rider_id"):
        raise HTTPException(400, "Order not available")
    await db.orders.update_one({"id": oid}, {"$set": {
        "rider_id": user["id"], "rider_name": user["full_name"],
        "status": "assigned", "updated_at": now_utc(),
    }})
    await add_status_log(oid, "assigned", "rider")
    await notify(o["customer_id"], "Rider assigned", f"{user['full_name']} is heading to the restaurant.", "rider_assigned", {"order_id": oid})
    return await db.orders.find_one({"id": oid}, {"_id": 0})


@api_router.get("/orders/{oid}/log")
async def order_log(oid: str, user=Depends(get_current_user)):
    items = await db.order_status_log.find({"order_id": oid}, {"_id": 0}).sort("created_at", 1).to_list(50)
    return items


# ---------- Rider ----------
@api_router.patch("/rider/online")
async def toggle_online(body: Dict[str, bool], user=Depends(require_role("rider"))):
    is_online = body.get("is_online", False)
    await db.rider_locations.update_one(
        {"rider_id": user["id"]},
        {"$set": {"is_online": is_online, "updated_at": now_utc()}},
        upsert=True,
    )
    return {"is_online": is_online}


@api_router.patch("/rider/location")
async def update_location(req: RiderLocReq, user=Depends(require_role("rider"))):
    await db.rider_locations.update_one(
        {"rider_id": user["id"]},
        {"$set": {"lat": req.lat, "lng": req.lng, "updated_at": now_utc()}},
        upsert=True,
    )
    return {"ok": True}


@api_router.get("/rider/status")
async def rider_status(user=Depends(require_role("rider"))):
    loc = await db.rider_locations.find_one({"rider_id": user["id"]}, {"_id": 0})
    return loc or {"is_online": False}


# ---------- Reviews ----------
@api_router.post("/reviews")
async def create_review(req: ReviewReq, user=Depends(require_role("customer"))):
    o = await db.orders.find_one({"id": req.order_id})
    if not o or o["customer_id"] != user["id"]:
        raise HTTPException(404, "Order not found")
    existing = await db.reviews.find_one({"order_id": req.order_id})
    if existing:
        raise HTTPException(400, "Already reviewed")
    review = {
        "id": str(uuid.uuid4()),
        "order_id": req.order_id,
        "customer_id": user["id"],
        "customer_name": user["full_name"],
        "restaurant_id": o["restaurant_id"],
        "food_rating": req.food_rating,
        "delivery_rating": req.delivery_rating,
        "comment": req.comment,
        "created_at": now_utc(),
    }
    await db.reviews.insert_one(review)
    review.pop("_id", None)
    return review


# ---------- Support ----------
@api_router.post("/support")
async def create_ticket(req: SupportReq, user=Depends(get_current_user)):
    t = {
        "id": str(uuid.uuid4()),
        "order_id": req.order_id,
        "raised_by": user["id"],
        "raised_by_name": user["full_name"],
        "category": req.category,
        "description": req.description,
        "status": "open",
        "resolution": None,
        "created_at": now_utc(),
    }
    await db.support_tickets.insert_one(t)
    t.pop("_id", None)
    return t


@api_router.get("/support/mine")
async def my_tickets(user=Depends(get_current_user)):
    if user["role"] == "admin":
        items = await db.support_tickets.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    else:
        items = await db.support_tickets.find({"raised_by": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items


# ---------- Notifications ----------
@api_router.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    items = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return items


@api_router.patch("/notifications/{nid}/read")
async def mark_read(nid: str, user=Depends(get_current_user)):
    await db.notifications.update_one({"id": nid, "user_id": user["id"]}, {"$set": {"read": True}})
    return {"ok": True}


# ---------- Admin ----------
@api_router.get("/admin/overview")
async def admin_overview(user=Depends(require_role("admin"))):
    total_users = await db.users.count_documents({})
    total_restaurants = await db.restaurants.count_documents({})
    pending_restaurants = await db.restaurants.count_documents({"approved": False})
    total_orders = await db.orders.count_documents({})
    active_orders = await db.orders.count_documents({"status": {"$nin": ["delivered", "cancelled"]}})
    delivered = await db.orders.count_documents({"status": "delivered"})
    revenue = 0.0
    async for o in db.orders.find({"status": "delivered"}, {"total_gbp": 1, "_id": 0}):
        revenue += float(o.get("total_gbp", 0))
    return {
        "total_users": total_users,
        "total_restaurants": total_restaurants,
        "pending_restaurants": pending_restaurants,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "delivered_orders": delivered,
        "revenue_gbp": round(revenue, 2),
    }


@api_router.get("/admin/users")
async def admin_users(user=Depends(require_role("admin"))):
    items = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(500)
    return items


@api_router.get("/admin/restaurants")
async def admin_restaurants(user=Depends(require_role("admin"))):
    items = await db.restaurants.find({}, {"_id": 0}).to_list(500)
    return items


@api_router.patch("/admin/restaurants/{rid}/approve")
async def approve_restaurant(rid: str, user=Depends(require_role("admin"))):
    await db.restaurants.update_one({"id": rid}, {"$set": {"approved": True}})
    r = await db.restaurants.find_one({"id": rid}, {"_id": 0})
    if r:
        await db.users.update_one({"id": r["owner_id"]}, {"$set": {"approved": True}})
    return r


# ---------- Seed ----------
@api_router.post("/seed")
async def seed():
    """Idempotent: seeds demo data if users collection is empty."""
    if await db.users.count_documents({}) > 0:
        return {"seeded": False, "message": "already seeded"}

    # Users
    users_data = [
        ("admin@yeaamigo.app", "Admin User", "admin"),
        ("customer@yeaamigo.app", "Sofia Hernandez", "customer"),
        ("rider@yeaamigo.app", "Marco Diaz", "rider"),
        ("owner1@yeaamigo.app", "Luca Rossi", "restaurant_owner"),
        ("owner2@yeaamigo.app", "Priya Sharma", "restaurant_owner"),
    ]
    ids = {}
    for email, name, role in users_data:
        uid = str(uuid.uuid4())
        ids[email] = uid
        await db.users.insert_one({
            "id": uid,
            "email": email,
            "password_hash": hash_pw("YeaAmigo2026!"),
            "full_name": name,
            "role": role,
            "phone": "+447700900000",
            "approved": True,
            "created_at": now_utc(),
        })

    # Rider location
    await db.rider_locations.insert_one({
        "id": str(uuid.uuid4()),
        "rider_id": ids["rider@yeaamigo.app"],
        "lat": 51.5074,
        "lng": -0.1278,
        "is_online": False,
        "updated_at": now_utc(),
    })

    # Restaurants
    rest1_id = str(uuid.uuid4())
    rest2_id = str(uuid.uuid4())
    await db.restaurants.insert_many([
        {
            "id": rest1_id,
            "owner_id": ids["owner1@yeaamigo.app"],
            "name": "Rossi's Wood-Fired Pizza",
            "description": "Authentic Neapolitan pizza, hand-stretched dough, wood-fired in 90 seconds.",
            "cuisine_tags": ["Pizza", "Italian"],
            "address": "42 Brick Lane, London",
            "city": "London",
            "postcode": "E1 6RF",
            "lat": 51.5208,
            "lng": -0.0719,
            "is_open": True,
            "avg_prep_mins": 18,
            "min_order_gbp": 199.0,
            "rating": 4.7,
            "hygiene_score": 5,
            "logo_url": "https://images.unsplash.com/photo-1542528180-a1208c5169a5?w=200",
            "banner_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
            "approved": True,
            "created_at": now_utc(),
        },
        {
            "id": rest2_id,
            "owner_id": ids["owner2@yeaamigo.app"],
            "name": "Sharma's Spice Kitchen",
            "description": "Family recipes from Mumbai. Warm spices, fresh herbs, slow-cooked curries.",
            "cuisine_tags": ["Indian", "Vegan"],
            "address": "88 Drummond Street, London",
            "city": "London",
            "postcode": "NW1 2HN",
            "lat": 51.5267,
            "lng": -0.1370,
            "is_open": True,
            "avg_prep_mins": 25,
            "min_order_gbp": 249.0,
            "rating": 4.5,
            "hygiene_score": 5,
            "logo_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200",
            "banner_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800",
            "approved": True,
            "created_at": now_utc(),
        },
    ])

    # Menu items
    menu = [
        # Rossi's
        (rest1_id, "Pizzas", "Margherita", "San Marzano tomato, fior di latte, basil", 349.0,
         "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400", ["Vegetarian"], ["Gluten", "Dairy"]),
        (rest1_id, "Pizzas", "Diavola", "Spicy salami, tomato, mozzarella, chilli oil", 399.0,
         "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400", ["Spicy"], ["Gluten", "Dairy"]),
        (rest1_id, "Pizzas", "Quattro Formaggi", "Four cheese blend on white base", 499.0,
         "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", ["Vegetarian"], ["Gluten", "Dairy"]),
        (rest1_id, "Sides", "Garlic Bread", "Wood-fired focaccia, garlic butter, herbs", 129.0,
         "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400", ["Vegetarian"], ["Gluten", "Dairy"]),
        (rest1_id, "Sides", "Caesar Salad", "Cos lettuce, parmesan, anchovy dressing", 199.0,
         "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400", [], ["Dairy", "Eggs"]),
        (rest1_id, "Drinks", "Italian Lemonade", "Sicilian lemons, sparkling", 89.0,
         "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400", ["Vegan"], []),

        # Sharma's
        (rest2_id, "Curries", "Butter Chicken", "Tandoori chicken in creamy tomato sauce", 329.0,
         "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400", [], ["Dairy"]),
        (rest2_id, "Curries", "Chana Masala", "Spiced chickpeas, tomato, ginger", 249.0,
         "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", ["Vegan", "Gluten-Free"], []),
        (rest2_id, "Curries", "Lamb Rogan Josh", "Slow-cooked lamb, Kashmiri spices", 499.0,
         "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400", ["Spicy"], ["Dairy"]),
        (rest2_id, "Sides", "Garlic Naan", "Tandoor-baked, garlic, coriander", 89.0,
         "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", ["Vegetarian"], ["Gluten", "Dairy"]),
        (rest2_id, "Sides", "Samosa (2pc)", "Crispy pastry, spiced potato & peas", 119.0,
         "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", ["Vegan"], ["Gluten"]),
        (rest2_id, "Drinks", "Mango Lassi", "Yogurt, mango, cardamom", 89.0,
         "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", ["Vegetarian"], ["Dairy"]),
    ]
    docs = []
    for rid, cat, name, desc, price, img, tags, allergens in menu:
        docs.append({
            "id": str(uuid.uuid4()),
            "restaurant_id": rid,
            "name": name,
            "description": desc,
            "price_gbp": price,
            "category": cat,
            "dietary_tags": tags,
            "allergens": allergens,
            "image_url": img,
            "is_available": True,
            "created_at": now_utc(),
        })
    await db.menu_items.insert_many(docs)

    return {"seeded": True, "users": len(users_data), "restaurants": 2, "items": len(menu)}


# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"app": "Yeamigo", "status": "ok"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Auto-seed on first boot
    try:
        if await db.users.count_documents({}) == 0:
            await seed()
            logger.info("Auto-seeded demo data.")
    except Exception as e:
        logger.error(f"Seed error: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
