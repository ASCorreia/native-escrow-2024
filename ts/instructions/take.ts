import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { PROGRAM_ID } from "../";

export type createTakeInstructionAccounts = {
    maker: PublicKey;
    taker: PublicKey;
    escrow: PublicKey;
    mintA: PublicKey;
    mintB: PublicKey;
    makerAta: PublicKey;
    takerAtaA: PublicKey;
    takerAtaB: PublicKey;
    vault: PublicKey;
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
};

export function createTakeInstruction(accounts: createTakeInstructionAccounts): TransactionInstruction {
    return new TransactionInstruction({
        programId: PROGRAM_ID,
        keys: [
            {
                pubkey: accounts.maker,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.taker,
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
                pubkey: accounts.takerAtaA,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.takerAtaB,
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
        ],
        data: Buffer.from([0x1]),
    });
}