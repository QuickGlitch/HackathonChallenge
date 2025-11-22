<template>
  <div class="forum-container">
    <div class="container">
      <h1>Community Forum</h1>

      <!-- New Message Form (only shown when logged in) -->
      <div v-if="authStore.isLoggedIn" class="new-message-form">
        <h3>Post a New Message</h3>
        <form @submit.prevent="createMessage" class="message-form">
          <div class="form-group">
            <label for="title">Title:</label>
            <input
              id="title"
              v-model="newMessage.title"
              type="text"
              placeholder="Enter message title..."
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="body">Message:</label>
            <textarea
              id="body"
              v-model="newMessage.body"
              placeholder="Enter your message..."
              required
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn btn-primary"
          >
            {{ isSubmitting ? "Posting..." : "Post Message" }}
          </button>
        </form>
      </div>

      <!-- Login prompt for anonymous users -->
      <div v-else class="login-prompt">
        <p>
          You must be
          <router-link to="/login" class="link">logged in</router-link> to post
          messages.
        </p>
      </div>

      <!-- Messages List -->
      <div class="messages-section">
        <h3>Recent Messages</h3>

        <div v-if="isLoading" class="loading">Loading messages...</div>

        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div v-else-if="messages.length === 0" class="no-messages">
          No messages yet. Be the first to post!
        </div>

        <div v-else class="messages-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-card"
          >
            <div class="message-header">
              <!-- VULNERABILITY: Raw HTML rendering without sanitization -->
              <!-- This allows XSS attacks through malicious titles -->
              <h4 class="message-title" v-html="message.title"></h4>
              <div class="message-meta">
                <span class="author">by {{ message.author.username }}</span>
                <span class="date">{{ formatDate(message.createdAt) }}</span>
              </div>
            </div>

            <div class="message-body">
              <!-- VULNERABILITY: Raw HTML rendering without sanitization -->
              <!-- This allows XSS attacks through malicious message bodies -->
              <p v-html="message.body"></p>
            </div>

            <!-- Edit/Delete buttons for message author -->
            <div
              v-if="
                authStore.isLoggedIn &&
                (authStore.user.id === message.authorId ||
                  authStore.user.role === 'admin')
              "
              class="message-actions"
            >
              <button
                @click="editMessage(message)"
                class="btn btn-secondary btn-sm"
              >
                Edit
              </button>
              <button
                @click="deleteMessage(message.id)"
                class="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Message Modal -->
      <div v-if="editingMessage" class="modal-overlay" @click="cancelEdit">
        <div class="modal" @click.stop>
          <h3>Edit Message</h3>
          <form @submit.prevent="updateMessage" class="message-form">
            <div class="form-group">
              <label for="edit-title">Title:</label>
              <input
                id="edit-title"
                v-model="editingMessage.title"
                type="text"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-body">Message:</label>
              <textarea
                id="edit-body"
                v-model="editingMessage.body"
                required
                rows="4"
                class="form-textarea"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="btn btn-primary"
              >
                {{ isSubmitting ? "Updating..." : "Update Message" }}
              </button>
              <button
                type="button"
                @click="cancelEdit"
                class="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth.js";
import { apiFetch } from "@/utils/api";

export default {
  name: "Forum",
  setup() {
    const authStore = useAuthStore();
    const messages = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const isSubmitting = ref(false);
    const editingMessage = ref(null);

    const newMessage = ref({
      title: "",
      body: "",
    });

    // Fetch all forum messages
    async function fetchMessages() {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await apiFetch("/api/forum", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        messages.value = await response.json();
      } catch (err) {
        error.value = err.message;
        console.error("Error fetching messages:", err);
      } finally {
        isLoading.value = false;
      }
    }

    // Create a new forum message
    async function createMessage() {
      if (!newMessage.value.title.trim() || !newMessage.value.body.trim()) {
        return;
      }

      isSubmitting.value = true;

      try {
        const response = await apiFetch("/api/forum", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newMessage.value.title,
            body: newMessage.value.body,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create message");
        }

        // Reset form and refresh messages
        newMessage.value = { title: "", body: "" };
        await fetchMessages();
      } catch (err) {
        error.value = err.message;
        console.error("Error creating message:", err);
      } finally {
        isSubmitting.value = false;
      }
    }

    // Edit a message
    function editMessage(message) {
      editingMessage.value = {
        id: message.id,
        title: message.title,
        body: message.body,
      };
    }

    // Update message
    async function updateMessage() {
      if (
        !editingMessage.value.title.trim() ||
        !editingMessage.value.body.trim()
      ) {
        return;
      }

      isSubmitting.value = true;

      try {
        const response = await apiFetch(
          `/api/forum/${editingMessage.value.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: editingMessage.value.title,
              body: editingMessage.value.body,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update message");
        }

        editingMessage.value = null;
        await fetchMessages();
      } catch (err) {
        error.value = err.message;
        console.error("Error updating message:", err);
      } finally {
        isSubmitting.value = false;
      }
    }

    // Cancel edit
    function cancelEdit() {
      editingMessage.value = null;
    }

    // Delete a message
    async function deleteMessage(messageId) {
      if (!confirm("Are you sure you want to delete this message?")) {
        return;
      }

      try {
        const response = await apiFetch(`/api/forum/${messageId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete message");
        }

        await fetchMessages();
      } catch (err) {
        error.value = err.message;
        console.error("Error deleting message:", err);
      }
    }

    // Format date for display
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    // Initialize
    onMounted(() => {
      fetchMessages();
    });

    return {
      authStore,
      messages,
      isLoading,
      error,
      isSubmitting,
      newMessage,
      editingMessage,
      createMessage,
      editMessage,
      updateMessage,
      cancelEdit,
      deleteMessage,
      formatDate,
    };
  },
};
</script>

<style scoped>
.forum-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.new-message-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.new-message-form h3 {
  margin-top: 0;
  color: #333;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.login-prompt {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
  text-align: center;
}

.link {
  color: #007bff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.messages-section h3 {
  margin-bottom: 1.5rem;
  color: #333;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.no-messages {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-card {
  background: rgb(232, 232, 244);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007bff;
}

.message-header {
  margin-bottom: 1rem;
}

.message-title {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
}

.message-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.author {
  font-weight: 600;
}

.message-body {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #444;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .message-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .message-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
