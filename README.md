# 🚀 JSON Parser Benchmark — Native vs SIMDJSON

This project benchmarks the performance of **Native `JSON.parse`** against the **C++ SIMD-optimized [`simdjson`](https://github.com/simdjson/simdjson)** parser in Node.js.  

It generates complex synthetic JSON data (with configurable sizes), then measures parsing performance across multiple iterations — showing average, min, max, and median times for each parser.

---

## ⚡ Features

- ✅ Compare `JSON.parse()` vs `simdjson.parse()` performance  
- ✅ Configurable dataset sizes (`small`, `medium`, `large`, `xlarge`)  
- ✅ Detailed statistics (avg, min, max, median, speedup %)  
- ✅ Auto-generated test data with realistic user, post, and comment structures  
- ✅ C++ SIMD-optimized parser integration via [simdjson-node](https://www.npmjs.com/package/simdjson)  
- ✅ Clean CLI output with color-coded results  

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/json-parser-benchmark.git
cd json-parser-benchmark

# Install dependencies
npm install
