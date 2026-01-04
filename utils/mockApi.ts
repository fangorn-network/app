
export const mockApi = {
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
  },
  addEntry: async (vaultId: string, label: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {success: true}
  }
};