use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod points_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let points = &mut ctx.accounts.points;
        points.mint_authority = *ctx.accounts.authority.key;
        points.supply = 0;
        Ok(())
    }

    pub fn mint(ctx: Context<Mint>, amount: u64) -> Result<()> {
        let points = &mut ctx.accounts.points;
        points.supply += amount;
        Ok(())
    }

    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        // 实现转账逻辑
        Ok(())
    }
}

#[account]
pub struct Points {
    pub mint_authority: Pubkey,  // 铸造权限
    pub supply: u64,            // 总供应量
}