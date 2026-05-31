import AsyncStorage from '@react-native-async-storage/async-storage';

const STATE_KEY = 'yeamigo_mock_state_v1';
const TOKEN_KEY = 'yeamigo_token';
const PASSWORD = 'YeaAmigo2026!';

type User = { id: string; email: string; full_name: string; role: string; phone?: string; approved?: boolean };
type Restaurant = Record<string, any>;
type MenuItem = Record<string, any>;
type Order = Record<string, any>;

type MockState = {
  users: User[];
  restaurants: Restaurant[];
  menu_items: MenuItem[];
  orders: Order[];
  notifications: Record<string, any>[];
  rider_status: Record<string, any>;
  reviews: Record<string, any>[];
  support_tickets: Record<string, any>[];
};

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const tokenFor = (user: User) => `mock:${user.email}`;

const seedState = (): MockState => {
  const users: User[] = [
    { id: 'u-admin', email: 'admin@yeaamigo.app', full_name: 'Admin User', role: 'admin', phone: '+447700900000', approved: true },
    { id: 'u-customer', email: 'customer@yeaamigo.app', full_name: 'Sofia Hernandez', role: 'customer', phone: '+447700900001', approved: true },
    { id: 'u-rider', email: 'rider@yeaamigo.app', full_name: 'Marco Diaz', role: 'rider', phone: '+447700900002', approved: true },
    { id: 'u-owner1', email: 'owner1@yeaamigo.app', full_name: 'Luca Rossi', role: 'restaurant_owner', phone: '+447700900003', approved: true },
    { id: 'u-owner2', email: 'owner2@yeaamigo.app', full_name: 'Priya Sharma', role: 'restaurant_owner', phone: '+447700900004', approved: true },
  ];

  const restaurants: Restaurant[] = [
    {
      id: 'rest-rossi',
      owner_id: 'u-owner1',
      name: "Rossi's Wood-Fired Pizza",
      description: 'Authentic Neapolitan pizza, hand-stretched dough, wood-fired in 90 seconds.',
      cuisine_tags: ['Pizza', 'Italian'],
      address: '42 Brick Lane, London',
      city: 'London',
      postcode: 'E1 6RF',
      is_open: true,
      avg_prep_mins: 18,
      min_order_gbp: 199,
      rating: 4.7,
      hygiene_score: 5,
      logo_url: 'https://images.unsplash.com/photo-1542528180-a1208c5169a5?w=200',
      banner_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      approved: true,
      payments: { payout_account: 'Luca Rossi Ltd - ending 2219', settlement: 'Daily at 09:00', card_fee_pct: 2.4, accepts_cash: false },
      created_at: now(),
    },
    {
      id: 'rest-sharma',
      owner_id: 'u-owner2',
      name: "Sharma's Spice Kitchen",
      description: 'Family recipes from Mumbai. Warm spices, fresh herbs, slow-cooked curries.',
      cuisine_tags: ['Indian', 'Vegan'],
      address: '88 Drummond Street, London',
      city: 'London',
      postcode: 'NW1 2HN',
      is_open: true,
      avg_prep_mins: 25,
      min_order_gbp: 249,
      rating: 4.5,
      hygiene_score: 5,
      logo_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200',
      banner_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800',
      approved: true,
      payments: { payout_account: 'Priya Sharma Foods - ending 8840', settlement: 'Weekly on Monday', card_fee_pct: 2.2, accepts_cash: true },
      created_at: now(),
    },
  ];

  const menu_items: MenuItem[] = [
    ['rest-rossi', 'Pizzas', 'Margherita', 'San Marzano tomato, fior di latte, basil', 349, 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400', ['Vegetarian'], ['Gluten', 'Dairy']],
    ['rest-rossi', 'Pizzas', 'Diavola', 'Spicy salami, tomato, mozzarella, chilli oil', 399, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', ['Spicy'], ['Gluten', 'Dairy']],
    ['rest-rossi', 'Pizzas', 'Quattro Formaggi', 'Four cheese blend on white base', 499, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', ['Vegetarian'], ['Gluten', 'Dairy']],
    ['rest-rossi', 'Sides', 'Garlic Bread', 'Wood-fired focaccia, garlic butter, herbs', 129, 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400', ['Vegetarian'], ['Gluten', 'Dairy']],
    ['rest-sharma', 'Curries', 'Butter Chicken', 'Tandoori chicken in creamy tomato sauce', 329, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', [], ['Dairy']],
    ['rest-sharma', 'Curries', 'Chana Masala', 'Spiced chickpeas, tomato, ginger', 249, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', ['Vegan', 'Gluten-Free'], []],
    ['rest-sharma', 'Sides', 'Garlic Naan', 'Tandoor-baked, garlic, coriander', 89, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', ['Vegetarian'], ['Gluten', 'Dairy']],
    ['rest-sharma', 'Drinks', 'Mango Lassi', 'Yogurt, mango, cardamom', 89, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', ['Vegetarian'], ['Dairy']],
  ].map((m, index) => ({
    id: `item-${index + 1}`,
    restaurant_id: m[0],
    category: m[1],
    name: m[2],
    description: m[3],
    price_gbp: m[4],
    image_url: m[5],
    dietary_tags: m[6],
    allergens: m[7],
    is_available: true,
    created_at: now(),
  }));

  const orders: Order[] = [
    {
      id: 'order-ready',
      order_ref: 'YM-2401',
      customer_id: 'u-customer',
      customer_name: 'Sofia Hernandez',
      restaurant_id: 'rest-rossi',
      restaurant_name: "Rossi's Wood-Fired Pizza",
      rider_id: null,
      status: 'ready',
      items: [{ item_id: 'item-1', name: 'Margherita', price_gbp: 349, quantity: 1 }],
      subtotal_gbp: 349,
      delivery_fee: 49,
      total_gbp: 398,
      delivery_address: '221B Baker Street, London NW1 6XE',
      delivery_notes: 'Ring the bell twice',
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updated_at: now(),
    },
    {
      id: 'order-delivered',
      order_ref: 'YM-1998',
      customer_id: 'u-customer',
      customer_name: 'Sofia Hernandez',
      restaurant_id: 'rest-sharma',
      restaurant_name: "Sharma's Spice Kitchen",
      rider_id: 'u-rider',
      rider_name: 'Marco Diaz',
      status: 'delivered',
      items: [{ item_id: 'item-6', name: 'Chana Masala', price_gbp: 249, quantity: 1 }, { item_id: 'item-7', name: 'Garlic Naan', price_gbp: 89, quantity: 2 }],
      subtotal_gbp: 427,
      delivery_fee: 49,
      total_gbp: 476,
      delivery_address: '221B Baker Street, London NW1 6XE',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      updated_at: now(),
    },
  ];

  return {
    users,
    restaurants,
    menu_items,
    orders,
    notifications: [
      { id: 'note-rider-ready', user_id: 'u-rider', title: 'Order ready for pickup', body: 'YM-2401 is ready at Rossi\'s Wood-Fired Pizza.', type: 'new_delivery', read: false, payload: { order_id: 'order-ready' }, created_at: now() },
      { id: 'note-owner-ready', user_id: 'u-owner1', title: 'Order ready', body: 'YM-2401 is awaiting rider collection.', type: 'order_update', read: false, payload: { order_id: 'order-ready' }, created_at: now() },
    ],
    rider_status: { 'u-rider': { id: 'loc-rider', rider_id: 'u-rider', lat: 51.5074, lng: -0.1278, is_online: true, updated_at: now() } },
    reviews: [],
    support_tickets: [],
  };
};

async function loadState(): Promise<MockState> {
  const raw = await AsyncStorage.getItem(STATE_KEY);
  if (raw) return JSON.parse(raw);
  const seeded = seedState();
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(seeded));
  return seeded;
}

async function saveState(state: MockState) {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
}

async function currentUser(state: MockState) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token?.startsWith('mock:')) throw new Error('Missing token');
  const email = token.slice(5);
  const user = state.users.find(u => u.email === email);
  if (!user) throw new Error('User not found');
  return user;
}

const groupMenu = (items: MenuItem[]) => {
  const groups: Record<string, MenuItem[]> = {};
  items.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });
  return Object.keys(groups).map(category => ({ category, items: groups[category] }));
};

const requireRole = (user: User, roles: string[]) => {
  if (!roles.includes(user.role)) throw new Error('Forbidden');
};

const visibleRestaurants = (state: MockState) => state.restaurants
  .filter(r => r.approved)
  .map(r => ({
    ...r,
    search_terms: state.menu_items
      .filter(m => m.restaurant_id === r.id)
      .flatMap(m => [m.name, m.description, m.category, ...(m.dietary_tags || [])])
      .join(' '),
  }));

const notify = (state: MockState, user_id: string, title: string, body: string, type: string, payload: Record<string, any> = {}) => {
  state.notifications.unshift({ id: id('note'), user_id, title, body, type, read: false, payload, created_at: now() });
};

export async function mockApi(path: string, opts: RequestInit = {}) {
  const method = (opts.method || 'GET').toUpperCase();
  const body = opts.body ? JSON.parse(String(opts.body)) : {};
  const state = await loadState();
  const cleanPath = path.split('?')[0];

  if (cleanPath === '/auth/login' && method === 'POST') {
    const user = state.users.find(u => u.email === String(body.email || '').toLowerCase());
    if (!user || body.password !== PASSWORD) throw new Error('Invalid credentials');
    return { token: tokenFor(user), user };
  }

  if (cleanPath === '/auth/signup' && method === 'POST') {
    if (state.users.some(u => u.email === String(body.email || '').toLowerCase())) throw new Error('Email already registered');
    const user: User = {
      id: id('u'),
      email: String(body.email || '').toLowerCase(),
      full_name: body.full_name,
      role: body.role,
      phone: body.phone,
      approved: body.role !== 'restaurant_owner',
    };
    state.users.push(user);
    if (user.role === 'restaurant_owner') {
      state.restaurants.push({
        id: id('rest'),
        owner_id: user.id,
        name: body.restaurant_name || `${user.full_name}'s Restaurant`,
        description: '',
        cuisine_tags: body.cuisine_tags || ['Other'],
        address: body.restaurant_address || '',
        is_open: true,
        avg_prep_mins: 20,
        min_order_gbp: 0,
        rating: 0,
        hygiene_score: 5,
        approved: true,
        payments: { payout_account: 'Demo payout account', settlement: 'Daily', card_fee_pct: 2.4, accepts_cash: false },
        created_at: now(),
      });
    }
    await saveState(state);
    return { token: tokenFor(user), user };
  }

  const user = await currentUser(state);

  if (cleanPath === '/auth/me') return user;
  if (cleanPath === '/restaurants' && method === 'GET') return visibleRestaurants(state);
  if (cleanPath === '/restaurants/owner/mine' && method === 'GET') {
    requireRole(user, ['restaurant_owner']);
    const restaurant = state.restaurants.find(r => r.owner_id === user.id);
    if (!restaurant) throw new Error('No restaurant');
    return restaurant;
  }

  const restaurantMenuMatch = cleanPath.match(/^\/restaurants\/([^/]+)\/menu$/);
  if (restaurantMenuMatch && method === 'GET') {
    return groupMenu(state.menu_items.filter(m => m.restaurant_id === restaurantMenuMatch[1]));
  }

  const restaurantMatch = cleanPath.match(/^\/restaurants\/([^/]+)$/);
  if (restaurantMatch) {
    const restaurant = state.restaurants.find(r => r.id === restaurantMatch[1]);
    if (!restaurant) throw new Error('Not found');
    if (method === 'GET') return restaurant;
    if (method === 'PATCH') {
      if (user.role !== 'admin' && restaurant.owner_id !== user.id) throw new Error('Forbidden');
      Object.assign(restaurant, body);
      await saveState(state);
      return restaurant;
    }
  }

  if (cleanPath === '/menu/items' && method === 'POST') {
    requireRole(user, ['restaurant_owner']);
    const restaurant = state.restaurants.find(r => r.owner_id === user.id);
    if (!restaurant) throw new Error('No restaurant');
    const item = {
      id: id('item'),
      restaurant_id: restaurant.id,
      name: body.name,
      description: body.description || '',
      price_gbp: Number(body.price_gbp || 0),
      category: body.category || 'Menu',
      dietary_tags: body.dietary_tags || [],
      allergens: body.allergens || [],
      image_url: body.image_url || null,
      is_available: body.is_available ?? true,
      created_at: now(),
    };
    state.menu_items.push(item);
    await saveState(state);
    return item;
  }

  const menuMatch = cleanPath.match(/^\/menu\/items\/([^/]+)$/);
  if (menuMatch) {
    requireRole(user, ['restaurant_owner']);
    const item = state.menu_items.find(m => m.id === menuMatch[1]);
    if (!item) throw new Error('Not found');
    const restaurant = state.restaurants.find(r => r.id === item.restaurant_id);
    if (restaurant?.owner_id !== user.id) throw new Error('Forbidden');
    if (method === 'PATCH') {
      Object.assign(item, body, { price_gbp: Number(body.price_gbp ?? item.price_gbp) });
      await saveState(state);
      return item;
    }
    if (method === 'DELETE') {
      state.menu_items = state.menu_items.filter(m => m.id !== item.id);
      await saveState(state);
      return { ok: true };
    }
  }

  if (cleanPath === '/orders' && method === 'POST') {
    requireRole(user, ['customer']);
    const restaurant = state.restaurants.find(r => r.id === body.restaurant_id);
    if (!restaurant) throw new Error('Restaurant not found');
    const subtotal = body.items.reduce((sum: number, item: any) => sum + Number(item.price_gbp) * Number(item.quantity), 0);
    const order = {
      id: id('order'),
      order_ref: `YM-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: user.id,
      customer_name: user.full_name,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      rider_id: null,
      status: 'pending',
      items: body.items,
      subtotal_gbp: subtotal,
      delivery_fee: 49,
      total_gbp: Math.round((subtotal + 49) * 100) / 100,
      delivery_address: body.delivery_address,
      delivery_notes: body.delivery_notes,
      created_at: now(),
      updated_at: now(),
    };
    state.orders.unshift(order);
    notify(state, restaurant.owner_id, 'New order', `${order.order_ref} needs confirmation.`, 'new_order', { order_id: order.id });
    state.users.filter(u => u.role === 'rider').forEach(rider => notify(state, rider.id, 'New order placed', `${order.order_ref} will need delivery after preparation.`, 'new_delivery', { order_id: order.id }));
    await saveState(state);
    return order;
  }

  if (cleanPath === '/orders/mine' && method === 'GET') {
    if (user.role === 'customer') return state.orders.filter(o => o.customer_id === user.id);
    if (user.role === 'rider') return state.orders.filter(o => o.rider_id === user.id);
    if (user.role === 'restaurant_owner') {
      const restaurant = state.restaurants.find(r => r.owner_id === user.id);
      return state.orders.filter(o => o.restaurant_id === restaurant?.id);
    }
    return state.orders;
  }

  if (cleanPath === '/orders/available' && method === 'GET') {
    requireRole(user, ['rider']);
    return state.orders.filter(o => o.status === 'ready' && !o.rider_id);
  }

  const acceptMatch = cleanPath.match(/^\/orders\/([^/]+)\/accept$/);
  if (acceptMatch && method === 'POST') {
    requireRole(user, ['rider']);
    const order = state.orders.find(o => o.id === acceptMatch[1]);
    if (!order || order.status !== 'ready' || order.rider_id) throw new Error('Order not available');
    Object.assign(order, { rider_id: user.id, rider_name: user.full_name, status: 'assigned', updated_at: now() });
    notify(state, order.customer_id, 'Rider assigned', `${user.full_name} is heading to the restaurant.`, 'rider_assigned', { order_id: order.id });
    await saveState(state);
    return order;
  }

  const orderStatusMatch = cleanPath.match(/^\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    const order = state.orders.find(o => o.id === orderStatusMatch[1]);
    if (!order) throw new Error('Not found');
    const next = body.status;
    if (user.role === 'restaurant_owner') {
      const restaurant = state.restaurants.find(r => r.owner_id === user.id);
      if (restaurant?.id !== order.restaurant_id) throw new Error('Forbidden');
    } else if (user.role === 'rider' && order.rider_id !== user.id) {
      throw new Error('Forbidden');
    } else if (user.role === 'customer' && order.customer_id !== user.id) {
      throw new Error('Forbidden');
    }
    Object.assign(order, { status: next, updated_at: now() });
    if (next === 'ready') state.users.filter(u => u.role === 'rider').forEach(rider => notify(state, rider.id, 'Order ready for pickup', `${order.order_ref} is ready at ${order.restaurant_name}.`, 'new_delivery', { order_id: order.id }));
    if (next === 'delivered') notify(state, order.customer_id, 'Order delivered', 'Enjoy your meal!', 'order_update', { order_id: order.id });
    await saveState(state);
    return order;
  }

  const orderMatch = cleanPath.match(/^\/orders\/([^/]+)$/);
  if (orderMatch && method === 'GET') {
    const order = state.orders.find(o => o.id === orderMatch[1]);
    if (!order) throw new Error('Not found');
    return order;
  }

  if (cleanPath === '/rider/status' && method === 'GET') {
    requireRole(user, ['rider']);
    return state.rider_status[user.id] || { is_online: false };
  }

  if (cleanPath === '/rider/online' && method === 'PATCH') {
    requireRole(user, ['rider']);
    state.rider_status[user.id] = { ...(state.rider_status[user.id] || {}), rider_id: user.id, is_online: !!body.is_online, updated_at: now() };
    await saveState(state);
    return { is_online: !!body.is_online };
  }

  if (cleanPath === '/notifications' && method === 'GET') return state.notifications.filter(n => n.user_id === user.id);

  const notificationReadMatch = cleanPath.match(/^\/notifications\/([^/]+)\/read$/);
  if (notificationReadMatch && method === 'PATCH') {
    const notification = state.notifications.find(n => n.id === notificationReadMatch[1] && n.user_id === user.id);
    if (notification) notification.read = true;
    await saveState(state);
    return { ok: true };
  }

  if (cleanPath === '/reviews' && method === 'POST') {
    state.reviews.push({ id: id('review'), customer_id: user.id, ...body, created_at: now() });
    await saveState(state);
    return state.reviews[state.reviews.length - 1];
  }

  if (cleanPath === '/support' && method === 'POST') {
    state.support_tickets.push({ id: id('ticket'), raised_by: user.id, ...body, status: 'open', created_at: now() });
    await saveState(state);
    return state.support_tickets[state.support_tickets.length - 1];
  }

  if (cleanPath === '/admin/overview' && method === 'GET') {
    requireRole(user, ['admin']);
    const delivered = state.orders.filter(o => o.status === 'delivered');
    return {
      total_users: state.users.length,
      total_restaurants: state.restaurants.length,
      pending_restaurants: state.restaurants.filter(r => !r.approved).length,
      total_orders: state.orders.length,
      active_orders: state.orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
      delivered_orders: delivered.length,
      revenue_gbp: delivered.reduce((sum, o) => sum + Number(o.total_gbp || 0), 0),
    };
  }
  if (cleanPath === '/admin/users' && method === 'GET') return state.users;
  if (cleanPath === '/admin/restaurants' && method === 'GET') return state.restaurants;

  const approveMatch = cleanPath.match(/^\/admin\/restaurants\/([^/]+)\/approve$/);
  if (approveMatch && method === 'PATCH') {
    const restaurant = state.restaurants.find(r => r.id === approveMatch[1]);
    if (restaurant) restaurant.approved = true;
    await saveState(state);
    return restaurant;
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${cleanPath}`);
}

export async function resetMockData() {
  const seeded = seedState();
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(seeded));
  return seeded;
}
