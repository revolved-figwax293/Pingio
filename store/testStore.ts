import { create } from "zustand";
import { TestPhase, SpeedDataPoint, LatencyDataPoint, TestResult } from "@/types";

interface TestState {
  // Phase
  phase: TestPhase;
  setPhase: (phase: TestPhase) => void;

  // Live data
  currentDownload: number;
  currentUpload: number;
  currentPing: number;
  currentJitter: number;
  progress: number;

  downloadSamples: SpeedDataPoint[];
  uploadSamples: SpeedDataPoint[];
  latencySamples: LatencyDataPoint[];

  peakDownload: number;
  peakUpload: number;

  // Final result
  lastResult: TestResult | null;

  // History
  history: TestResult[];

  // Actions
  startTest: () => void;
  updatePing: (ping: number, jitter: number, samples: LatencyDataPoint[]) => void;
  updateDownload: (speed: number, samples: SpeedDataPoint[], progress: number) => void;
  updateUpload: (speed: number, samples: SpeedDataPoint[], progress: number) => void;
  completeTest: (result: TestResult) => void;
  resetTest: () => void;
  setHistory: (history: TestResult[]) => void;
  addToHistory: (result: TestResult) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  phase: "idle",
  setPhase: (phase) => set({ phase }),

  currentDownload: 0,
  currentUpload: 0,
  currentPing: 0,
  currentJitter: 0,
  progress: 0,
  peakDownload: 0,
  peakUpload: 0,

  downloadSamples: [],
  uploadSamples: [],
  latencySamples: [],

  lastResult: null,
  history: [],

  startTest: () =>
    set({
      phase: "ping",
      currentDownload: 0,
      currentUpload: 0,
      currentPing: 0,
      currentJitter: 0,
      progress: 0,
      peakDownload: 0,
      peakUpload: 0,
      downloadSamples: [],
      uploadSamples: [],
      latencySamples: [],
      lastResult: null,
    }),

  updatePing: (ping, jitter, samples) =>
    set({
      phase: "download",
      currentPing: ping,
      currentJitter: jitter,
      latencySamples: samples,
    }),

  updateDownload: (speed, samples, progress) =>
    set((state) => ({
      phase: "download",
      currentDownload: speed,
      downloadSamples: samples,
      progress,
      peakDownload: Math.max(state.peakDownload, speed),
    })),

  updateUpload: (speed, samples, progress) =>
    set((state) => ({
      phase: "upload",
      currentUpload: speed,
      uploadSamples: samples,
      progress,
      peakUpload: Math.max(state.peakUpload, speed),
    })),

  completeTest: (result) =>
    set((state) => ({
      phase: "complete",
      lastResult: result,
      progress: 100,
      currentDownload: result.download,
      currentUpload: result.upload,
      currentPing: result.ping,
      currentJitter: result.jitter,
      history: [result, ...state.history].slice(0, 10),
    })),

  resetTest: () =>
    set({
      phase: "idle",
      currentDownload: 0,
      currentUpload: 0,
      currentPing: 0,
      currentJitter: 0,
      progress: 0,
      peakDownload: 0,
      peakUpload: 0,
      downloadSamples: [],
      uploadSamples: [],
      latencySamples: [],
      lastResult: null,
    }),

  setHistory: (history) => set({ history }),
  addToHistory: (result) =>
    set((state) => ({ history: [result, ...state.history] })),
  removeFromHistory: (id) =>
    set((state) => ({ history: state.history.filter((r) => r.id !== id) })),
  clearHistory: () => set({ history: [] }),
}));
