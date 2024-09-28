import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export type Escrow = {
    seed: BN,
    maker: PublicKey,
    mintA: PublicKey,
    mintB: PublicKey,
    amount: BN,
    bump: number,
}

export const ESCROW_ACCOUNT_SIZE = 8 + 32 + 32 + 32 + 8 + 1;

export function deserializeEscrowAccount(data: Buffer): Escrow {
    if (data.length !== ESCROW_ACCOUNT_SIZE) {
        throw new Error(`Invalid data length: ${data.length}`);
    }
    
    const seed = new BN(data.subarray(0, 8), 'le');
    const maker = new PublicKey(data.subarray(8, 40));
    const mintA = new PublicKey(data.subarray(40, 72));
    const mintB = new PublicKey(data.subarray(72, 104));
    const amount = new BN(data.subarray(104, 112), 'le');
    const bump = data[112];
    return { seed, maker, mintA, mintB, amount, bump };
}