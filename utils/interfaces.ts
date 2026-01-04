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