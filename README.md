# SyncSip Monorepo

SyncSip is an innovative app that connects to hardware sensors to provide insights into espresso extractions. It also serves as a brewing diary, allowing users to manage their shot history and brewing equipment.

This monorepo consists of three main directories:
- **App**: A React Native app built with Expo.
- **Backend**: A NestJS-based API server.
- **Docs**: A Docusaurus-based documentation site.

---

## Directory Structure

├── app/       # React Native app

├── backend/   # Backend API server

├── docs/      # Documentation site



---

## App Directory

The `app` directory contains the SyncSip React Native application built with Expo. It integrates BLE (Bluetooth Low Energy) to communicate with espresso hardware sensors and provides a rich user interface for managing brewing data.

### Key Features:
- Connects to BLE-enabled espresso hardware.
- Manages shot history and brewing equipment.
- Visualizes espresso extraction data.

### Scripts
| Command            | Description                              |
|--------------------|------------------------------------------|
| `npm start`        | Start the app in development mode.       |
| `npm run android`  | Run the app on an Android emulator.      |
| `npm run ios`      | Run the app on an iOS simulator.         |
| `npm run web`      | Run the app in a web browser.            |
| `npm run test`     | Run tests using Jest.                    |
| `npm run lint`     | Lint the codebase.                       |
| `npm run generate-api` | Generate API types from OpenAPI spec. |

### Dependencies
- React Native, Expo, React Navigation, D3.js, and more.
- BLE libraries: `react-native-ble-manager`, `react-native-ble-plx`.

---

## Backend Directory

The `backend` directory contains the NestJS-based API server for SyncSip. It provides endpoints for user management, shot data, brewing equipment, and more.

### Key Features:
- RESTful API with OpenAPI documentation.
- PostgreSQL database integration using TypeORM.
- Authentication and authorization with JWT.

### Scripts
| Command                | Description                              |
|------------------------|------------------------------------------|
| `npm run start:dev`    | Start the server in development mode.    |
| `npm run build`        | Build the project.                       |
| `npm run test`         | Run tests using Jest.                    |
| `npm run migration:run`| Run database migrations.                 |

### API Documentation
The API is documented using OpenAPI and is available under `/api`.

### Database Configuration
Environment variables:
- `DB_HOST`: Database host.
- `DB_PORT`: Database port.
- `DB_USERNAME`: Database username.
- `DB_PASSWORD`: Database password.
- `DB_DATABASE`: Database name.

---

## Docs Directory

The `docs` directory contains the SyncSip documentation site built with Docusaurus.

### Key Features:
- Tutorials and guides for using SyncSip.
- Hosted at [SyncSip Docs](https://info.synsip.cloud).

### Scripts
| Command         | Description                              |
|-----------------|------------------------------------------|
| `npm start`     | Start the documentation site locally.    |
| `npm build`     | Build the documentation site.            |
| `npm deploy`    | Deploy the documentation site.           |

---

## Deployment

Deployment is managed through [Coolify](https://coolify.io). The following environments are configured:
- **Production**: Automatically deployed from the `main` branch.
- **Staging**: For testing new features.

---

## Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request.

---

## License

This project is licensed under the **UNLICENSED** license. For more information, see the `LICENSE` file.

---
