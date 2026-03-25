import type { Connection } from "@solana/web3.js";

let _instance: Connection | null = null;
let _rpc: string | null = null;

export const getConnectionCache = () => ({ instance: _instance, rpc: _rpc });

export const setConnectionCache = (
  instance: Connection | null,
  rpc: string | null
) => {
  _instance = instance;
  _rpc = rpc;
};

export const invalidateConnection = () => {
  _instance = null;
  _rpc = null;
};
