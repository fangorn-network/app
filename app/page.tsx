"use client";
import { useState, useEffect } from "react";
import { useQuickAuth,useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { minikitConfig } from "../minikit.config";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number; // FID is the unique identifier for the user
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string; // Error messages come as 'message' not 'error'
}

// Type definitions
interface Secret {
  label: string;
  username: string;
  password: string;
}

interface SelectedSecret extends Secret {
  index: number;
}

// Mock backend API calls
const mockAPI = {
  createVault: async (password: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, vaultId: 'vault_' + Date.now() };
  },
  verifyPassword: async (vaultId: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, secrets: [] as Secret[] };
  },
  addSecret: async (vaultId: string, label: string, username: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  }
};

export default function BaseVaultApp() {
  const [screen, setScreen] = useState('home');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vaultId, setVaultId] = useState('');
  const [secretLabel, setSecretLabel] = useState('');
  const [secretUsername, setSecretUsername] = useState('');
  const [secretPassword, setSecretPassword] = useState('');
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [selectedSecret, setSelectedSecret] = useState<SelectedSecret | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetCreateVault = () => {
    setPassword('');
    setConfirmPassword('');
  };

  const resetAddSecret = () => {
    setSecretLabel('');
    setSecretUsername('');
    setSecretPassword('');
  };

  const handleCreateVault = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setScreen('creating');
    setIsLoading(true);
    const result = await mockAPI.createVault(password);
    setIsLoading(false);
    if (result.success) {
      setVaultId(result.vaultId);
      setScreen('vault-created');
    }
  };

  const handleAccessVault = async () => {
    setScreen('verifying');
    setIsLoading(true);
    const result = await mockAPI.verifyPassword(vaultId, password);
    setIsLoading(false);
    if (result.success) {
      setSecrets(result.secrets);
      setScreen('your-vault');
    }
  };

  const handleAddSecret = async () => {
    setScreen('saving-secret');
    setIsLoading(true);
    const result = await mockAPI.addSecret(vaultId, secretLabel, secretUsername, secretPassword);
    setIsLoading(false);
    if (result.success) {
      setSecrets([...secrets, { label: secretLabel, username: secretUsername, password: secretPassword }]);
      setScreen('secret-added');
      resetAddSecret();
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDeleteSecret = (index: number) => {
    const newSecrets = secrets.filter((_, i) => i !== index);
    setSecrets(newSecrets);
    setScreen('your-vault');
  };

  // Home Screen
  if (screen === 'home') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-8">
          <div className="text-center">
            <h1 className="page-title">🔐 Base Vault</h1>
            <p className="subtitle">Secure your secrets on Base blockchain</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => { resetCreateVault(); setScreen('create-password'); }}
              className="btn-primary-lg"
            >
              Create Vault
            </button>
            
            <button
              onClick={() => { setPassword(''); setScreen('access-password'); }}
              className="btn-secondary-lg"
            >
              Access Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create Vault Flow
  if (screen === 'create-password') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Create Your Vault Password</h2>
          
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password"
            />
          </div>

          <div className="btn-group">
            <button
              onClick={() => setScreen('home')}
              className="btn-flex btn-neutral"
            >
              Back
            </button>
            <button
              onClick={() => setScreen('confirm-password')}
              disabled={!password}
              className="btn-flex btn-primary"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'confirm-password') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Confirm Your Password</h2>
          
          <div>
            <label className="form-label">Re-enter Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm password"
            />
          </div>

          <div className="btn-group">
            <button
              onClick={() => setScreen('create-password')}
              className="btn-flex btn-neutral"
            >
              Back
            </button>
            <button
              onClick={handleCreateVault}
              disabled={!confirmPassword}
              className="btn-flex btn-primary"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'creating') {
    return (
      <div className="screen-container">
        <div className="content-wrapper text-center space-y-6">
          <div className="spinner"></div>
          <h2 className="section-title">Creating your vault...</h2>
          <p className="subtitle">Deploying to Base</p>
        </div>
      </div>
    );
  }

  if (screen === 'vault-created') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <div className="text-center">
            <div className="icon-lg">✅</div>
            <h2 className="section-title">Vault Created!</h2>
            <p className="vault-id">
              {vaultId}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setScreen('add-to-vault')}
              className="btn-primary"
            >
              Add Secret
            </button>
            <button
              onClick={() => handleCopyToClipboard(vaultId)}
              className="btn-secondary"
            >
              Copy Link
            </button>
            <button
              onClick={() => { resetCreateVault(); setScreen('home'); }}
              className="btn-neutral"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access Vault Flow
  if (screen === 'access-password') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Access Your Vault</h2>
          
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password"
            />
          </div>

          <div className="btn-group">
            <button
              onClick={() => setScreen('home')}
              className="btn-flex btn-neutral"
            >
              Back
            </button>
            <button
              onClick={handleAccessVault}
              disabled={!password}
              className="btn-flex btn-primary"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'verifying') {
    return (
      <div className="screen-container">
        <div className="content-wrapper text-center space-y-6">
          <div className="spinner"></div>
          <h2 className="section-title">Verifying...</h2>
        </div>
      </div>
    );
  }

  if (screen === 'your-vault') {
    return (
      <div className="screen-container-top">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Your Vault</h2>
          
          <div className="card space-y-2">
            {secrets.length === 0 ? (
              <p className="empty-state">No secrets stored yet</p>
            ) : (
              secrets.map((secret, index) => (
                <button
                  key={index}
                  onClick={() => { setSelectedSecret({ ...secret, index }); setScreen('view-secret'); }}
                  className="secret-item"
                >
                  <div className="secret-item-label">{secret.label}</div>
                </button>
              ))
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setScreen('add-to-vault')}
              className="btn-primary"
            >
              Add
            </button>
            <button
              onClick={() => alert('Export functionality coming soon')}
              className="btn-secondary"
            >
              Export
            </button>
            <button
              onClick={() => { setPassword(''); setScreen('home'); }}
              className="btn-neutral"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'view-secret') {
    return (
      <div className="screen-container-top">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">{selectedSecret?.label}</h2>
          
          <div className="card-lg space-y-4">
            <div>
              <label className="form-label">Username</label>
              <div className="display-field">
                {selectedSecret?.username || 'N/A'}
              </div>
            </div>
            
            <div>
              <label className="form-label">Password</label>
              <div className="display-field-mono">
                {selectedSecret?.password}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() =>{ 
                if (selectedSecret?.password){
                  handleCopyToClipboard(selectedSecret?.password)
                }
            }}
              className="btn-primary"
            >
              Copy
            </button>
            <button
              onClick={() => {
                if (selectedSecret?.password){
                  handleDeleteSecret(selectedSecret?.index)
                }
              }}
              className="btn-danger"
            >
              Delete
            </button>
            <button
              onClick={() => setScreen('your-vault')}
              className="btn-neutral"
            >
              Back to Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add Secret Flow
  if (screen === 'add-to-vault') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Add to Vault</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => setScreen('add-password-label')}
              className="btn-primary-lg"
            >
              Password
            </button>
            <button
              onClick={() => setScreen(vaultId ? 'your-vault' : 'vault-created')}
              className="btn-neutral-lg"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'add-password-label') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Add Password Tag</h2>
          
          <div>
            <label className="form-label">Label</label>
            <input
              type="text"
              value={secretLabel}
              onChange={(e) => setSecretLabel(e.target.value)}
              className="input-field"
              placeholder="e.g., Gmail, Facebook, etc."
            />
          </div>

          <div className="btn-group">
            <button
              onClick={() => setScreen('add-to-vault')}
              className="btn-flex btn-neutral"
            >
              Back
            </button>
            <button
              onClick={() => setScreen('add-password-entry')}
              disabled={!secretLabel}
              className="btn-flex btn-primary"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'add-password-entry') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <h2 className="section-title">Add Password Entry</h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Username/Email</label>
              <input
                type="text"
                value={secretUsername}
                onChange={(e) => setSecretUsername(e.target.value)}
                className="input-field"
                placeholder="Enter username or email"
              />
            </div>
            
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={secretPassword}
                onChange={(e) => setSecretPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="btn-group">
            <button
              onClick={() => setScreen('add-password-label')}
              className="btn-flex btn-neutral"
            >
              Back
            </button>
            <button
              onClick={handleAddSecret}
              disabled={!secretPassword}
              className="btn-flex btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'secret-added') {
    return (
      <div className="screen-container">
        <div className="content-wrapper space-y-6">
          <div className="text-center">
            <div className="icon-lg">🎉</div>
            <h2 className="section-title">Secret Added!</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { resetAddSecret(); setScreen('add-password-label'); }}
              className="btn-primary"
            >
              Add Another
            </button>
            <button
              onClick={() => setScreen('your-vault')}
              className="btn-neutral"
            >
              View Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// export default function Home() {
//   const { isFrameReady, setFrameReady, context } = useMiniKit();
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   // Initialize the  miniapp
//   useEffect(() => {
//     if (!isFrameReady) {
//       setFrameReady();
//     }
//   }, [setFrameReady, isFrameReady]);
 
  

//   // If you need to verify the user's identity, you can use the useQuickAuth hook.
//   // This hook will verify the user's signature and return the user's FID. You can update
//   // this to meet your needs. See the /app/api/auth/route.ts file for more details.
//   // Note: If you don't need to verify the user's identity, you can get their FID and other user data
//   // via `context.user.fid`.
//   // const { data, isLoading, error } = useQuickAuth<{
//   //   userFid: string;
//   // }>("/api/auth");

//   const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
//     "/api/auth",
//     { method: "GET" }
//   );

//   const validateEmail = (email: string) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     // Check authentication first
//     if (isAuthLoading) {
//       setError("Please wait while we verify your identity...");
//       return;
//     }

//     if (authError || !authData?.success) {
//       setError("Please authenticate to join the waitlist");
//       return;
//     }

//     if (!email) {
//       setError("Please enter your email address");
//       return;
//     }

//     if (!validateEmail(email)) {
//       setError("Please enter a valid email address");
//       return;
//     }

//     // TODO: Save email to database/API with user FID
//     console.log("Valid email submitted:", email);
//     console.log("User authenticated:", authData.user);
    
//     // Navigate to success page
//     router.push("/success");
//   };

//   return (
//     <div className={styles.container}>
//       <button className={styles.closeButton} type="button">
//         ✕
//       </button>
      
//       <div className={styles.content}>
//         <div className={styles.waitlistForm}>
//           <h1 className={styles.title}>Join {minikitConfig.miniapp.name.toUpperCase()}</h1>
          
//           <p className={styles.subtitle}>
//              Hey {context?.user?.displayName || "there"}, Get early access and be the first to experience the future of<br />
//             crypto marketing strategy.
//           </p>

//           <form onSubmit={handleSubmit} className={styles.form}>
//             <input
//               type="email"
//               placeholder="Your amazing email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className={styles.emailInput}
//             />
            
//             {error && <p className={styles.error}>{error}</p>}
            
//             <button type="submit" className={styles.joinButton}>
//               JOIN WAITLIST
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
