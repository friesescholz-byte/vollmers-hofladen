import { MEDIA } from './media.js';

export const CATEGORIES = [
  { id: 'all', label: 'Gesamtes Sortiment' },
  { id: 'eier-nudeln', label: 'Eier, Nudeln & Likör' },
  { id: 'fleisch-gefluegel', label: 'Duroc & Freilandgeflügel' },
  { id: 'frisch-feinkost', label: 'Frischgemüse & Feinkost' },
  { id: 'partner', label: 'Regionale Partner' },
];

export const PRODUCTS = [
  {
    id: 'freilandeier',
    name: 'Machtsumer Freilandeier',
    category: 'eier-nudeln',
    unit: '10er Pack / 1 kg Box',
    image: MEDIA.prodEggsCarton,
    badge: 'Aus eigenem Hühnermobil',
    description: 'Täglich frisch von unseren rund 400 Legehennen aus mobiler Weidehaltung. Durch die ständige Versorgung mit frischem Gras besitzen unsere Eier eine kräftig gelbe Dotterfarbe und erstklassigen Geschmack.',
    details: [
      'Größen M, L und XL stets im Hofladen verfügbar',
      'Saisonal Junghennen-Eier (Größe S in der praktischen 1 kg Box)',
      '100 % gentechnikfreie Fütterung und freier Wiesenauslauf'
    ],
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    preorderUrl: null,
  },
  {
    id: 'spirelli-nudeln',
    name: 'Machtsumer Freiland-Spirelli',
    category: 'eier-nudeln',
    unit: '500 g Beutel',
    image: MEDIA.prodPastaSpirelli,
    badge: '35 % Eigehalt',
    description: 'Traditionell handwerklich hergestellte Eiernudeln mit unseren eigenen Freilandeiern aus dem Hühnermobil. Veredelt in einem kleinen Handwerksbetrieb in der Region Hannover.',
    details: [
      'Zutaten: Hartweizengrieß, 35 % frisches Voll-Ei',
      'Kochzeit: ca. 8 Minuten – bissfest und saucesaugend',
      'Verschiedene Ausformungen (Spirelli, Bandnudeln, etc.)'
    ],
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    preorderUrl: null,
  },
  {
    id: 'eierlikoer',
    name: 'Machtsumer Eierlikör-Kreationen',
    category: 'eier-nudeln',
    unit: '0,35 l Flasche (14 % vol)',
    image: MEDIA.prodEggLiqueur,
    badge: 'Mit 25 % frischer Sahne',
    description: 'Cremig gerührt mit unseren eigenen Freilandeiern und feiner Sahne im Eichsfeld. Ein samtiger Hochgenuss nach traditioneller Rezeptur in den Sorten Klassisch, Schoko und Kaffee.',
    details: [
      'Sorten: Klassisch Gelb, Schoko, Kaffee',
      'Alkoholgehalt: 14 % vol',
      'Wegen Jugendschutzgesetz online vorbestellbar oder auf Anfrage'
    ],
    availability: 'Online vorbestellbar / Abholung',
    preorderUrl: 'https://vollmers-hofladen.friedhold.de',
  },
  {
    id: 'duroc-schwein',
    name: 'Duroc-Weideschwein & Hof-Wurst',
    category: 'fleisch-gefluegel',
    unit: 'im Glas (160 g) / Frischfleisch nach Teilstück',
    image: MEDIA.prodDurocPasture,
    badge: 'Freilandhaltung & Strohbett',
    description: 'Unsere reinrassigen Duroc-Schweine wachsen im Freiland mit Stroh-Einstreu und täglichem Weidegang langsam auf ca. 150 kg heran. Gefüttert mit eigenem Getreide und Ackerbohnen.',
    details: [
      'Hausgemachte Wurst im Glas (160 g): Leberwurst, Mettwurst, Sülze',
      'Frischfleisch (Koteletts, Braten, Nacken, Ribs) an festen Schlachttagen',
      'Schlachtung und Zerlegung beim Meister-Landschlachter in Sehnde'
    ],
    availability: 'Wurst im SB-Laden • Frischfleisch auf Vorbestellung',
    preorderUrl: 'https://vollmers-hofladen.friedhold.de',
  },
  {
    id: 'weidehaehnchen',
    name: 'Machtsumer Weidehähnchen',
    category: 'fleisch-gefluegel',
    unit: 'Ganzes Hähnchen / Teilstücke',
    image: MEDIA.prodGrilledChicken,
    badge: 'Langsame Weidemast',
    description: 'Masthähnchen aus echter Freilandhaltung mit Zugang zu grünem Gras und Sonne. Das Fleisch zeichnet sich durch unvergleichliche Saftigkeit, feine Faserung und kernigen Biss aus.',
    details: [
      'Frisch an ausgewählten Terminen zur Abholung bereit',
      'Tiefgekühlt im SB-Hofladen verfügbar (solange Vorrat reicht)',
      'Ideal für Sonntagsbraten, Ofengerichte oder knusprig vom Grill'
    ],
    availability: 'Frisch auf Vorbestellung • Tiefgekühlt im SB-Laden',
    preorderUrl: 'https://vollmers-hofladen.friedhold.de',
  },
  {
    id: 'suppenhuhn',
    name: 'Machtsumer Freiland-Suppenhuhn',
    category: 'fleisch-gefluegel',
    unit: 'Küchenfertig vorbereitet',
    image: MEDIA.prodSoupChicken,
    badge: 'Ideal für echte Brühen',
    description: 'Das Geheimnis einer wärmenden, goldgelben Hühnersuppe wie bei Oma. Unsere Suppenhühner sind aromatisch, nährstoffreich und sorgen für eine kräftige Bouillon.',
    details: [
      'Küchenfertig ausgenommen und gereinigt',
      'Perfekt für Hühnersuppe mit Gemüse und Spirelli-Einlage',
      'Frisch an Terminen oder tiefgekühlt im Hofladen'
    ],
    availability: 'Im SB-Laden (Gefriertruhe) & auf Vorbestellung',
    preorderUrl: 'https://vollmers-hofladen.friedhold.de',
  },
  {
    id: 'harsumer-honig',
    name: 'Harsumer Imkerhonig (Sommertracht)',
    category: 'partner',
    unit: '250 g & 500 g Glas',
    image: MEDIA.prodHoney,
    badge: 'Imkerei Benjamin Krage',
    description: 'Reiner Bienenhonig aus der direkten Nachbarschaft. Imker Benjamin Krage stellt seine Völker an den blühenden Wiesen und Ackerrändern von Harsum und Machtsum auf.',
    details: [
      'Erhältlich im 250 g und 500 g Glas',
      'Kaltgeschleudert und naturbelassen',
      'Feincremige Konsistenz mit vielschichtigem Blütenaroma'
    ],
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    preorderUrl: null,
  },
  {
    id: 'bio-kartoffeln',
    name: 'Bio-Speisekartoffeln',
    category: 'partner',
    unit: 'Papiersack (2,5 kg / 5 kg)',
    image: MEDIA.prodPotatoes,
    badge: 'Hof Aue, Hüddessum',
    description: 'Knollige Bio-Kartoffeln vom renommierten Hof Aue aus dem benachbarten Hüddessum. Auf den besten Bördeböden herangereift – festkochend oder vorwiegend festkochend.',
    details: [
      'Aus zertifiziertem ökologischem Anbau in der Börde',
      'In atmungsaktiven Papiersäcken gelagert',
      'Hervorragender Geschmack für Bratkartoffeln, Püree oder Ofenkartoffeln'
    ],
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    preorderUrl: null,
  },
  {
    id: 'bauernbrot-backmischung',
    name: 'Bauernbrot-Backmischung (1.000 g)',
    category: 'partner',
    unit: '1.000 g Packung (ergibt 2 Brote)',
    image: MEDIA.prodBreadBakingMix,
    badge: 'Back mal! Einbeck seit 1970',
    description: 'Frisch gebackenes Brot in Profi-Bäckerqualität für zu Hause. Hergestellt mit besten Getreidezutaten aus Südniedersachsen. Nur noch Hefe und Wasser hinzugeben.',
    details: [
      'Für 2 herrlich duftende Weizenmischbrote',
      'Traditionelle Mühlentradition aus Einbeck',
      'Gelingt im Ofen oder im Brotbackautomaten'
    ],
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    preorderUrl: null,
  },
  {
    id: 'bunte-tomaten',
    name: 'Bunte Ernte-Snacktomaten',
    category: 'frisch-feinkost',
    unit: 'Pappschale (ca. 250 g)',
    image: MEDIA.prodTomatoes,
    badge: 'Sonnengereift & Süß',
    description: 'Eine bunte Auswahl an gelben Datteltomaten, roten Kirschtomaten und dunklen aromatischen Sorten. Knackig, zuckersüß und purer Sommergeschmack.',
    details: [
      'Täglich frisch handgeerntet',
      'Umweltfreundlich verpackt in Pappschalen',
      'Perfekt als gesunder Snack oder für frische Salate'
    ],
    availability: 'Saisonal im 24/7 SB-Laden',
    preorderUrl: null,
  },
  {
    id: 'salatgurken',
    name: 'Knackige Freiland-Salatgurken',
    category: 'frisch-feinkost',
    unit: 'pro Stück',
    image: MEDIA.prodCucumbers,
    badge: 'Erntefrisch',
    description: 'Saftig-frische Gurken mit dünner Schale und intensivem Aroma. Ohne weite Transportwege direkt vom Feld in das Hofladenregal.',
    details: [
      'Unbehandelte Schale, essfertig',
      'Hoher Wassergehalt, pure Erfrischung',
      'Perfekt für Gurkensalat mit Dill und saurer Sahne'
    ],
    availability: 'Saisonal im 24/7 SB-Laden',
    preorderUrl: null,
  },
  {
    id: 'cornichons',
    name: 'Cornichons im Gewürzaufguss',
    category: 'frisch-feinkost',
    unit: '430 g Glas (EW 260 g)',
    image: MEDIA.prodCornichons,
    badge: 'Eichsfeldgenuss',
    description: 'Knackig-würzige Mini-Gurken von Doris Burchard aus Seulingen. Fein abgeschmeckt mit Zwiebeln, Dill, Senfsaat und mildem Essig.',
    details: [
      'Handwerkliche Manufakturware aus Niedersachsen',
      'Herrliche Beilage zur zünftigen Hof-Brotzeit',
      'Frei von künstlichen Konservierungsstoffen'
    ],
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    preorderUrl: null,
  },
  {
    id: 'fruchtaufstriche',
    name: 'Hausgemachte Fruchtaufstriche',
    category: 'frisch-feinkost',
    unit: '220 g Glas',
    image: MEDIA.prodFruitJams,
    badge: 'Eichsfeldgenuss Manufaktur',
    description: 'Fruchtige Marmeladen und Gelees mit hohem Fruchtanteil: Sanddorn-Birne, Erdbeer-Limetten-Gelee oder feine Kirsche mit einem Schuss Malibu.',
    details: [
      'Mit sonnengereiften Früchten schonend eingekocht',
      'Sorten: Sanddorn-Birne, Erdbeer-Limette, Kirsch-Malibu',
      'Ideal für Sonntagsbrötchen und Süßspeisen'
    ],
    availability: 'Stets im 24/7 SB-Hofladen vorrätig',
    preorderUrl: null,
  },
];
