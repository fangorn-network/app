export function stringToBigInt(text: string) {
    const bytes = new TextEncoder().encode(text);
    const bigInts = Array.from(bytes, byte => BigInt(byte));
    return bigInts;
}