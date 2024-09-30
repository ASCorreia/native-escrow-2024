import { Commitment, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, type TransactionInstruction } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, createMint, TOKEN_PROGRAM_ID, mintTo } from '@solana/spl-token';
import { assert } from 'chai';
import { createMakeInstruction, createRefundInstruction, createTakeInstruction, PROGRAM_ID } from '../ts';
import wallet from "../wba-wallet.json"
import { describe, it } from 'mocha';
import { BN } from 'bn.js';
import { randomBytes } from "crypto";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment); //http://127.0.0.1:8899

describe!("Solana Native Escrow", () => {
    let mintA: PublicKey;
    let mintB: PublicKey;
    let makerAta: PublicKey;
    let vault: PublicKey;

    const seed = new BN(randomBytes(8));

    const escrow = PublicKey.findProgramAddressSync([Buffer.from("escrow"), keypair.publicKey.toBuffer(), seed.toArrayLike(Buffer, "le", 8)], PROGRAM_ID);

    it("Make", async() => {
        mintA = await createMint(connection, keypair, keypair.publicKey, null, 6);
        mintB = await createMint(connection, keypair, keypair.publicKey, null, 6);

        makerAta = (await getOrCreateAssociatedTokenAccount(connection, keypair, mintA, keypair.publicKey)).address;
        vault = (await getOrCreateAssociatedTokenAccount(connection, keypair, mintA, escrow[0], true)).address;

        const mintTx = await mintTo(connection, keypair, mintA, makerAta, keypair, 100000000);

        console.log("\nMint transaction confirmed with signature: ", mintTx);

        const createMakeIx: TransactionInstruction = createMakeInstruction(seed, new BN(1000000), {
            maker: keypair.publicKey,
            escrow: escrow[0],
            mintA,
            mintB,
            makerAta,
            vault,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        });

        const tx = new Transaction().add(createMakeIx);
        tx.feePayer = keypair.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash(commitment)).blockhash;

        let sig = await sendAndConfirmTransaction(connection, tx, [keypair], {skipPreflight: false});
        console.log("\nEscrow created!\nTransaction confirmed with signature: ", sig);
    })

    it("Refund", async() => {
        const createRefundIx: TransactionInstruction = createRefundInstruction({
            maker: keypair.publicKey,
            escrow: escrow[0],
            mintA,
            vault,
            makerAta,
            tokenProgram: TOKEN_PROGRAM_ID,
        });

        console.log("\nEscrow: ", escrow[0].toBase58());

        const tx = new Transaction().add(createRefundIx);
        tx.feePayer = keypair.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash(commitment)).blockhash;

        let sig = await sendAndConfirmTransaction(connection, tx, [keypair], {skipPreflight: true});
        console.log("\nRefund transaction confirmed with signature: ", sig);
    })

    it("Take", async() => {
        const taker = Keypair.generate();

        const takerAtaA = (await getOrCreateAssociatedTokenAccount(connection, taker, mintA, taker.publicKey)).address;
        const takerAtaB = (await getOrCreateAssociatedTokenAccount(connection, taker, mintB, taker.publicKey)).address;

        const mintTx = await mintTo(connection, keypair, mintB, takerAtaB, keypair, 100000000);

        const createTakeIx: TransactionInstruction = createTakeInstruction({
            maker: keypair.publicKey,
            taker: taker.publicKey,
            escrow: escrow[0],
            mintA,
            mintB,
            makerAta,
            takerAtaA,
            takerAtaB,
            vault,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        });

        const tx = new Transaction().add(createTakeIx);
        tx.feePayer = keypair.publicKey;
        tx.recentBlockhash = (await connection.getLatestBlockhash(commitment)).blockhash;

        let sig = await sendAndConfirmTransaction(connection, tx, [keypair, taker], {skipPreflight: true});
        console.log("\nTake transaction confirmed with signature: ", sig);
    })
})