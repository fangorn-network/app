'use client';

import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BaseVaultApp() {
  const { isMiniAppReady, setMiniAppReady } = useMiniKit();
  // Initialize the miniapp
  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);
  const router = useRouter();
  return (
    <div className="screen-container">
      <div className="content-wrapper space-y-8">
        <div className="text-center">
          <h1 className="page-title">🔐 Base Vault</h1>
          <p className="subtitle">Secure your secrets on Base blockchain</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              router.push('/create');
            }}
            className="btn-primary-lg"
          >
            Create Vault
          </button>

          <button
            onClick={() => {
              router.push('/access');
            }}
            className="btn-secondary-lg"
          >
            Access Vault
          </button>
        </div>
      </div>
    </div>
  );
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
