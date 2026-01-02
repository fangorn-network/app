"use client";
import { useState, useEffect } from "react";
import { useQuickAuth,useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

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

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDeleteSecret = (index) => {
    const newSecrets = secrets.filter((_, i) => i !== index);
    setSecrets(newSecrets);
    setScreen('your-vault');
  };

  // Home Screen
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">🔐 Base Vault</h1>
            <p className="text-gray-600">Secure your secrets on Base blockchain</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => { resetCreateVault(); setScreen('create-password'); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Create Vault
            </button>
            
            <button
              onClick={() => { setPassword(''); setScreen('access-password'); }}
              className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-6 rounded-xl border-2 border-blue-600 shadow-lg transition-all transform hover:scale-105"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">Create Your Vault Password</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter password"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('home')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setScreen('confirm-password')}
              disabled={!password}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">Confirm Your Password</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Re-enter Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Confirm password"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('create-password')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={handleCreateVault}
              disabled={!confirmPassword}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-bold text-blue-900">Creating your vault...</h2>
          <p className="text-gray-600">Deploying to Base</p>
        </div>
      </div>
    );
  }

  if (screen === 'vault-created') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Vault Created!</h2>
            <p className="text-sm text-gray-600 break-all bg-gray-100 p-3 rounded-lg">
              {vaultId}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setScreen('add-to-vault')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Add Secret
            </button>
            <button
              onClick={() => handleCopyToClipboard(vaultId)}
              className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 transition-all"
            >
              Copy Link
            </button>
            <button
              onClick={() => { resetCreateVault(); setScreen('home'); }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">Access Your Vault</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter password"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('home')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={handleAccessVault}
              disabled={!password}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-bold text-blue-900">Verifying...</h2>
        </div>
      </div>
    );
  }

  if (screen === 'your-vault') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">Your Vault</h2>
          
          <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
            {secrets.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No secrets stored yet</p>
            ) : (
              secrets.map((secret, index) => (
                <button
                  key={index}
                  onClick={() => { setSelectedSecret({ ...secret, index }); setScreen('view-secret'); }}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <div className="font-semibold text-blue-900">{secret.label}</div>
                </button>
              ))
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setScreen('add-to-vault')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Add
            </button>
            <button
              onClick={() => alert('Export functionality coming soon')}
              className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-lg border-2 border-blue-600 transition-all"
            >
              Export
            </button>
            <button
              onClick={() => { setPassword(''); setScreen('home'); }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">{selectedSecret?.label}</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                {selectedSecret?.username || 'N/A'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-mono">
                {selectedSecret?.password}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleCopyToClipboard(selectedSecret?.password)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Copy
            </button>
            <button
              onClick={() => handleDeleteSecret(selectedSecret?.index)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => setScreen('your-vault')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">Add to Vault</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => setScreen('add-password-label')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all"
            >
              Password
            </button>
            <button
              onClick={() => setScreen(vaultId ? 'your-vault' : 'vault-created')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">Add Password Tag</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
            <input
              type="text"
              value={secretLabel}
              onChange={(e) => setSecretLabel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Gmail, Facebook, etc."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('add-to-vault')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setScreen('add-password-entry')}
              disabled={!secretLabel}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-2xl font-bold text-blue-900 text-center">Add Password Entry</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username/Email</label>
              <input
                type="text"
                value={secretUsername}
                onChange={(e) => setSecretUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter username or email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={secretPassword}
                onChange={(e) => setSecretPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setScreen('add-password-label')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={handleAddSecret}
              disabled={!secretPassword}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-blue-900">Secret Added!</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { resetAddSecret(); setScreen('add-password-label'); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              Add Another
            </button>
            <button
              onClick={() => setScreen('your-vault')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all"
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
