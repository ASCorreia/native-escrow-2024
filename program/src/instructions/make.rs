use borsh::BorshDeserialize;
use solana_program::{
    account_info::AccountInfo, program::{
        invoke, 
        invoke_signed
    }, program_error::ProgramError, program_pack::Pack, pubkey::Pubkey, rent::Rent, system_instruction::create_account, system_program, sysvar::Sysvar
};
use spl_token::instruction::transfer_checked;

use crate::{
    constants::{
        AMOUNT_OFFSET, 
        SEED_OFFSET
    }, error::EscrowError, Escrow, ID
};

pub fn process_make_instruction(accounts: &[AccountInfo], instruction_data: &[u8]) -> Result<(), ProgramError> {
    let [maker, escrow, mint_a, mint_b, maker_ata, vault, token_program, _system_program] =
        accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    let seed = u64::try_from_slice(&instruction_data[..SEED_OFFSET])?;
    let amount = u64::try_from_slice(&instruction_data[SEED_OFFSET..AMOUNT_OFFSET])?;
    let escrow_pda = Pubkey::find_program_address(&[b"escrow", maker.key.as_ref(), seed.to_le_bytes().as_ref()], &ID);

    if !maker.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if escrow.key.ne(&escrow_pda.0) {
        return Err(EscrowError::EscrowAccountMismatch.into());
    }

    if escrow.owner.ne(&system_program::ID) {
        return Err(ProgramError::AccountAlreadyInitialized);
    }


    let minimum_balance = Rent::get()?.minimum_balance(Escrow::LEN);
    let init_ix = create_account(maker.key, escrow.key, minimum_balance, Escrow::LEN as u64, &crate::ID);

    invoke_signed(
        &init_ix,
        &[maker.clone(), escrow.clone()], 
        &[&[b"escrow", maker.key.as_ref(), seed.to_le_bytes().as_ref(), &[escrow_pda.1]]]
    )?;

    Escrow::init(escrow, seed, *maker.key, *mint_a.key, *mint_b.key, amount)?;

    match token_program.key {
        &spl_token::ID => {
            assert_eq!(vault.owner, &spl_token::ID);
        },
        &spl_token_2022::ID => {
            assert_eq!(vault.owner, &spl_token_2022::ID);
        },
        _ => return Err(ProgramError::InvalidAccountData),
    };

    let decimals = spl_token::state::Mint::unpack(&mint_a.try_borrow_data()?)?.decimals;
    let transfer_ix = transfer_checked(token_program.key, maker_ata.key, mint_a.key, vault.key, maker.key, &[maker.key], amount, decimals)?;
    invoke(
        &transfer_ix,
        &[maker_ata.clone(), mint_a.clone(), vault.clone(), maker.clone()]
    )?;
    
    Ok(())
}