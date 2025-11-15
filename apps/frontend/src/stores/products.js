import { defineStore } from "pinia";
import { ref } from "vue";
import { apiFetch } from "@/utils/api";

export const useProductStore = defineStore("products", () => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchProducts() {
    try {
      loading.value = true;
      error.value = null;
      const response = await apiFetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      products.value = await response.json();
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
      const response = await apiFetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      return await response.json();
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
      const response = await apiFetch(
        `/api/products/search?q=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error("Failed to search products");
      }
      products.value = await response.json();
    } catch (err) {
      error.value = "Failed to search products";
      console.error("Error searching products:", err);
    } finally {
      loading.value = false;
    }
  }

  // Add a method to manually set products (for debug panel)
  function setProducts(newProducts) {
    products.value = newProducts;
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    searchProducts,
    setProducts,
  };
});
