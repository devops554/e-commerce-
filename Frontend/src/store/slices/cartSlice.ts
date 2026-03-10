import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: string;        // unique cart key (variant id)
    productId: string; // parent product _id
    variantId: string; // variant _id
    title: string;
    price: number;
    quantity: number;
    image: string;
    gstRate?: number;
    hsnCode?: string;
}

interface CartState {
    items: CartItem[];
    totalAmount: number;
}

const saveToStorage = (items: CartItem[], totalAmount: number) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify({ items, totalAmount }));
    }
};

const getInitialState = (): CartState => {
    if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                return JSON.parse(savedCart);
            } catch (e) {
                console.error("Failed to parse cart from localStorage", e);
            }
        }
    }
    return { items: [], totalAmount: 0 };
};

const initialState: CartState = getInitialState();

const recalcTotal = (items: CartItem[]) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find((item) => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            state.totalAmount = recalcTotal(state.items);
            saveToStorage(state.items, state.totalAmount);
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            state.totalAmount = recalcTotal(state.items);
            saveToStorage(state.items, state.totalAmount);
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find((item) => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
            }
            state.totalAmount = recalcTotal(state.items);
            saveToStorage(state.items, state.totalAmount);
        },
        clearCart: (state) => {
            state.items = [];
            state.totalAmount = 0;
            saveToStorage([], 0);
        },
        decrementCart: (state, action: PayloadAction<{ variantId: string }>) => {
            const index = state.items.findIndex((item) => item.variantId === action.payload.variantId);
            if (index !== -1) {
                if (state.items[index].quantity > 1) {
                    state.items[index].quantity -= 1;
                } else {
                    state.items.splice(index, 1);
                }
            }
            state.totalAmount = recalcTotal(state.items);
            saveToStorage(state.items, state.totalAmount);
        },
        purgeInvalidItems: (state) => {
            state.items = state.items.filter(item => !!item.productId && !!item.variantId);
            state.totalAmount = recalcTotal(state.items);
            saveToStorage(state.items, state.totalAmount);
        },
        setCart: (state, action: PayloadAction<CartState>) => {
            state.items = action.payload.items;
            state.totalAmount = action.payload.totalAmount;
            saveToStorage(action.payload.items, action.payload.totalAmount);
        }
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, decrementCart, purgeInvalidItems, setCart } = cartSlice.actions;
export default cartSlice.reducer;