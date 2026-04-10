import MercadoPagoConfig from 'mercadopago';

let mpConfig: MercadoPagoConfig | null = null;

/**
 * MercadoPago config singleton — replaces NestJS @Inject('MercadoPago')
 */
export function getMercadoPagoConfig(): MercadoPagoConfig {
  if (!mpConfig) {
    mpConfig = new MercadoPagoConfig({
      accessToken: Bun.env.MP_ACCESS_TOKEN!,
    });
  }
  return mpConfig;
}
