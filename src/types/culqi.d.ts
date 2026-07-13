interface CulqiOptions {
  lang: string;
  installments: boolean;
  paymentMethods: {
    tarjeta: boolean;
    yape: boolean;
    billetera: boolean;
    bancaMovil: boolean;
    agente: boolean;
    cuotealo: boolean;
  };
  style?: {
    logo?: string;
    theme?: string;
    buttontext?: string;
    buttoncolor?: string;
    buttontextcolor?: string;
  };
}

interface CulqiSettings {
  title: string;
  currency: string;
  amount: number;
  order?: string;
  xculqirsaid?: string;
  rsapublickey?: string;
}

interface CulqiObject {
  publicKey: string;
  settings: (settings: CulqiSettings) => void;
  options: (options: CulqiOptions) => void;
  open: () => void;
  token?: {
    id: string;
    email: string;
  };
  error?: {
    merchant_message: string;
    user_message: string;
  };
}

declare global {
  interface Window {
    Culqi: CulqiObject;
    culqi: () => void; // Callback that Culqi fires cuando se genera el token
  }
}

export {};
