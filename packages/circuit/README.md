# Inro Circuit

## Quick Use

This is a circuit for age verification.
It is used as the backend for the Inro age verification app, which utilizes zero-knowledge proofs. This project uses Noir and Sindri.
For more details, please refer to the [README](../../README.md).

## Author(s)

- [Shingo Takagi](https://www.linkedin.com/in/shingo-takagi-8a017224a/) - Full Stack Developer
- [Susumu Tomita](https://susumutomita.netlify.app/) - Full Stack Developer

## Steps to Generate a Proof

### **Deploy the circuit to Sindri**

```makefile
make deploy
```

### **Generate a Proof**

Use the following sample program.
You can also use the Sindri API to create a [proof](https://sindri.app/docs/reference/api/proof-create/) and verify proof using [proof detail](https://sindri.app/docs/reference/api/proof-detail/).

```sample.js
const process = require("process");
const axios = require("axios");
const toml = require('@iarna/toml');

// NOTE: Provide your API key here.
const API_KEY = process.env.SINDRI_API_KEY || "";
const API_URL_PREFIX = process.env.SINDRI_API_URL || "https://sindri.app/api/";

const API_VERSION = "v1";
const API_URL = API_URL_PREFIX.concat(API_VERSION);

const headersJson = {
  Accept: "application/json",
  Authorization: `Bearer ${API_KEY}`
};

// Utility to poll a detail API endpoint until the status is `Ready` or `Failed`.
// Returns the response object of the final request or throws an error if the timeout is reached.
async function pollForStatus(endpoint, timeout = 20 * 60) {
  for (let i = 0; i < timeout; i++) {
    const response = await axios.get(API_URL + endpoint, {
      headers: headersJson,
      validateStatus: (status) => status === 200,
    });

    const status = response.data.status;
    if (["Ready", "Failed"].includes(status)) {
      console.log(`Poll exited after ${i} seconds with status: ${status}`);
      return response;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error(`Polling timed out after ${timeout} seconds.`);
}

async function main() {
  try {
    const circuitId = "Specify the circuit id";
    // Initiate proof generation.
    console.log("Proving circuit...");
    const proofInput = toml.stringify({ input: 10 });
    const proveResponse = await axios.post(
      API_URL + `/circuit/${circuitId}/prove`,
      { proof_input: proofInput , perform_verify: true},
      { headers: headersJson, validateStatus: (status) => status === 201 },
    );
    const proofId = proveResponse.data.proof_id;

    // Poll the proof detail endpoint until the compilation status is `Ready` or `Failed`.
    const proofDetailResponse = await pollForStatus(`/proof/${proofId}/detail`);

    // Check for proving issues.
    const proofDetailStatus = proofDetailResponse.data.status;
    if (proofDetailStatus === "Failed") {
      throw new Error("Proving failed");
    }

    // Retrieve output from the proof.
    const proverTomlContent = proofDetailResponse.data.proof_input['Prover.toml'];
    const verifierTomlContent = proofDetailResponse.data.public['Verifier.toml'];

    console.log(proverTomlContent);
    console.log(verifierTomlContent);

    const publicOutput = verifierTomlContent;
    console.log(`Circuit proof output signal: ${publicOutput}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred.");
    }
  }
}

if (require.main === module) {
  main();
}
```

## Dependencies

- [Noir](https://noir-lang.org/)
- [Sindri](https://sindri.app/)
