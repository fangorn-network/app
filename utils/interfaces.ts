interface Secret {
  label: string;
  cid: string;
}

interface SelectedSecret extends Secret {
  index: number;
}

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

enum StorageProvider {
  Storacha = 0,
  Pinata = 1,
  IPFS = 2,
  Other = 3,
}

interface VaultEntry {
  cid: string;
  tag: string;
  provider: StorageProvider;
  createdAt: bigint;
}
