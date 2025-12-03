<template>
  <div class="reseller-page">
    <div class="container">
      <h1>Become a Reseller</h1>

      <!-- Check if user is logged in -->
      <div
v-if="!authStore.isLoggedIn"
class="login-prompt"
>
        <div class="alert alert-info">
          <h2>Login Required</h2>
          <p>You must be logged in to sell your own products.</p>
          <router-link
to="/login"
class="btn btn-primary"
>
Login
</router-link>
          <p class="mt-3">
            Don't have an account?
            <router-link to="/register">
Register here
</router-link>
          </p>
        </div>
      </div>

      <!-- Reseller content for logged-in users -->
      <div
v-else
class="reseller-content"
>
        <div class="intro-section">
          <h2>Sell Your Products</h2>
          <p>
            Would you like to sell your own products in our marketplace? Fill
            out the form below to add your product to our store.
          </p>
        </div>

        <!-- Success message -->
        <div
v-if="showSuccess"
class="alert alert-success"
>
          <h3>✅ Product Added Successfully!</h3>
          <p>
            Your product has been registered and is now available in the store.
          </p>
          <button
class="btn btn-primary"
@click="resetForm"
>
            Add Another Product
          </button>
        </div>

        <!-- Product registration form -->
        <div
v-if="!showSuccess"
class="product-form"
>
          <h3>Add Your Product</h3>

          <form
class="form"
@submit.prevent="submitProduct"
>
            <div class="form-group">
              <label for="productName">Product Name *</label>
              <input
                id="productName"
                v-model="form.name"
                type="text"
                required
                maxlength="100"
                class="form-control"
                placeholder="Enter product name"
              >
            </div>

            <div class="form-group">
              <label for="productDescription">Product Description *</label>
              <textarea
                id="productDescription"
                v-model="form.description"
                required
                maxlength="500"
                rows="4"
                class="form-control"
                placeholder="Describe your product"
              />
            </div>

            <div class="form-group">
              <label for="productPrice">Price (USD) *</label>
              <input
                id="productPrice"
                v-model="form.price"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="form-control"
                placeholder="0.00"
              >
            </div>

            <div class="form-group">
              <label for="productImage">Product Image</label>
              <input
                id="productImage"
                type="file"
                accept="image/*"
                class="form-control"
                @change="handleImageChange"
              >
              <small class="form-text">
                Optional. Supported formats: JPG, PNG, GIF. Max size: 5MB
              </small>
            </div>

            <!-- Image preview -->
            <div
v-if="imagePreview"
class="image-preview"
>
              <h4>Image Preview:</h4>
              <img
:src="imagePreview"
alt="Product preview"
>
            </div>

            <!-- Error message -->
            <div
v-if="error"
class="alert alert-error"
>
              {{ error }}
            </div>

            <!-- Submit button -->
            <div class="form-actions">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="btn btn-primary btn-large"
              >
                {{
                  isSubmitting ? 'Adding Product...' : 'Add Product to Store'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { apiFetch } from '@/utils/api';

const authStore = useAuthStore();

// Form data
const form = reactive({
  name: '',
  description: '',
  price: '',
});

// Component state
const isSubmitting = ref(false);
const error = ref('');
const showSuccess = ref(false);
const imagePreview = ref('');
const selectedFile = ref(null);

// Handle image file selection
function handleImageChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    selectedFile.value = null;
    imagePreview.value = '';
  }
}

// Submit product form
async function submitProduct() {
  isSubmitting.value = true;
  error.value = '';

  try {
    let imageUrl = '';

    // Upload image first if selected
    if (selectedFile.value) {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedFile.value);

      const uploadResponse = await apiFetch('/api/upload-image', {
        method: 'POST',
        body: imageFormData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }

      imageUrl = uploadData.url;
    }

    // Create product with image URL
    const productData = {
      name: form.name,
      description: form.description,
      price: form.price,
      image: imageUrl,
    };

    const response = await apiFetch('/api/products/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess.value = true;
    } else {
      error.value = data.error || 'Failed to add product';
    }
  } catch (err) {
    error.value = 'Network error. Please try again.';
    console.error('Product registration error:', err);
  } finally {
    isSubmitting.value = false;
  }
}

// Reset form
function resetForm() {
  form.name = '';
  form.description = '';
  form.price = '';
  form.category = 'General';
  selectedFile.value = null;
  imagePreview.value = '';
  showSuccess.value = false;
  error.value = '';
}
</script>

<style scoped>
.reseller-page {
  min-height: 80vh;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1,
h2,
h3 {
  color: #333;
  margin-bottom: 1rem;
}

.login-prompt {
  text-align: center;
  padding: 2rem;
}

.alert {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.alert-info {
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  color: #1976d2;
}

.alert-success {
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  color: #2e7d32;
}

.alert-error {
  background-color: #ffebee;
  border: 1px solid #f44336;
  color: #c62828;
}

.intro-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.product-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.form-text {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.image-preview {
  margin-bottom: 1.5rem;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background-color: #60a5fa;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a67d8;
}

.btn-primary:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
