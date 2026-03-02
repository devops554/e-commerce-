import axiosClient from "../lib/axiosClient";

export interface BackendCartItem {
    productId: string;
    variantId: string;
    quantity: number;
    updatedAt?: string;
}

export const cartService = {
    async getCart() {
        const response = await axiosClient.get("/carts");
        return response.data;
    },

    async addItem(productId: string, variantId: string, quantity: number, title?: string, price?: number, image?: string) {
        const response = await axiosClient.post("/carts/items", {
            productId,
            variantId,
            quantity,
            title,
            price,
            image
        });
        return response.data;
    },

    async removeItem(variantId: string) {
        const response = await axiosClient.delete(`/carts/items/${variantId}`);
        return response.data;
    },

    async clearCart() {
        const response = await axiosClient.delete("/carts");
        return response.data;
    },

    async syncCart(items: BackendCartItem[]) {
        const response = await axiosClient.post("/carts/sync", { items });
        return response.data;
    }
};
