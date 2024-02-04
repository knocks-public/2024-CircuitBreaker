[![CI](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/ci.yml)![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/knocks-public/2024-CircuitBreaker)![GitHub top language](https://img.shields.io/github/languages/top/knocks-public/2024-CircuitBreaker)![GitHub pull requests](https://img.shields.io/github/issues-pr/knocks-public/2024-CircuitBreaker)![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/knocks-public/2024-CircuitBreaker)![GitHub repo size](https://img.shields.io/github/repo-size/knocks-public/2024-CircuitBreaker)[![Tryvy](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/trivy.yml/badge.svg?branch=main)](https://github.com/knocks-public/2024-CircuitBreaker/actions/workflows/trivy.yml)

# Inro

`Inro` is a cutting-edge application focused on digital identity verification and privacy preservation. Developed during the `2024-CircuitBreaker` hackathon, `Inro` aims to address the societal need for secure age verification processes in online services, adult content access control, and more, without compromising user privacy.

## Features

- **Privacy-preserving Age Verification**: Offers the capability to verify a user's age without disclosing any personal information.
- **Secure and Simple Verification Process**: Provides a secure and user-friendly interface for quick age verification.
- **Cross-platform Compatibility**: Utilizes React Native and TypeScript for compatibility across iOS and Android devices.

## Technology Stack

- React Native
- TypeScript
- Expo
- Noir
- Sindri API for Zero-Knowledge Proof generation

## Getting Started

Follow these steps to run the project locally:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/knocks-public/2024-CircuitBreaker.git
   ```

2. **Install Dependencies**

   ```bash
   make install
   ```

3. **Deploy Circuit**

   ```bash
   make deploy_circuit
   ```

4. **Start the Application**

   ```bash
   make run_frontend
   ```

## Environment Configuration

Ensure the following environment variables are set up for the project to function correctly:

### packages/frontend

copy .env_sample to .env and modify it.

- `EXPO_PUBLIC_SINDRI_API_KEY`: Your Sindri API key.
- `EXPO_PUBLIC_SINDRI_API_URL`: The URL for the Sindri API.
- `EXPO_PUBLIC_CIRCUIT_ID`: The circuit ID for the zero-knowledge proof.
- `LOCAL_IP_ADDR`: Your local IP address (necessary for running Expo in Docker+docker-compose environments).

## Future Prospects

`Inro` is envisioned to revolutionize several aspects of digital identity verification:

1. **Automated Age Verification in Bars**: Streamlines the age verification process in bars and similar establishments, enhancing operational efficiency.
2. **Enhanced eKYC Process**: Automates the eKYC process, significantly reducing initial setup costs from hundreds of thousands to millions of yen, eliminating waiting times for account openings such as securities accounts that previously required manual verification, and reducing labor costs associated with verification tasks.

These applications are particularly valuable as the importance of digital identity management and privacy protection grows in modern society.

## Contribution

Contributions to the project are welcome. Please share your proposals via pull requests or issues before contributing.

## License

This project is released under the [MIT License](LICENSE).
