export interface Tour360Hotspot {
  pitch: number;
  yaw: number;
  sceneId: string;
  text: string;
}

export interface Tour360Scene {
  panorama: string;
  hotspots: Tour360Hotspot[];
}

export interface Tour360 {
  firstScene: string;
  sceneLabels: Record<string, string>;
  scenes: Record<string, Tour360Scene>;
}

export interface LocalizedText {
  es: string;
  en: string;
  ru: string;
}

export interface Property {
  id: string;
  title: LocalizedText;
  slug: string;
  operation: "venta" | "alquiler";
  type: "departamento" | "casa" | "ph" | "terreno" | "oficina" | "local";
  zone: string;
  address: string;
  price: number;
  currency: "USD" | "ARS";
  bedrooms: number;
  bathrooms: number;
  area: number;
  garage: number;
  year: number;
  featured: boolean;
  hasVirtualTour: boolean;
  hasDroneVideo: boolean;
  description: {
    es: string;
    en: string;
    ru: string;
  };
  features: string[];
  images: string[];
  videoUrl?: string;
  tourUrl?: string;
  tour360?: Tour360;
  lat?: number;
  lng?: number;
}

export const zones = [
  "Palermo",
  "Recoleta",
  "Belgrano",
  "Núñez",
  "San Isidro",
  "Vicente López",
  "Puerto Madero",
  "Retiro",
  "Barrio Norte",
  "Las Cañitas",
];

export const propertyTypes = [
  { value: "departamento", label: { es: "Departamento", en: "Apartment", ru: "Квартира" } },
  { value: "casa", label: { es: "Casa", en: "House", ru: "Дом" } },
  { value: "ph", label: { es: "PH", en: "Townhouse", ru: "Таунхаус" } },
  { value: "terreno", label: { es: "Terreno", en: "Land", ru: "Участок" } },
  { value: "oficina", label: { es: "Oficina", en: "Office", ru: "Офис" } },
  { value: "local", label: { es: "Local Comercial", en: "Commercial", ru: "Коммерческое" } },
];

