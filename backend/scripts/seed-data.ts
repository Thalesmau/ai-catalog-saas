import { ProductRepository } from '@infra/database/repositories/ProductRepository';
import { TRole } from '@shared/types/AuthContext';

export const SEED_PASSWORD = 'Senha@123';

type SeedCompany = {
  name: string;
  slug: string;
  inviteCode: string;
  accounts: { name: string; email: string; role: TRole }[];
  products: ProductRepository.CreateInput[];
};

const image = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

export const SEED_COMPANIES: SeedCompany[] = [
  {
    name: 'TechNova Eletrônicos',
    slug: 'technova-eletronicos',
    inviteCode: 'TECHNOVA',
    accounts: [
      { name: 'Ana Admin', email: 'admin@technova.com', role: 'admin' },
      { name: 'Ulisses User', email: 'user@technova.com', role: 'user' },
    ],
    products: [
      {
        name: 'Fone Bluetooth Pulse ANC',
        description: 'Fone over-ear com cancelamento ativo de ruído, 40h de bateria, carregamento USB-C e microfone para chamadas.',
        priceInCents: 39990,
        category: 'Áudio',
        imageUrl: image('technova-fone-pulse'),
      },
      {
        name: 'Fone Intra-auricular Sport',
        description: 'Fone in-ear sem fio resistente a suor (IPX5), ideal para corrida e academia. 8h de bateria + 24h no estojo.',
        priceInCents: 12990,
        category: 'Áudio',
        imageUrl: image('technova-fone-sport'),
      },
      {
        name: 'Caixa de Som Portátil Boom 20W',
        description: 'Caixa Bluetooth à prova d\'água (IP67), 20W de potência, 12h de bateria e função powerbank.',
        priceInCents: 24990,
        category: 'Áudio',
        imageUrl: image('technova-boom'),
      },
      {
        name: 'Notebook Nova 14 i5 16GB',
        description: 'Notebook 14" Full HD, Intel Core i5 de 13ª geração, 16GB RAM, SSD 512GB, 1,3kg. Ótimo para trabalho e estudos.',
        priceInCents: 449900,
        category: 'Notebooks',
        imageUrl: image('technova-nova14'),
      },
      {
        name: 'Notebook Nova Pro 16 Ryzen 7',
        description: 'Notebook 16" 2.5K 120Hz, AMD Ryzen 7, 32GB RAM, SSD 1TB e RTX 4060. Para edição de vídeo e jogos.',
        priceInCents: 799900,
        category: 'Notebooks',
        imageUrl: image('technova-novapro16'),
      },
      {
        name: 'Smartphone Nova X 256GB',
        description: 'Tela AMOLED 6,7" 120Hz, câmera tripla de 50MP, 8GB RAM, 256GB, bateria de 5000mAh com carga de 67W.',
        priceInCents: 299900,
        category: 'Smartphones',
        imageUrl: image('technova-novax'),
      },
      {
        name: 'Monitor 27" QHD 165Hz',
        description: 'Monitor IPS 27" 2560x1440, 165Hz, 1ms, HDR10 e ajuste de altura. Ideal para jogos e design.',
        priceInCents: 189900,
        category: 'Monitores',
        imageUrl: image('technova-monitor27'),
      },
      {
        name: 'Monitor 24" Full HD IPS',
        description: 'Monitor 24" Full HD com painel IPS, 75Hz, bordas finas e entradas HDMI e DisplayPort.',
        priceInCents: 79990,
        category: 'Monitores',
        imageUrl: image('technova-monitor24'),
      },
      {
        name: 'Teclado Mecânico RGB TKL',
        description: 'Teclado mecânico tenkeyless com switches red hot-swap, iluminação RGB e cabo USB-C removível.',
        priceInCents: 34990,
        category: 'Periféricos',
        imageUrl: image('technova-teclado'),
      },
      {
        name: 'Mouse Gamer 26K DPI',
        description: 'Mouse gamer sem fio, sensor de 26.000 DPI, 63g, 70h de bateria e 5 botões programáveis.',
        priceInCents: 19990,
        category: 'Periféricos',
        imageUrl: image('technova-mouse'),
      },
      {
        name: 'Webcam Full HD 60fps',
        description: 'Webcam 1080p a 60fps com autofoco, microfone duplo e correção automática de luz.',
        priceInCents: 29990,
        category: 'Periféricos',
        imageUrl: image('technova-webcam'),
      },
      {
        name: 'Carregador GaN 65W USB-C',
        description: 'Carregador compacto GaN com 2 portas USB-C e 1 USB-A, carrega notebook e celular ao mesmo tempo.',
        priceInCents: 17990,
        category: 'Acessórios',
        imageUrl: image('technova-gan65'),
      },
      {
        name: 'Hub USB-C 7 em 1',
        description: 'Hub com HDMI 4K, 3x USB 3.0, leitor SD/microSD e USB-C PD 100W. Corpo em alumínio.',
        priceInCents: 21990,
        category: 'Acessórios',
        imageUrl: image('technova-hub'),
      },
    ],
  },
  {
    name: 'Verde Vida Naturais',
    slug: 'verde-vida-naturais',
    inviteCode: 'VERDEVID',
    accounts: [
      { name: 'Vera Admin', email: 'admin@verdevida.com', role: 'admin' },
      { name: 'Vitor User', email: 'user@verdevida.com', role: 'user' },
    ],
    products: [
      {
        name: 'Chá Verde Orgânico 100g',
        description: 'Folhas de chá verde orgânico certificado, rico em antioxidantes. Rende cerca de 50 xícaras.',
        priceInCents: 2490,
        category: 'Chás',
        imageUrl: image('verdevida-cha-verde'),
      },
      {
        name: 'Chá de Camomila 30 sachês',
        description: 'Camomila pura em sachês, calmante natural, sem cafeína. Ideal para antes de dormir.',
        priceInCents: 1590,
        category: 'Chás',
        imageUrl: image('verdevida-camomila'),
      },
      {
        name: 'Matcha Cerimonial 50g',
        description: 'Matcha japonês grau cerimonial, moído na pedra. Energia sem picos, ótimo para lattes.',
        priceInCents: 8990,
        category: 'Chás',
        imageUrl: image('verdevida-matcha'),
      },
      {
        name: 'Whey Protein Vegano 900g',
        description: 'Proteína vegetal de ervilha e arroz, 24g de proteína por dose, sabor cacau, sem lactose e sem glúten.',
        priceInCents: 15990,
        category: 'Suplementos',
        imageUrl: image('verdevida-whey-vegano'),
      },
      {
        name: 'Colágeno Hidrolisado 300g',
        description: 'Colágeno tipo I e III com vitamina C, sem sabor, dissolve fácil em água ou suco.',
        priceInCents: 8990,
        category: 'Suplementos',
        imageUrl: image('verdevida-colageno'),
      },
      {
        name: 'Vitamina D3 2000UI 60 cápsulas',
        description: 'Vitamina D3 em óleo de coco, 1 cápsula ao dia. Apoia imunidade e saúde óssea.',
        priceInCents: 3990,
        category: 'Suplementos',
        imageUrl: image('verdevida-vitamina-d'),
      },
      {
        name: 'Quinoa em Grãos 500g',
        description: 'Quinoa branca em grãos, fonte de proteína completa e fibras. Naturalmente sem glúten.',
        priceInCents: 2290,
        category: 'Grãos e Cereais',
        imageUrl: image('verdevida-quinoa'),
      },
      {
        name: 'Granola sem Glúten 400g',
        description: 'Granola crocante com castanhas, coco e mel, sem glúten e sem açúcar refinado.',
        priceInCents: 2790,
        category: 'Grãos e Cereais',
        imageUrl: image('verdevida-granola'),
      },
      {
        name: 'Aveia em Flocos Orgânica 500g',
        description: 'Aveia em flocos finos orgânica, ideal para mingau, vitaminas e receitas fit.',
        priceInCents: 1290,
        category: 'Grãos e Cereais',
        imageUrl: image('verdevida-aveia'),
      },
      {
        name: 'Pasta de Amendoim Integral 1kg',
        description: '100% amendoim torrado, sem açúcar, sem sal e sem conservantes.',
        priceInCents: 3490,
        category: 'Snacks',
        imageUrl: image('verdevida-pasta-amendoim'),
      },
      {
        name: 'Mix de Castanhas 200g',
        description: 'Castanha-do-pará, castanha de caju, amêndoas e nozes, sem sal. Snack prático e nutritivo.',
        priceInCents: 3290,
        category: 'Snacks',
        imageUrl: image('verdevida-castanhas'),
      },
      {
        name: 'Barra de Proteína sem Glúten (caixa com 12)',
        description: 'Barras com 15g de proteína, sabor brownie, sem glúten e sem adição de açúcar.',
        priceInCents: 7990,
        category: 'Snacks',
        imageUrl: image('verdevida-barra-proteina'),
      },
      {
        name: 'Óleo de Coco Extra Virgem 500ml',
        description: 'Óleo de coco prensado a frio, extra virgem, para culinária e cuidados com pele e cabelo.',
        priceInCents: 3990,
        category: 'Óleos',
        imageUrl: image('verdevida-oleo-coco'),
      },
    ],
  },
];
