import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useProductStore = defineStore("products", () => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const api = axios.create({
    baseURL: "/api",
  });

  async function fetchProducts() {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/products");
      products.value = response.data;
    } catch (err) {
      error.value = "Failed to fetch products";
      console.error("Error fetching products:", err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id) {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (err) {
      error.value = "Failed to fetch product";
      console.error("Error fetching product:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function searchProducts(searchTerm) {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/products/search`, {
        params: { q: searchTerm },
      });
      products.value = response.data;
    } catch (err) {
      error.value = "Failed to search products";
      console.error("Error searching products:", err);
    } finally {
      loading.value = false;
    }
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    searchProducts,
  };
});
