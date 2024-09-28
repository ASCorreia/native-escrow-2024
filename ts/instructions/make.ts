import { type PublicKey, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { PROGRAM_ID } from '../';

export type createMakeInstructionAccounts = {
    maker: PublicKey;
    escrow: PublicKey;
    mintA: PublicKey;
    mintB: PublicKey;
    vault: PublicKey;
    makerAta: PublicKey;
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
};

export function createMakeInstruction(seed: BN, amount: BN, accounts: createMakeInstructionAccounts): TransactionInstruction {
    return new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            {
                pubkey: accounts.maker,
                isSigner: true,
                isWritable: true,
            },
            {
                pubkey: accounts.escrow,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.mintA,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: accounts.mintB,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: accounts.makerAta,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.vault,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.tokenProgram,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: accounts.systemProgram,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: Buffer.from([0x0, ...seed.toArray('le', 8), ...amount.toArray('le', 8)]),
    });
}