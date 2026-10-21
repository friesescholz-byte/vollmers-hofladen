/**
 * Standorte & Partner-Verkaufsstellen von Vollmer's Hofladen
 */

export const LOCATIONS = [
  {
    id: 'machtsum-hauptladen',
    isMain: true,
    name: "Vollmer’s SB-Hofladen (Hauptstandort)",
    badge: "Hauptstandort • Eigenes Hofgelände",
    street: "Lindenallee 24",
    zip: "31177",
    town: "Harsum",
    district: "Machtsum",
    addressFull: "Lindenallee 24, 31177 Harsum (OT Machtsum)",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Vollmers+Hofladen+Lindenallee+24+31177+Harsum",
    hoursType: "24/7",
    hoursBadge: "24/7 geöffnet",
    hoursSummary: "Täglich 0:00 – 24:00 Uhr durchgehend",
    description: "Unser eigener 24/7 Selbstbedienungs-Hofladen mit vollem Sortiment: Machtsumer Freilandeier, Duroc-Schweinefleisch, Nudeln, Wurstwaren, Honig und Börde-Spezialitäten.",
    parking: "Kostenlose Parkplätze direkt auf dem Hof vorhanden",
    phone: "0176 21006452",
    email: "info@vollmers-hofladen.de"
  },
  {
    id: 'naturhof-aue',
    isMain: false,
    name: "Naturhof Heinrich Aue",
    badge: "Partner-Verkaufsstelle",
    street: "Am Stapel 1",
    zip: "31177",
    town: "Harsum",
    district: "Hüddessum",
    addressFull: "Am Stapel 1, 31177 Harsum / Hüddessum",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Am+Stapel+1+31177+Harsum",
    hoursType: "24/7",
    hoursBadge: "24/7 geöffnet",
    hoursSummary: "Rund um die Uhr geöffnet (Selbstbedienung)",
    description: "Ausgewählte Vollmer’s Hofladen-Waren und frische Freilandeier im SB-Verkauf."
  },
  {
    id: 'gruenzeug-adlum',
    isMain: false,
    name: "Grünzeug Machtsum (SB Laden Adlum)",
    badge: "Partner-Verkaufsstelle",
    street: "Brinkstraße 1",
    zip: "31177",
    town: "Harsum",
    district: "Adlum",
    addressFull: "Brinkstraße 1, 31177 Harsum / Adlum",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Brinkstra%C3%9Fe+1+31177+Harsum",
    hoursType: "24/7",
    hoursBadge: "24/7 geöffnet",
    hoursSummary: "Rund um die Uhr geöffnet (Selbstbedienung)",
    description: "Frische Hofladen-Erzeugnisse von Vollmer’s im SB-Laden in Adlum."
  },
  {
    id: 'gaertnerei-lehnhoff',
    isMain: false,
    name: "Genussgärtnerei Lehnhoff",
    badge: "Partner-Verkaufsstelle",
    street: "Karrenweg 1",
    zip: "31141",
    town: "Hildesheim",
    district: "",
    addressFull: "Karrenweg 1, 31141 Hildesheim",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Karrenweg+1+31141+Hildesheim",
    hoursType: "regular",
    hoursBadge: "Di–Fr 09:00–18:00 • Sa 09:00–16:00",
    hoursSummary: "Dienstag bis Samstag geöffnet",
    description: "Hochwertige Gärtnerei und Genussmarkt mit ausgewählten Spezialitäten aus unserem Hofladen.",
    schedule: [
      { days: "Dienstag – Freitag", time: "09:00 – 18:00 Uhr" },
      { days: "Samstag", time: "09:00 – 16:00 Uhr" },
      { days: "Sonntag & Montag", time: "Geschlossen" }
    ]
  },
  {
    id: 'dorfladen-luehnde',
    isMain: false,
    name: "Dorfladen Lühnde",
    badge: "Partner-Verkaufsstelle",
    street: "Hauptstraße 18",
    zip: "31191",
    town: "Algermissen",
    district: "Lühnde",
    addressFull: "Hauptstraße 18, 31191 Algermissen / Lühnde",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Hauptstra%C3%9Fe+18+31191+Algermissen",
    hoursType: "regular",
    hoursBadge: "Di–Fr (vormittags & nachmittags)",
    hoursSummary: "Dienstag bis Freitag geöffnet",
    description: "Gemütlicher Dorfladen mit regionalen Erzeugnissen und frischen Eiern aus Machtsum.",
    schedule: [
      { days: "Dienstag", time: "07:00 – 11:00 Uhr" },
      { days: "Mittwoch", time: "07:00 – 11:00 & 14:00 – 18:00 Uhr" },
      { days: "Donnerstag", time: "07:00 – 11:00 Uhr" },
      { days: "Freitag", time: "07:00 – 11:00 & 14:00 – 18:00 Uhr" },
      { days: "Samstag, Sonntag & Montag", time: "Geschlossen" }
    ]
  }
];
