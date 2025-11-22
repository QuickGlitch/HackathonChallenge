<template>
  <div class="container">
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to Hackathon Store</h1>
        <p>Discover amazing products in our pentesting-focused web shop</p>
        <router-link to="/products" class="btn">Shop Now</router-link>
      </div>
    </section>

    <section class="features">
      <h2>Why Choose Us?</h2>
      <div class="grid grid-3">
        <div class="card">
          <h3>🔒 Security First</h3>
          <p>Built with security testing in mind for educational purposes</p>
        </div>
        <div class="card">
          <h3>🛍️ Easy Shopping</h3>
          <p>Simple and intuitive shopping experience</p>
        </div>
        <div class="card">
          <h3>⚡ Fast Delivery</h3>
          <p>Quick and reliable shipping worldwide</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component logic here
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%);
  color: white;
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 3rem;
  border-radius: 8px;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.features {
  margin-bottom: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.features h3 {
  margin-bottom: 1rem;
  color: #60a5fa;
}
</style>
