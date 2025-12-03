<template>
  <div class="home">
    <section class="hero">
      <div class="hero-overlay" />
      <div class="hero-content">
        <div class="hero-text">
          <h1>Your One-Stop Shop for Quality Products</h1>
          <p>
            Discover curated selections from trusted sellers worldwide. Fast,
            secure, and reliable.
          </p>
          <div class="hero-buttons">
            <router-link to="/products" class="btn-primary">
              Explore Products
            </router-link>
            <router-link to="/register" class="btn-secondary">
              Become a Seller
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">10+</div>
            <div class="stat-label">Products</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">5+</div>
            <div class="stat-label">Happy Customers</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">Uptime locally</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24*/7**</div>
            <div class="stat-label">Support***</div>
          </div>
        </div>
      </div>
    </section>

    <section class="pen-shop">
      <h3 class="news">News</h3>
      <div class="pen-shop-content">
        <div class="pen-shop-image">
          <img
            src="https://images.unsplash.com/photo-1531087131490-07836ca4341d?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Pen Testing"
          />
        </div>
        <div class="pen-shop-text">
          <div class="pen-badge">Coming Soon</div>
          <h2>Not all pens are created equal</h2>
          <p>
            As part of his upcoming pop-up store, join renowned pen designer
            Francois Stylo as he rigorously tests and reviews the finest writing
            instruments. Each pen undergoes extensive testing to ensure optimal
            ink flow, durability, and performance. #pentesting
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Component logic here
</script>

<style scoped>
.home {
  margin: 0;
  padding: 0;
}

.hero {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('https://images.unsplash.com/photo-1736244424560-8bb764133c72?q=80&w=1800&auto=format&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  /* background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%); */
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 20% 50%,
      rgba(96, 165, 250, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(30, 58, 138, 0.1) 0%,
      transparent 50%
    );
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.3) 0%,
    rgba(30, 58, 138, 0.5) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.hero-text {
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero p {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: white;
  color: #1e3a8a;
  font-weight: 600;
  font-size: 1.125rem;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: #f8fafc;
}

.btn-secondary {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.stats {
  padding: 4rem 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  text-align: center;
}

.stat-item {
  padding: 1rem;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.stat-label {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pen-shop {
  background: #fff;
  overflow: hidden;
}

.news {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 4rem 0 2rem 0;
  color: #1e3a8a;
}

.pen-shop-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1400px;
  margin: 0 auto;
}

.pen-shop-image {
  position: relative;
  min-height: 500px;
  overflow: hidden;
}

.pen-shop-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.pen-shop-text {
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
}

.pen-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #1e3a8a;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  width: fit-content;
}

.pen-shop-text h2 {
  font-size: 2.75rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.pen-shop-text p {
  font-size: 1.125rem;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .hero p {
    font-size: 1.125rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .pen-shop-content {
    grid-template-columns: 1fr;
  }

  .pen-shop-image {
    min-height: 300px;
  }

  .pen-shop-text {
    padding: 3rem 2rem;
  }

  .pen-shop-text h2 {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 2.5rem;
  }

  .stats-grid {
    gap: 2rem;
  }
}
</style>
