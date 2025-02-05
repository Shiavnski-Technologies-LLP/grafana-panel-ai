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
Run the following command in the root folder to install all dependencies at once:
```sh
npm run install:all
```

## 🚀 Running the Application

### 1️⃣ Start the Plugin (Grafana Server + Plugin Dev Mode)
Run the following command in the root folder to start both the Grafana server and the plugin:
```sh
npm run start:plugin
```

### 2️⃣ Start the Backend Server
Run the following command in the root folder to start the backend server:
```sh
npm run start:backend
```

### 3️⃣ Start Everything Together (Grafana Server + Plugin + Backend)
To start everything at once, run:
```sh
npm run start:all
```

## 🌐 Accessing Grafana
Once all services are up and running, open Grafana in your favorite browser:
```
http://localhost:3000
```
Log in and configure your plugin as per your requirements. 🎨

## 🤝 Contributing
Want to make this plugin even better? Feel free to open issues or submit pull requests. We’d love your help! 💡

## 📜 License
This project is licensed under the [MIT License](LICENSE). 🚀

