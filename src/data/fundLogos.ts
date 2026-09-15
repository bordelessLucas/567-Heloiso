import type { ImageSourcePropType } from 'react-native';

/**
 * Catálogo local de fotos dos FIIs em `assets/funds/`.
 * Requires relativos — Metro resolve de forma confiável.
 */
export const FUND_LOGO_SOURCES: Record<string, ImageSourcePropType> = {
  KNCR11: require('../../assets/funds/KNCR11.png'),
  HGLG11: require('../../assets/funds/HGLG11.png'),
  XPLG11: require('../../assets/funds/XPLG11.png'),
  VISC11: require('../../assets/funds/VISC11.png'),
  MXRF11: require('../../assets/funds/MXRF11.png'),
  BTLG11: require('../../assets/funds/BTLG11.png'),
  HSML11: require('../../assets/funds/HSML11.png'),
  RECT11: require('../../assets/funds/RECT11.png'),
  HGRE11: require('../../assets/funds/HGRE11.png'),
  XPML11: require('../../assets/funds/XPML11.png'),
  KNRI11: require('../../assets/funds/KNRI11.png'),
  TVRI11: require('../../assets/funds/TVRI11.png'),
  RBRR11: require('../../assets/funds/RBRR11.png'),
  VGIR11: require('../../assets/funds/VGIR11.png'),
  CPFF11: require('../../assets/funds/CPFF11.png'),
  BCFF11: require('../../assets/funds/BCFF11.png'),
  HFOF11: require('../../assets/funds/HFOF11.png'),
  IRDM11: require('../../assets/funds/IRDM11.png'),
  KNIP11: require('../../assets/funds/KNIP11.png'),
  MALL11: require('../../assets/funds/MALL11.png'),
  PVBI11: require('../../assets/funds/PVBI11.png'),
  RZTR11: require('../../assets/funds/RZTR11.png'),
  TRXF11: require('../../assets/funds/TRXF11.png'),
  VILG11: require('../../assets/funds/VILG11.png'),
  XPCI11: require('../../assets/funds/XPCI11.png'),
  ALZR11: require('../../assets/funds/ALZR11.png'),
  BRCR11: require('../../assets/funds/BRCR11.png'),
  GGRC11: require('../../assets/funds/GGRC11.png'),
  HCTR11: require('../../assets/funds/HCTR11.png'),
  JSRE11: require('../../assets/funds/JSRE11.png'),
};

export function getFundLogoSource(ticker: string): ImageSourcePropType | null {
  const key = ticker.trim().toUpperCase();
  return FUND_LOGO_SOURCES[key] ?? null;
}
