
export const mockApi = {
  createVault: async (passwordHash: bigint) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, vaultId: 'vault_' + Date.now() };
  },
  addEntry: async (vaultId: string, cid: string, tag: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {success: true}
  },
  submitProof: async (vaultId: string, nullifier: string, proof: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {success: true}
  },
  getEntry: async(vaultId: string, entryIndex: number) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {success: true}
  },
  getAllEntries: async(vaultId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {success: true}
  }
};