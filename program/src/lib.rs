use instructions::{process_make_instruction, process_refund_instruction, process_take_instruction, EscrowInstruction};
use solana_program::{
    account_info::AccountInfo, declare_id, entrypoint::ProgramResult, program_error::ProgramError, pubkey::Pubkey
};

declare_id!("LdAWh3nDWt1TepA9UVDeiMQifkFDoqSfoikNPe3zpnt");

mod state;
mod instructions;
mod error;
mod constants;

use state::*;

#[cfg(not(feature = "no-entrypoint"))]
solana_program::entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    if program_id.ne(&ID) {
        return Err(ProgramError::IncorrectProgramId);
    }

    let (instruction_discriminant, instruction_inner_data) = instruction_data.split_at(1);

    match EscrowInstruction::try_from(instruction_discriminant[0]).unwrap() {
        EscrowInstruction::MakeInstruction => process_make_instruction(accounts, instruction_inner_data)?,
        EscrowInstruction::TakeInstruction => process_take_instruction(accounts, instruction_data)?,
        EscrowInstruction::RefundInstruction => process_refund_instruction(accounts, instruction_data)?,
    }
    
    Ok(())
}