import { runVerification } from "./benchmarks.ts"
import { runDeepVerification } from "./deep.ts"
import { runMeshStudy, solvePlateFem, type FemInput } from "./fem.ts"

type Job =
  | { op: "solve"; input: FemInput }
  | { op: "study"; input: FemInput; sizes?: number[]; grids?: { nx: number; ny: number }[]; tolerance?: number }
  | { op: "verify" }
  | { op: "verify-full" }

self.onmessage = (event: MessageEvent<Job>) => {
  const job = event.data
  if (!job || typeof job !== "object" || !("op" in job)) {
    self.postMessage({ op: "solve", result: { ok: false, reason: "The solver worker expects { op, input }.", modes: [] } })
    return
  }
  if (job.op === "study") {
    self.postMessage({ op: "study", study: runMeshStudy(job.input, job.sizes, job.grids, job.tolerance) })
    return
  }
  if (job.op === "verify") {
    self.postMessage({ op: "verify", rows: runVerification() })
    return
  }
  if (job.op === "verify-full") {
    self.postMessage({ op: "verify", rows: [...runVerification(), ...runDeepVerification()] })
    return
  }
  self.postMessage({ op: "solve", result: solvePlateFem(job.input) })
}