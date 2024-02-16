[![CI](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/ci.yml)
![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/knocks-public/2024-CircuitBreaker)
![GitHub top language](https://img.shields.io/github/languages/top/knocks-public/2024-CircuitBreaker)
![GitHub pull requests](https://img.shields.io/github/issues-pr/knocks-public/2024-CircuitBreaker)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/knocks-public/2024-CircuitBreaker)
![GitHub repo size](https://img.shields.io/github/repo-size/knocks-public/2024-CircuitBreaker)
[![Tryvy](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/trivy.yml/badge.svg?branch=main)](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/trivy.yml)
[![codecov](https://codecov.io/gh/susumutomita/2024-CircuitBreaker/graph/badge.svg?token=B6oad5yfuL)](https://codecov.io/gh/susumutomita/2024-CircuitBreaker)

# Inro

<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center">
  <img src="./packages/frontend/assets/icon.png" width="200" height="200" />
</div>

`Inro` is a state-of-the-art application dedicated to digital identity verification and privacy preservation. Created during the `2024-CircuitBreaker` hackathon, `Inro` seeks to fulfill the societal demand for a secure age verification mechanism in online platforms, adult content access control, among others, without sacrificing user privacy.

## Use Cases

`Inro` facilitates age verification without revealing personal information, making it ideal for bars, rental shops, and similar establishments. The process is simplified into four steps:

### For Users:

- **Scan Your ID**: Currently supports only the MyNumber Card (a government-issued ID card in Japan).
- **Show the QR Code**: Display the QR code generated through the Inro app.

### For Verifiers (e.g., Bar Owners):

- **Scan QR Code**: Use the app to scan the QR code presented.
- **Check Verification Result**: Verify the age without accessing any additional personal information.

## Features

- **Privacy-preserving Age Verification**: Enables age verification without disclosing personal details.
- **Secure and User-friendly Verification Process**: Offers a secure, straightforward interface for quick age verification.
- **Cross-platform Compatibility**: Developed using React Native and TypeScript for seamless operation across iOS and Android devices. (Currently supports iOS only)

## Technology Stack

- **Frontend**: React Native, TypeScript, employing Expo for NFC card scanning via Expo's Native Modules.
- **Backend**: Utilizes the Sindri API for zero-knowledge proof generation and the Noir proving system for age verification logic.

## How It's Made

Inro prioritizes privacy, security, and simplicity. The backend leverages the Sindri API for zero-knowledge proofs, with Noir for crafting age verification logic, ensuring only necessary age information is verified. The frontend uses modern JavaScript frameworks, including React Native, for a smooth, cross-platform user experience. The integration of Expo's Native Modules for NFC card scanning exemplifies Inro's innovative use of technology.

## Getting Started

To run Inro locally, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/knocks-public/2024-CircuitBreaker.git
   ```

2. **Install Dependencies**:

   ```bash
   make install
   ```

3. **Deploy Circuit**:

   ```bash
   make deploy_circuit
   ```

4. **Build the Application**:
   Navigate to `packages/frontend`, then:

   ```bash
   npm run prebuild
   npm run ios
   ```

   Open Xcode with `2024-CircuitBreaker/packages/frontend/ios/frontend.xcodeproj`.

5. **Start the Application**:
   For development, initiate the Expo development server:

   ```bash
   cd packages/frontend
   npm run start:dev
   ```

## Environment Configuration

Set up the following environment variables:

### packages/frontend

Copy `.env_sample` to `.env` and adjust as necessary:

- `EXPO_PUBLIC_SINDRI_API_KEY`: Your Sindri API key.
- `EXPO_PUBLIC_SINDRI_API_URL`: The Sindri API URL.
- `EXPO_PUBLIC_CIRCUIT_ID`: Your circuit ID for zero-knowledge proofs.
- `LOCAL_IP_ADDR`: Your local IP address (for Expo in Docker+docker-compose setups).

## Future Prospects

`Inro` aims

 to revolutionize digital identity verification by:

1. **Automating Age Verification in Bars**: Enhancing efficiency by streamlining the age verification process.
2. **Improving the eKYC Process**: Significantly reducing costs and waiting times for account openings, thereby lowering labor costs associated with manual verifications.

Such innovations are increasingly crucial as the need for robust digital identity management and privacy protection grows.

## Contribution

We welcome contributions. Please submit proposals via pull requests or issues.

## License

`Inro` is licensed under the [MIT License](LICENSE).
