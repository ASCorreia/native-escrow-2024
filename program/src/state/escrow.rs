use borsh::{BorshDeserialize, BorshSerialize};
use bytemuck::{Pod, Zeroable};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

#[repr(C)]
#[derive(BorshDeserialize, BorshSerialize, Debug, Clone, Copy, Pod, Zeroable)]
pub struct Escrow {
    pub seed: u64,
    pub maker: Pubkey,
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub amount: u64,
    //pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 1;

    pub fn init(escrow: &AccountInfo, seed: u64, maker: Pubkey, mint_a: Pubkey, mint_b: Pubkey, amount: u64) -> ProgramResult {

        let mut escrow_account = Self::try_from_slice(&escrow.try_borrow_mut_data()?)?;
        escrow_account.clone_from(&Self {
            seed,
            maker,
            mint_a,
            mint_b,
            amount,
            //bump,
        });

        escrow_account.serialize(&mut *escrow.data.borrow_mut())?;

        Ok(())
    }
}