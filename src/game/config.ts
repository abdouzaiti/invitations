/**
 * GAME_CONFIG
 * Customize the personal details, dialogues, memory photos, and date info here.
 * This is designed so anyone can replace photos, names, and texts easily!
 */

export interface Memory {
  id: string;
  title: string;
  text: string;
  image: string; // Absolute path or URL (can be a fallback placeholder)
  date?: string;
  hint: string;
}

export interface GamePersonalization {
  targetName: string;      // The person being asked on the date
  senderName: string;      // Your name
  companionName: string;   // The companion NPC name in the game
  dateInfo: {
    date: string;          // e.g., "Next Saturday, Sept 26th"
    time: string;          // e.g., "2:00 PM"
    meetingPoint: string;  // e.g., "Cozy Coffee House"
  };
  dialogues: {
    guideIntro: string[];
    travelerTips: string[];
    mechanicClues: string[];
    motorcycleFound: string[];
    finalMeeting: string[];
  };
}

export const ROMANTIC_COLORS = {
  blushPink: "#fce7f3",
  pastelPink: "#fbcfe8",
  rosePink: "#f472b6",
  dustyRose: "#db2777",
  softLavender: "#e9d5ff",
  cream: "#fffbeb",
  warmWhite: "#fffdf0",
  deepBurgundy: "#881337",
  darkPlum: "#4a044e"
};

export const GAME_CONFIG: GamePersonalization & { memories: Memory[] } = {
  targetName: "Sarah", // Change this to her name!
  senderName: "Abdou",  // Abdou waits at the end with the bike!
  companionName: "Abdou",
  
  dateInfo: {
    date: "Next Saturday Afternoon",
    time: "2:00 PM",
    meetingPoint: "Your Place (I'll bring the extra helmet!)",
  },

  memories: [
    {
      id: "memory01",
      title: "The First Spark",
      text: "Some moments start small, but they stay with you forever. That first coffee, the endless talking, and the warmth of a smile.",
      image: "/End1.png",
      date: "Springtime",
      hint: "Hidden near the ancient oak tree in the village."
    },
    {
      id: "memory02",
      title: "Shared Laughs",
      text: "A picture captures a second, but the feeling of laughing until our stomachs hurt lasts a lifetime.",
      image: "/End2.png",
      date: "Summer Night",
      hint: "Tucked away inside the secret flower clearing."
    },
    {
      id: "memory03",
      title: "Cozy Getaways",
      text: "Getting lost together is always better than finding the way alone. The world fades when we explore.",
      image: "/End3.png",
      date: "A Sunny Afternoon",
      hint: "Found sitting quietly by the benches on the old road."
    },
    {
      id: "memory04",
      title: "The Quiet Moments",
      text: "No plans, no rush. Just sharing a silence that feels completely comfortable and full of unspoken words.",
      image: "/End4.png",
      date: "Autumn Sunset",
      hint: "Lying amidst old tools inside the mysterious garage."
    }
  ],

  dialogues: {
    guideIntro: [
      "wech hanene cv",
      "chaki diri hna?",
      "BTW abdou rah yhawes 3lik",
      "kayn 4 photos memories galek majich bla bihom ana ghadi n3awnek",
      "kol chapter fih memories ki tkamlihom yeteftah lbab w tigi tkmli",
      "cbn bzef 3lik rohi et bon courage"
    ],
    travelerTips: [
      "wee hanene halbina",
      "malki t3almti tjri chwia weliti tetkabri 3lina",
      "...elmohim abdou gali nsa l casque lahmar w mafatih rahom tayhin bera hawsi 3lihom w dihomlah m3ak",
      "3labali raki thawsi 3lih",
      "rah y9ara3lek f trig stidia kmli direct twesli",
      "good luck"
    ],
    mechanicClues: [
      "hanene kiraki bnti",
      "raki thawsi 3la abdou bayna wah 👀🤣😏",
      "habeltiiiih bach yersalhalk dork",
      "rahi 4 ta3 sbah ykteblk fiha hhh",
      "ma3lich rohit direct tel9yeh y9are3lek",
      "aya good luck"
    ],
    motorcycleFound: [
      "So... you found it.",
      "The dust settles on a beautiful machine, ready to fly.",
      "You've collected memories, followed the long road, and now you have the key.",
      "There's only one path left to take.",
      "Follow the mountain road east. Someone is waiting for you at the overlook."
    ],
    finalMeeting: [
      "oooh alhamdulilah",
      "ta2 mn wintaaa rani n9are3lk welaa , win konti",
      "ma3lich très bien jebti lmfatih wl casque ta3k",
      "sema moh w farouk daro li 3lihom",
      "lmohim will you be my back pack....?"
    ]
  }
};