// Los datos reales de propiedades viven en Supabase — ver src/lib/data/properties.ts.
// Este array queda solo como fuente para scripts/migrate-properties.ts (seed inicial).
export const seedProperties: Property[] = [
  {
    id: "0",
    title: {
      es: "Casa Showroom con Tour Virtual 360° Interactivo",
      en: "Showroom House with Interactive 360° Virtual Tour",
      ru: "Дом-шоурум с интерактивным виртуальным туром 360°",
    },
    slug: "casa-showroom-tour-360",
    operation: "venta",
    type: "casa",
    zone: "Las Cañitas",
    address: "Arévalo 2650",
    price: 690000,
    currency: "USD",
    bedrooms: 3,
    bathrooms: 2,
    area: 210,
    garage: 1,
    year: 2023,
    featured: true,
    hasVirtualTour: true,
    hasDroneVideo: false,
    description: {
      es: "Propiedad de demostración de FS Inmobiliaria: recorré la casa completa con nuestro tour virtual 360° interactivo, con imágenes reales en alta resolución. Navegá libremente entre living, cocina, dormitorios, pasillo, baño, patio y piscina, tal como lo vería un comprador antes de agendar una visita presencial.",
      en: "FS Inmobiliaria showcase property: walk through the entire house with our interactive 360° virtual tour, using real high-resolution imagery. Freely navigate between living rooms, kitchen, hallway, bathroom, patio and pool, just like a buyer would before scheduling an in-person visit.",
      ru: "Демонстрационный объект FS Inmobiliaria: осмотрите весь дом с помощью нашего интерактивного 360° виртуального тура с реальными изображениями высокого разрешения. Свободно перемещайтесь между гостиными, кухней, коридором, ванной, двориком и бассейном — так же, как это сделал бы покупатель перед личным визитом."
    },
    features: ["Tour virtual 360°", "Pileta", "Patio", "Living integrado", "Cocina equipada", "Luminoso", "Pisos de porcelanato"],
    images: [
      "/fotos_normales/Aerea.jpg",
      "/fotos_normales/DSC_6857.jpg",
      "/fotos_normales/DSC_6859.jpg",
      "/fotos_normales/DSC_6861.jpg",
      "/fotos_normales/DSC_6863.jpg",
      "/fotos_normales/DSC_6865.jpg",
      "/fotos_normales/DSC_6869.jpg",
      "/fotos_normales/DSC_6871.jpg",
      "/fotos_normales/DSC_6873.jpg",
      "/fotos_normales/DSC_6875.jpg",
      "/fotos_normales/DSC_6876.jpg",
      "/fotos_normales/DSC_6877.jpg",
      "/fotos_normales/DSC_6878.jpg",
      "/fotos_normales/DSC_6879.jpg",
    ],
    tour360: {
      firstScene: "sala1",
      sceneLabels: {
        sala1: "Sala 1",
        sala2: "Sala 2",
        sala3: "Sala 3",
        cocina: "Cocina",
        pasillo: "Pasillo",
        bano: "Baño",
        patio: "Patio",
        piscina: "Piscina",
      },
      scenes: {
        sala1: {
          panorama: "/tour/sala1.jpg",
          hotspots: [
            { pitch: -6.08, yaw: 23.49, sceneId: "patio", text: "Patio" },
            { pitch: -4.58, yaw: 134, sceneId: "bano", text: "Baño" },
            { pitch: -2.08, yaw: -133.53, sceneId: "cocina", text: "Cocina" },
            { pitch: -5.95, yaw: -70.8, sceneId: "sala2", text: "Sala 2" },
            { pitch: -3.9, yaw: -96.37, sceneId: "sala3", text: "Sala 3" },
            { pitch: -27.88, yaw: 134.23, sceneId: "pasillo", text: "Pasillo" },
          ],
        },
        sala2: {
          panorama: "/tour/sala2.jpg",
          hotspots: [
            { pitch: -2.14, yaw: -4.89, sceneId: "bano", text: "Baño" },
            { pitch: -2.81, yaw: -41.56, sceneId: "patio", text: "Patio" },
            { pitch: -3.08, yaw: 20.31, sceneId: "cocina", text: "Cocina" },
            { pitch: -3.29, yaw: 71.29, sceneId: "sala3", text: "Sala 3" },
            { pitch: -10.78, yaw: -19.47, sceneId: "sala1", text: "Sala 1" },
          ],
        },
        sala3: {
          panorama: "/tour/sala3.jpg",
          hotspots: [
            { pitch: -3.74, yaw: 13.98, sceneId: "patio", text: "Patio" },
            { pitch: -22.46, yaw: -36.18, sceneId: "sala2", text: "Sala 2" },
            { pitch: -19.01, yaw: 30.57, sceneId: "sala1", text: "Sala 1" },
          ],
        },
        cocina: {
          panorama: "/tour/cocina.jpg",
          hotspots: [
            { pitch: -4.04, yaw: -22.34, sceneId: "patio", text: "Patio" },
            { pitch: -12.54, yaw: -48.28, sceneId: "sala1", text: "Sala 1" },
          ],
        },
        pasillo: {
          panorama: "/tour/pasillo.jpg",
          hotspots: [
            { pitch: -21.49, yaw: -123.93, sceneId: "bano", text: "Baño" },
            { pitch: -11.28, yaw: -81.47, sceneId: "sala1", text: "Sala 1" },
          ],
        },
        bano: {
          panorama: "/tour/bano.jpg",
          hotspots: [
            { pitch: -14.79, yaw: -24.88, sceneId: "pasillo", text: "Pasillo" },
          ],
        },
        patio: {
          panorama: "/tour/patio.jpg",
          hotspots: [
            { pitch: -1.47, yaw: -99.53, sceneId: "piscina", text: "Piscina" },
            { pitch: 0.88, yaw: 171.89, sceneId: "sala1", text: "Sala 1" },
          ],
        },
        piscina: {
          panorama: "/tour/piscina.jpg",
          hotspots: [
            { pitch: 0, yaw: 0, sceneId: "patio", text: "Patio" },
            { pitch: -0.45, yaw: 46.36, sceneId: "sala1", text: "Sala 1" },
          ],
        },
      },
    },
  },
  {
    id: "1",
    title: {
      es: "Penthouse de Lujo con Vistas Panorámicas",
      en: "Luxury Penthouse with Panoramic Views",
      ru: "Элитный Пентхаус с Панорамным Видом",
    },
    slug: "penthouse-lujo-vistas-panoramicas",
    operation: "venta",
    type: "departamento",
    zone: "Puerto Madero",
    address: "Alicia Moreau de Justo 1200, Piso 18",
    price: 1250000,
    currency: "USD",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    garage: 2,
    year: 2023,
    featured: true,
    hasVirtualTour: true,
    hasDroneVideo: true,
    description: {
      es: "Impresionante penthouse de lujo ubicado en la zona más exclusiva de Puerto Madero. Cuenta con amplios balcones panorámicos que ofrecen vistas espectaculares del Río de la Plata y la ciudad. Acabados de primera calidad, cocina equipada con electrodomésticos de gama alta y domótica completa.",
      en: "Stunning luxury penthouse located in the most exclusive area of Puerto Madero. Features spacious panoramic balconies with spectacular views of the River Plate and the city. Premium finishes, kitchen equipped with high-end appliances and full home automation.",
      ru: "Великолепный элитный пентхаус в самом эксклюзивном районе Пуэрто-Мадеро. Просторные панорамные балконы с захватывающими видом на реку Ла-Плата и город. Отделка премиум-класса, кухня с бытовой техникой высшего класса и полная домашняя автоматизация."
    },
    features: ["Pileta climatizada", "Gym", "SUM", "Luminoso", "Balcón panorámico", "Domótica", "Seguridad 24hs", "Amenities"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
    ],
    tourUrl: "https://my.matterport.com/show/?m=example1",
  },
  {
    id: "2",
    title: {
      es: "Casa Contemporánea con Jardín y Pileta",
      en: "Contemporary House with Garden and Pool",
      ru: "Современный Дом с Садом и Бассейном",
    },
    slug: "casa-contemporanea-jardin-pileta",
    operation: "venta",
    type: "casa",
    zone: "San Isidro",
    address: "Av. del Libertador 8500",
    price: 980000,
    currency: "USD",
    bedrooms: 5,
    bathrooms: 4,
    area: 420,
    garage: 3,
    year: 2022,
    featured: true,
    hasVirtualTour: true,
    hasDroneVideo: false,
    description: {
      es: "Espectacular casa contemporánea rodeada de verde. Diseño arquitectónico de primer nivel con espacios amplios y luminosos. Jardín diseñado por paisajista destacado, pileta infinity y deck de madera. Ideal para familias que buscan privacidad y confort.",
      en: "Spectacular contemporary house surrounded by greenery. First-level architectural design with spacious and bright spaces. Garden designed by renowned landscaper, infinity pool and wooden deck. Ideal for families seeking privacy and comfort.",
      ru: "Великолепный современный дом в окружении зелени. Архитектура высшего уровня с просторными и светлыми помещениями. Сад от известного ландшафтного дизайнера, infinity-бассейн и деревянная терраса. Идеально для семей, ценящих приватность и комфорт."
    },
    features: ["Pileta infinity", "Quincho", "Parrilla", "Jardín paisajista", "Calefacción por piso", "Seguridad", "Cochera techada"],
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "3",
    title: {
      es: "Departamento Premium en Torre Excellence",
      en: "Premium Apartment in Excellence Tower",
      ru: "Премиальная Квартира в Башне Excellence",
    },
    slug: "departamento-premium-torre-excellence",
    operation: "venta",
    type: "departamento",
    zone: "Palermo",
    address: "Av. Scalabrini Ortiz 1450, Piso 12",
    price: 450000,
    currency: "USD",
    bedrooms: 3,
    bathrooms: 2,
    area: 145,
    garage: 1,
    year: 2024,
    featured: true,
    hasVirtualTour: true,
    hasDroneVideo: true,
    description: {
      es: "Moderno departamento de alta gama en el corazón de Palermo. Acabados premium, pisos de porcelanato de gran formato, cocina abierta con isla. Torre con amenities de primer nivel: gimnasio, terraza mirror, coworking y SUM con parrilla.",
      en: "Modern high-end apartment in the heart of Palermo. Premium finishes, large-format porcelain floors, open kitchen with island. Tower with first-level amenities: gym, mirror terrace, coworking and BBQ area.",
      ru: "Современная квартира класса люкс в самом сердце Палермо. Премиальная отделка, крупноформатный керамогранит, открытая кухня с островом. Башня с первоклассными удобствами: тренажёрный зал, терраса, коворкинг и зона барбекю."
    },
    features: ["Gimnasio", "Terraza", "Coworking", "Cocina con isla", "Lavandería", "Balcón", "Seguridad 24hs"],
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
    ],
    tourUrl: "https://my.matterport.com/show/?m=example2",
  },
  {
    id: "4",
    title: {
      es: "PH con Terraza y Parrilla en Belgrano",
      en: "Townhouse with Terrace and Grill in Belgrano",
      ru: "Таунхаус с Террасой и Грилем в Бельграно",
    },
    slug: "ph-terraza-parrilla-belgrano",
    operation: "venta",
    type: "ph",
    zone: "Belgrano",
    address: "Juana Manso 2800",
    price: 380000,
    currency: "USD",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    garage: 1,
    year: 2021,
    featured: false,
    hasVirtualTour: false,
    hasDroneVideo: false,
    description: {
      es: "Hermoso PH en zona residencial de Belgrano. Dos niveles con amplia terraza privada con parrilla. Cocina全mente equipada, pisos de madera y Mucha luz natural. A cuadras de Av. Cabildo y del subte.",
      en: "Beautiful townhouse in residential area of Belgrano. Two levels with spacious private terrace with grill. Fully equipped kitchen, hardwood floors and lots of light. Blocks from Cabildo Ave and subway.",
      ru: "Красивый таунхаус в жилом районе Бельграно. Два уровня с просторной частной террасой с грилем. Полностью оборудованная кухня, деревянные полы и много естественного света. В нескольких кварталах от авеню Кабильдо и метро."
    },
    features: ["Terraza privada", "Parrilla", "Pisos de madera", "Calefacción", "Balcón"],
    images: [
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7c55b8?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "5",
    title: {
      es: "Oficina Corporativa con Vista al Río",
      en: "Corporate Office with River View",
      ru: "Корпоративный Офис с Видом на Реку",
    },
    slug: "oficina-corporativa-vista-rio",
    operation: "alquiler",
    type: "oficina",
    zone: "Puerto Madero",
    address: "Maciel Guerra 450, Piso 10",
    price: 8500,
    currency: "USD",
    bedrooms: 0,
    bathrooms: 2,
    area: 180,
    garage: 2,
    year: 2020,
    featured: false,
    hasVirtualTour: true,
    hasDroneVideo: false,
    description: {
      es: "Oficina corporativa de alta gama con vistas panorámicas al río. Espacios abiertos y privados, sala de reuniones equipada, recepción. Edificio con amenities y seguridad permanente.",
      en: "High-end corporate office with panoramic river views. Open and private spaces, equipped meeting room, reception. Building with amenities and permanent security.",
      ru: "Корпоративный офис высшего класса с панорамным видом на реку. Открытые и закрытые зоны, оборудованная переговорная, ресепшн. Здание с удобствами и круглосуточной охраной."
    },
    features: ["Vista al río", "Recepción", "Sala de reuniones", "Estacionamiento", "Seguridad 24hs", "Aire acondicionado central"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "6",
    title: {
      es: "Casa Campestre con Amplio Terreno",
      en: "Country House with Large Grounds",
      ru: "Загородный Дом с Просторным Участком",
    },
    slug: "casa-campestre-amplio-terreno",
    operation: "venta",
    type: "casa",
    zone: "Vicente López",
    address: "Cerrito 1800",
    price: 720000,
    currency: "USD",
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    garage: 2,
    year: 2019,
    featured: true,
    hasVirtualTour: false,
    hasDroneVideo: true,
    description: {
      es: "Hermosa casa estilo campestre en Vicente López. Terreno de 800m² con amplio parque, pileta y quincho. La casa cuenta con 4 dormitorios, amplios living-comedor y cocina nueva. Zona muy tranquila y segura.",
      en: "Beautiful country-style house in Vicente López. 800m² lot with large garden, pool and BBQ area. The house features 4 bedrooms, spacious living-dining room and new kitchen. Very quiet and safe area.",
      ru: "Красивый дом в стиле кантри в Висенте-Лопес. Участок 800 м² с просторным садом, бассейном и зоной барбекю. Дом с 4 спальнями, просторной гостиной-столовой и новой кухней. Очень тихий и безопасный район."
    },
    features: ["Pileta", "Quincho", "Parque", "Calefacción", "Seguridad", "Parrilla"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "7",
    title: {
      es: "Local Comercial en Av. Principal",
      en: "Commercial Space on Main Avenue",
      ru: "Коммерческое Помещение на Главной Авеню",
    },
    slug: "local-comercial-av-principal",
    operation: "alquiler",
    type: "local",
    zone: "Recoleta",
    address: "Av. Santa Fe 2100",
    price: 5200,
    currency: "USD",
    bedrooms: 0,
    bathrooms: 1,
    area: 95,
    garage: 0,
    year: 2018,
    featured: false,
    hasVirtualTour: false,
    hasDroneVideo: false,
    description: {
      es: "Local comercial en avenida principal de Recoleta. Amplios frentes de vidrio, ideal para retail o gastronomía. Ubicación de alto tránsito peatonal y vehicular.",
      en: "Commercial space on main avenue in Recoleta. Large glass fronts, ideal for retail or gastronomy. High foot and vehicle traffic location.",
      ru: "Коммерческое помещение на главной авеню Реколета. Большие витражные фасады, идеально для ритейла или гастрономии. Место с высокой пешеходной и автомобильной проходимостью."
    },
    features: ["Vidrieras", "Alto tránsito", "Aire acondicionado", "Baño", "Depósito"],
    images: [
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800&fit=crop",
    ],
  },
  {
    id: "8",
    title: {
      es: "Departamento Amoblado en Núñez",
      en: "Furnished Apartment in Núñez",
      ru: "Меблированная Квартира в Нуньесе",
    },
    slug: "departamento-amoblado-nunez",
    operation: "alquiler",
    type: "departamento",
    zone: "Núñez",
    address: "Manuel Gondra 3200, Piso 8",
    price: 3200,
    currency: "USD",
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    garage: 1,
    year: 2023,
    featured: false,
    hasVirtualTour: true,
    hasDroneVideo: false,
    description: {
      es: "Departamento amoblado de alto nivel en Núñez. Totalmente equipado con muebles de diseño y electrodomésticos premium. Excelente ubicación cerca de estación de tren y shoppings.",
      en: "High-end furnished apartment in Núñez. Fully equipped with designer furniture and premium appliances. Excellent location near train station and shopping centers.",
      ru: "Элитная меблированная квартира в Нуньесе. Полностью оборудована дизайнерской мебелью и премиальной бытовой техникой. Отличное расположение рядом с железнодорожной станией и торговыми центрами."
    },
    features: ["Amoblado", "Diseño", "Balcón", "Cochera", "Lavandería", "Seguridad"],
    images: [
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop",
    ],
  },
];
