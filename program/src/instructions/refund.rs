use borsh::BorshDeserialize;
use solana_program::{account_info::AccountInfo, bpf_loader_upgradeable::close, program::invoke, program_error::ProgramError, program_pack::Pack, pubkey::Pubkey};
use spl_token::instruction::transfer_checked;

use crate::{error::EscrowError, loaders::load_signer, Escrow};

pub fn process_refund_instruction(accounts: &[AccountInfo<'_>], _instruction_data: &[u8]) -> Result<(), ProgramError> {

    let [maker, escrow, mint, vault, maker_ata, token_program, system_program] = accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    let escrow_pda = Escrow::try_from_slice(&escrow.try_borrow_mut_data()?)?; 
    let escrow_key = Pubkey::find_program_address(&[b"escrow", maker.key.as_ref(), escrow_pda.seed.to_be_bytes().as_ref()], &crate::ID).0;

    load_signer(maker)?;

    if escrow.key.ne(&escrow_key) {
        return Err(EscrowError::EscrowAccountMismatch.into());
    }
    
    let vault_data = spl_token::state::Account::unpack(&vault.try_borrow_mut_data()?)?;
    if vault_data.mint.ne(mint.key) && vault_data.owner.ne(&escrow_key) {
        return Err(EscrowError::EscrowAccountMismatch.into());
    }

    let maker_ata_data = spl_token::state::Account::unpack(&maker_ata.try_borrow_mut_data()?)?;
    if maker_ata_data.mint.ne(mint.key) && maker_ata_data.owner.ne(maker.key) {
        return Err(EscrowError::EscrowAccountMismatch.into());
    }

    let decimals = spl_token::state::Mint::unpack(&mint.try_borrow_mut_data()?)?.decimals;
    let transfer_ix = transfer_checked(token_program.key, vault.key, mint.key, maker_ata.key, maker.key, &[maker.key], vault_data.amount, decimals)?;
    invoke(
        &transfer_ix, 
        &[vault.clone(), maker_ata.clone(), maker.clone(), token_program.clone()]
    )?;

    let close_account = close(&escrow_key, maker.key, &escrow_key);
    invoke(
        &close_account,
         &[escrow.clone(), maker.clone(), system_program.clone()]
    )?;

    Ok(())
}