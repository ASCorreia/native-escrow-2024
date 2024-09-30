import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { PROGRAM_ID } from "../";

export type createRefundInstructionAccounts = {
    maker: PublicKey;
    escrow: PublicKey;
    mintA: PublicKey;
    vault: PublicKey;
    makerAta: PublicKey;
    tokenProgram: PublicKey;
    systemProgram: PublicKey;
};

export function createRefundInstruction(accounts: createRefundInstructionAccounts): TransactionInstruction {
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
                pubkey: accounts.vault,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.makerAta,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: accounts.tokenProgram,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: Buffer.from([0x2]),
    });
}