interface CircuitState {
  failures: number;
  lastFailure: number;
  state: "closed" | "open" | "half-open";
}

const THRESHOLD = 5;
const RESET_TIMEOUT = 60_000;
const HALF_OPEN_TIMEOUT = 30_000;

const circuits = new Map<string, CircuitState>();

function getCircuit(name: string): CircuitState {
  let circuit = circuits.get(name);
  if (!circuit) {
    circuit = { failures: 0, lastFailure: 0, state: "closed" };
    circuits.set(name, circuit);
  }
  return circuit;
}

export function isCircuitOpen(name: string): boolean {
  const circuit = getCircuit(name);
  if (circuit.state === "closed") return false;
  if (circuit.state === "open") {
    if (Date.now() - circuit.lastFailure > RESET_TIMEOUT) {
      circuit.state = "half-open";
      return false;
    }
    return true;
  }
  return false;
}

export function recordSuccess(name: string): void {
  const circuit = getCircuit(name);
  circuit.failures = 0;
  circuit.state = "closed";
}

export function recordFailure(name: string): void {
  const circuit = getCircuit(name);
  circuit.failures++;
  circuit.lastFailure = Date.now();
  if (circuit.failures >= THRESHOLD) {
    circuit.state = "open";
  }
}

export function resetCircuit(name: string): void {
  circuits.delete(name);
}
