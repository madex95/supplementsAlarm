export const PILL_KEY = '@PILL';
export const PILL_DETAIL_KEY = '@PILL_DETAIL';
export const PILL_TAKE_LOG_KEY = '@PILL_TAKE_LOG';

export interface PILL {
  P_UUID: string;
  P_NM: string;
  P_D_TK_FREQ: number;
  DEL_YN: string;
  REG_DT: string;
  MOD_DT: string;
  DEL_DT: string | null;
}

export interface PILL_DETAIL {
  P_UUID: string;
  P_TK_TN: number;
  P_TK_TM: string;
  USE_YN: string;
  DEL_YN: string;
  REG_DT: string;
  MOD_DT: string;
  DEL_DT: string | null;
}

export interface PILL_TAKE_LOG {
  P_UUID: string;
  P_TK_TN: number;
  P_TK_DT: string;
  P_TK_TM: string;
  P_TK_CHK_YN: string;
  USE_YN: string;
  DEL_YN: string;
  REG_DT: string;
  MOD_DT: string;
  DEL_DT: string | null;
}

