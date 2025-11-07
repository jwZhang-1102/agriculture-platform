<template>
  <div id="app">
    <CommonHeader />
    <router-view />
    <Footer />
  </div>
</template>

<script>
import CommonHeader from './components/CommonHeader.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    CommonHeader,
    Footer
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
  background-color: #f8f8f8;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.section-title {
  text-align: center;
  margin: 40px 0 20px;
  color: #2e7d32;
  position: relative;
}

.section-title:after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background-color: #7cb342;
  margin: 10px auto;
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
</style>