use solana_program::{account_info::AccountInfo, program_error::ProgramError, pubkey::Pubkey, system_program};

use crate::error::EscrowError;

#[inline]
pub fn load_pda(escrow: &AccountInfo, escrow_pda: Pubkey) -> Result<(), ProgramError> {
    if escrow.key.ne(&escrow_pda) {
        return Err(EscrowError::EscrowAccountMismatch.into());
    }

    if escrow.owner.ne(&system_program::ID) {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    Ok(())
}