use solana_program::{account_info::AccountInfo, program_error::ProgramError};

pub fn load_signer(signer: &AccountInfo) -> Result<(), ProgramError> {
    if !signer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    Ok(())
}