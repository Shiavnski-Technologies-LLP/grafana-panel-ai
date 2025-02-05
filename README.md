# 🚀 Grafana Plugin Setup Guide

Welcome to the ultimate guide to setting up your Grafana plugin! Follow these steps to get up and running in no time. 🎯

## 🎯 Prerequisites
Before you begin, make sure you have the following installed:
- 🌍 [Node.js](https://nodejs.org/) (Recommended: Latest LTS version)
- 📊 [Grafana](https://grafana.com/grafana/download/)

## 🛠 Installation Steps

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Shiavnski-Technologies-LLP/grafana-panel-ai.git
cd grafana-panel-ai
```

### 2️⃣ Install Dependencies
Jump into both the `plugin` and `backend` directories and install the necessary packages:

```sh
cd plugin
npm install
cd ../backend
npm install
```

## 🚀 Running the Application

### 1️⃣ Start the Grafana Server
Head over to the `plugin` directory and fire up the server:
```sh
npm run server
```

### 2️⃣ Start the Plugin
Inside the `plugin` directory, launch the development mode:
```sh
npm run dev
```

### 3️⃣ Start the Backend Server
Finally, start the backend by running:
```sh
cd backend
npm run start
```

## 🌐 Accessing Grafana
Once all services are up and running, open Grafana in your favorite browser:
```
http://localhost:3000
```
Log in and configure your plugin as per your requirements. 🎨

## 🛠 Troubleshooting Tips
- Make sure both the backend and plugin servers are running smoothly.
- Need insights? Check the logs:
  ```sh
  npm run server --verbose  # Grafana server logs
  npm run dev --verbose     # Plugin logs
  npm run start --verbose   # Backend logs
  ```

## 🤝 Contributing
Want to make this plugin even better? Feel free to open issues or submit pull requests. We’d love your help! 💡

## 📜 License
This project is licensed under the [MIT License](LICENSE). 🚀

